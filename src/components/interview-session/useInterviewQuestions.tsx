import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInterviewQuestions } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';

interface Evaluation {
  score: number;
  feedback: string;
}

interface UseInterviewQuestionsReturn {
  questions: string[];
  answers: string[];
  evaluations: Evaluation[];
  isLoading: boolean;
  usingFallbackQuestions: boolean;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
}

export const useInterviewQuestions = (): UseInterviewQuestionsReturn => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackQuestions, setUsingFallbackQuestions] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuestions = async () => {
      const [resumeContent, jobDescription] = [
        sessionStorage.getItem('resume'),
        sessionStorage.getItem('jobDescription')
      ];
      
      if (!resumeContent || !jobDescription) {
        toast({
          title: "Missing information",
          description: "Please upload a resume and provide a job description first.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      try {
        const generatedQuestions = await generateInterviewQuestions({
          resume: resumeContent,
          jobDescription,
          count: Math.floor(Math.random() * (15 - 12 + 1)) + 12
        });
        
        const emptyEvaluation: Evaluation = { score: 0, feedback: '' };
        
        setQuestions(generatedQuestions);
        setAnswers(Array(generatedQuestions.length).fill(''));
        setEvaluations(Array(generatedQuestions.length).fill(emptyEvaluation));
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
