
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInterviewQuestions } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';

interface UseInterviewQuestionsReturn {
  questions: string[];
  answers: string[];
  evaluations: Array<{score: number; feedback: string}>;
  isLoading: boolean;
  usingFallbackQuestions: boolean;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Array<{score: number; feedback: string}>>>;
}

export const useInterviewQuestions = (): UseInterviewQuestionsReturn => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Array<{score: number; feedback: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackQuestions, setUsingFallbackQuestions] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuestions = async () => {
      const resumeContent = sessionStorage.getItem('resume');
      const jobRole = sessionStorage.getItem('jobRole');
      
      if (!resumeContent || !jobRole) {
        toast({
          title: "Missing information",
          description: "Please upload a resume and select a job role first.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      try {
        const generatedQuestions = await generateInterviewQuestions({
          resume: resumeContent,
          jobRole: jobRole,
          count: 8
        });
        
        setQuestions(generatedQuestions);
        setAnswers(new Array(generatedQuestions.length).fill(''));
        setEvaluations(new Array(generatedQuestions.length).fill({ score: 0, feedback: '' }));
      } catch (error) {
        console.error("Failed to generate questions:", error);
        setUsingFallbackQuestions(true);
        toast({
          title: "Error generating questions",
          description: "There was a problem generating your interview questions. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [navigate]);
  
  return {
    questions,
    answers,
    evaluations,
    isLoading,
    usingFallbackQuestions,
    setAnswers,
    setEvaluations
  };
};
