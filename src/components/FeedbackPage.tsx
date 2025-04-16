import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Award, Check, AlertTriangle, BarChart4, LineChart, Code, MessageSquare } from 'lucide-react';
import { analyzeInterviewResponses } from '@/services/aiService';
import { Button } from './ui/button';
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
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '@/lib/utils';

interface Evaluation {
  score: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  detailedFeedback?: {
    score: number;
    explanation: string;
    technicalAccuracy?: number;
    clarity?: number;
    completeness?: number;
  };
}

interface QuestionFeedback {
  question: string;
  answer: string;
  code?: string;
  evaluation: Evaluation;
}

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionFeedback, setQuestionFeedback] = useState<QuestionFeedback[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const generateFeedback = async () => {
      try {
        const [questionsJSON, answersJSON, evaluationsJSON, resume, jobDescription] = [
          sessionStorage.getItem('interviewQuestions'),
          sessionStorage.getItem('interviewAnswers'),
          sessionStorage.getItem('interviewEvaluations'),
          sessionStorage.getItem('resume'),
          sessionStorage.getItem('jobDescription')
        ];
        
        if (!questionsJSON || !answersJSON || !resume || !jobDescription) {
          toast({
            title: "Missing interview data",
            description: "Interview data is missing. Please complete an interview first.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        const [questionsList, answersList] = [
          JSON.parse(questionsJSON),
          JSON.parse(answersJSON)
        ];
        
        setQuestions(questionsList);
        setAnswers(answersList);
        
        if (evaluationsJSON) {
          const parsedEvaluations = JSON.parse(evaluationsJSON);
          const validEvaluations = parsedEvaluations.filter(
            item => item && typeof item === 'object' && item.score !== undefined
          );
          setEvaluations(validEvaluations);
        }
        
        const result = await analyzeInterviewResponses({
          questions: questionsList,
          answers: answersList,
          resume,
          jobDescription
        });
        
        setFeedback(result);
        
        const scoreMatch = result.match(/overall score:?\s*(\d+)/i);
        if (scoreMatch?.[1]) {
          setOverallScore(parseInt(scoreMatch[1], 10));
        }

        // Prepare question feedback data
        const feedbackData = questionsList.map((question: string, index: number) => ({
          question,
          answer: answersList[index] || "No answer provided",
          code: sessionStorage.getItem(`code_${index}`),
          evaluation: evaluations[index] || { score: 0, feedback: "No evaluation available" }
        }));
        
        setQuestionFeedback(feedbackData);
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
  
  const getScoreLabel = (score: number): string => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl w-full mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={handleNewInterview}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Start New Interview
        </Button>
        
        <div className="space-y-8">
          {/* Overall Performance Card */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium">Interview Performance Summary</h2>
                  <p className="text-muted-foreground">
                    {/* {jobRole} Interview Analysis */}
                  </p>
                </div>
              </div>
              
              {overallScore !== null && (
                <div className="md:ml-auto">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className={cn("text-4xl font-bold", getScoreColorClass(overallScore / 10))}>
                          {overallScore}
                        </p>
                        <p className="text-sm text-muted-foreground">/100</p>
                      </div>
                      <p className={cn("text-sm font-medium", getScoreColorClass(overallScore / 10))}>
                        {getScoreLabel(overallScore / 10)}
                      </p>
                    </div>
                    <div className="w-48">
                      <Progress 
                        value={overallScore} 
                        className={cn("h-2", getScoreBackgroundClass(overallScore / 10))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Detailed Feedback */}
          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="questions">Question-by-Question</TabsTrigger>
              <TabsTrigger value="summary">Overall Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {questionFeedback.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{item.question}</h3>
                        
                        <Tabs defaultValue="answer" className="mt-4">
                          <TabsList>
                            <TabsTrigger value="answer" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Answer
                            </TabsTrigger>
                            {item.code && (
                              <TabsTrigger value="code" className="flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                Code
                              </TabsTrigger>
                            )}
                          </TabsList>

                          <TabsContent value="answer">
                            <div className="mt-4 p-4 bg-muted/50 rounded-md">
                              <p className="text-sm text-muted-foreground mb-2">Your Answer:</p>
                              <p className="text-sm">{item.answer}</p>
                            </div>
                          </TabsContent>

                          {item.code && (
                            <TabsContent value="code">
                              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                                <p className="text-sm text-muted-foreground mb-2">Your Code:</p>
                                <pre className="text-sm font-mono bg-background p-4 rounded-md overflow-x-auto">
                                  {item.code}
                                </pre>
                              </div>
                            </TabsContent>
                          )}
                        </Tabs>

                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Score:</span>
                              <span className={cn(
                                "text-sm font-bold",
                                getScoreColorClass(item.evaluation.detailedFeedback?.score || item.evaluation.score)
                              )}>
                                {(item.evaluation.detailedFeedback?.score || item.evaluation.score)}/10
                              </span>
                              <span className={cn(
                                "text-xs font-medium",
                                getScoreColorClass(item.evaluation.detailedFeedback?.score || item.evaluation.score)
                              )}>
                                ({getScoreLabel(item.evaluation.detailedFeedback?.score || item.evaluation.score)})
                              </span>
                            </div>
                            <Progress 
                              value={(item.evaluation.detailedFeedback?.score || item.evaluation.score) * 10} 
                              className={cn("h-2 flex-1", getScoreBackgroundClass(item.evaluation.detailedFeedback?.score || item.evaluation.score))}
                            />
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="p-4 bg-muted/50 rounded-md">
                              <h4 className="text-sm font-medium mb-2">Detailed Feedback:</h4>
                              {item.evaluation.detailedFeedback ? (
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">{item.evaluation.detailedFeedback.explanation}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {item.evaluation.detailedFeedback.technicalAccuracy !== undefined && (
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-medium">Technical Accuracy</span>
                                          <span className="text-xs">{item.evaluation.detailedFeedback.technicalAccuracy}/10</span>
                                        </div>
                                        <Progress 
                                          value={item.evaluation.detailedFeedback.technicalAccuracy * 10} 
                                          className="h-1"
                                        />
                                      </div>
                                    )}
                                    
                                    {item.evaluation.detailedFeedback.clarity !== undefined && (
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-medium">Clarity</span>
                                          <span className="text-xs">{item.evaluation.detailedFeedback.clarity}/10</span>
                                        </div>
                                        <Progress 
                                          value={item.evaluation.detailedFeedback.clarity * 10} 
                                          className="h-1"
                                        />
                                      </div>
                                    )}
                                    
                                    {item.evaluation.detailedFeedback.completeness !== undefined && (
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-medium">Completeness</span>
                                          <span className="text-xs">{item.evaluation.detailedFeedback.completeness}/10</span>
                                        </div>
                                        <Progress 
                                          value={item.evaluation.detailedFeedback.completeness * 10} 
                                          className="h-1"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">{item.evaluation.feedback}</p>
                              )}
                            </div>

                            {item.evaluation.strengths && item.evaluation.strengths.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Strengths:</h4>
                                {item.evaluation.strengths.map((strength, i) => (
                                  <div key={i} className="flex gap-2 items-start">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{strength}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {item.evaluation.improvements && item.evaluation.improvements.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Areas for Improvement:</h4>
                                {item.evaluation.improvements.map((improvement, i) => (
                                  <div key={i} className="flex gap-2 items-start">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{improvement}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.code && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Code Analysis:</h4>
                                <div className="p-4 bg-muted/50 rounded-md">
                                  <pre className="text-sm font-mono bg-background p-4 rounded-md overflow-x-auto">
                                    {item.code}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="summary">
              <Card className="p-6">
                <div className="prose prose-sm max-w-none">
                  {feedback.split('\n\n').map((paragraph, index) => {
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
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
