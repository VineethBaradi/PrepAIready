
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Award, Check, AlertTriangle } from 'lucide-react';
import { analyzeInterviewResponses } from '@/services/aiService';
import Button from './Button';
import { toast } from '@/components/ui/use-toast';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        const questionsJSON = sessionStorage.getItem('interviewQuestions');
        const answersJSON = sessionStorage.getItem('interviewAnswers');
        const jobRole = sessionStorage.getItem('jobRole');
        const resume = sessionStorage.getItem('resume');
        
        if (!questionsJSON || !answersJSON || !jobRole || !resume) {
          toast({
            title: "Missing interview data",
            description: "Interview data is missing. Please complete an interview first.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        const questions = JSON.parse(questionsJSON);
        const answers = JSON.parse(answersJSON);
        
        const result = await analyzeInterviewResponses(
          questions,
          answers,
          jobRole,
          resume
        );
        
        setFeedback(result);
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
          <p className="text-lg">Analyzing your interview performance...</p>
        </div>
      </div>
    );
  }
  
  // Render feedback with proper formatting
  const renderFeedback = () => {
    if (!feedback) return null;
    
    // Split the feedback into sections and paragraphs
    return feedback.split('\n\n').map((paragraph, index) => {
      // Check if this paragraph is a heading
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
          Start New Interview
        </Button>
        
        <div className="glass-card animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-medium">Your Interview Feedback</h2>
              <p className="text-muted-foreground">
                Here's a detailed analysis of your interview performance
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {renderFeedback()}
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleNewInterview}
            >
              Start Another Practice Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
