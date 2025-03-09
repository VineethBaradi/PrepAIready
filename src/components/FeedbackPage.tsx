import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Award, Check, AlertTriangle, BarChart4, LineChart } from 'lucide-react';
import { analyzeInterviewResponses } from '@/services/aiService';
import Button from './Button';
import { toast } from '@/components/ui/use-toast';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Array<{score: number; feedback: string}>>([]);
  const [jobRole, setJobRole] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        const questionsJSON = sessionStorage.getItem('interviewQuestions');
        const answersJSON = sessionStorage.getItem('interviewAnswers');
        const evaluationsJSON = sessionStorage.getItem('interviewEvaluations');
        const role = sessionStorage.getItem('jobRole');
        const resume = sessionStorage.getItem('resume');
        
        if (!questionsJSON || !answersJSON || !role || !resume) {
          toast({
            title: "Missing interview data",
            description: "Interview data is missing. Please complete an interview first.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setJobRole(role);
        
        const questions = JSON.parse(questionsJSON);
        const answers = JSON.parse(answersJSON);
        
        if (evaluationsJSON) {
          setEvaluations(JSON.parse(evaluationsJSON));
        }
        
        const result = await analyzeInterviewResponses(
          questions,
          answers,
          role,
          resume
        );
        
        setFeedback(result);
        
        const scoreMatch = result.match(/overall score:?\s*([0-9]+)/i);
        if (scoreMatch && scoreMatch[1]) {
          setOverallScore(parseInt(scoreMatch[1], 10));
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        setFeedback("We encountered an error while generating your feedback. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    generateFeedback();
  }, [navigate]);
  
  const handleNewInterview = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Analyzing your data interview performance...</p>
        </div>
      </div>
    );
  }
  
  const averageScore = evaluations.length > 0 
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length
    : 0;
  
  const renderFeedback = () => {
    if (!feedback) return null;
    
    return feedback.split('\n\n').map((paragraph, index) => {
      const isHeading = paragraph.startsWith('#') || 
                        (/^[A-Z][\w\s]+:$/.test(paragraph)) || 
                        paragraph.length < 50 && paragraph.toUpperCase() === paragraph;
      
      return isHeading ? (
        <h3 key={index} className="text-lg font-medium mt-6 mb-2">
          {paragraph.replace(/^#\s*/, '')}
        </h3>
      ) : (
        <p key={index} className="mb-4 text-muted-foreground">
          {paragraph}
        </p>
      );
    });
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl w-full mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={handleNewInterview}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Start New Data Interview
        </Button>
        
        <div className="glass-card animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart4 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-medium">Your {jobRole} Interview Feedback</h2>
              <p className="text-muted-foreground">
                Detailed analysis of your technical data interview performance
              </p>
            </div>
            
            {overallScore !== null && (
              <div className="md:ml-auto p-3 bg-primary/10 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className="text-2xl font-bold text-primary">{overallScore}/100</p>
                </div>
              </div>
            )}
          </div>
          
          {evaluations.length > 0 && (
            <div className="mb-8 p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Question-by-Question Performance</h3>
              </div>
              <div className="space-y-3">
                {evaluations.map((evaluation, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${evaluation.score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium">{evaluation.score}/10</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="font-medium">{averageScore.toFixed(1)}/10</span>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {renderFeedback()}
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleNewInterview}
            >
              Practice Another Data Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
