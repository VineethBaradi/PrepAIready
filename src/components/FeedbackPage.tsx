import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Award, Check, AlertTriangle, BarChart4, LineChart } from 'lucide-react';
import { analyzeInterviewResponses } from '@/services/aiService';
import Button from './Button';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Array<{score: number; feedback: string}>>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
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
        
        const questionsList = JSON.parse(questionsJSON);
        const answersList = JSON.parse(answersJSON);
        setQuestions(questionsList);
        setAnswers(answersList);
        
        if (evaluationsJSON) {
          const parsedEvaluations = JSON.parse(evaluationsJSON);
          const validEvaluations = parsedEvaluations.filter(item => item && typeof item === 'object' && item.score !== undefined);
          setEvaluations(validEvaluations);
        }
        
        const result = await analyzeInterviewResponses(
          questionsList,
          answersList,
          role,
          resume
        );
        
        setFeedback(result);
        
        const scoreMatch = result.match(/overall score:?\s*(\d+)/i);
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
  
  const validEvaluations = evaluations.filter(e => e && typeof e === 'object' && typeof e.score === 'number');
  const averageScore = validEvaluations.length > 0 
    ? validEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / validEvaluations.length
    : 0;
  
  const getScoreColorClass = (score: number): string => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-amber-600";
    return "text-red-600";
  };
  
  const getScoreBackgroundClass = (score: number): string => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const renderFeedback = () => {
    if (!feedback) return null;
    
    return feedback.split('\n\n').map((paragraph, index) => {
      const isHeading = paragraph.startsWith('#') || 
                        (/^[A-Z][\w\s]+:$/.test(paragraph)) || 
                        paragraph.length < 50 && paragraph.toUpperCase() === paragraph;
      
      const isListItem = paragraph.match(/^\d+\.\s/) || paragraph.match(/^\*\s/) || paragraph.match(/^-\s/);
      
      if (isHeading) {
        return (
          <h3 key={index} className="text-lg font-medium mt-6 mb-3 text-primary">
            {paragraph.replace(/^#+\s*/, '')}
          </h3>
        );
      } else if (isListItem) {
        return (
          <div key={index} className="mb-2 pl-4 border-l-2 border-primary/20">
            <p className="text-muted-foreground">{paragraph}</p>
          </div>
        );
      } else {
        return (
          <p key={index} className="mb-4 text-muted-foreground">
            {paragraph}
          </p>
        );
      }
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
              <div className="md:ml-auto p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/10">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className={cn("text-3xl font-bold", getScoreColorClass(overallScore / 10))}>
                      {overallScore}
                    </p>
                    <p className="text-sm text-muted-foreground">/100</p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className={cn("h-2 rounded-full", getScoreBackgroundClass(overallScore / 10))}
                      style={{ width: `${overallScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {validEvaluations.length > 0 && questions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Question-by-Question Feedback</h3>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-20 text-center">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => {
                      const evaluation = evaluations[index];
                      const hasValidEvaluation = evaluation && typeof evaluation === 'object' && typeof evaluation.score === 'number';
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{question}</p>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Your answer:</p>
                              <p className="text-sm text-muted-foreground">{answers[index] || "No answer provided"}</p>
                              
                              {hasValidEvaluation && evaluation.feedback && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                  <p className="text-xs font-medium mb-1">Feedback:</p>
                                  <div className="text-sm">
                                    {evaluation.score >= 8 ? (
                                      <div className="flex gap-2 items-start mb-1.5">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                        <p>
                                          <span className="font-medium">Strengths:</span>{" "}
                                          {evaluation.feedback.split('.')[0]}.
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 items-start mb-1.5">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                        <p>
                                          <span className="font-medium">Areas for improvement:</span>{" "}
                                          {evaluation.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {hasValidEvaluation ? (
                              <div className="flex flex-col items-center">
                                <span className={cn("font-medium", getScoreColorClass(evaluation.score))}>
                                  {evaluation.score}/10
                                </span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full mt-1.5">
                                  <div
                                    className={cn("h-2 rounded-full", getScoreBackgroundClass(evaluation.score))}
                                    style={{ width: `${evaluation.score * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", getScoreColorClass(averageScore))}>
                    {averageScore.toFixed(1)}/10
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      className={cn("h-2 rounded-full", getScoreBackgroundClass(averageScore))}
                      style={{ width: `${averageScore * 10}%` }}
                    ></div>
                  </div>
                </div>
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
