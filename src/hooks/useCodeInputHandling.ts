
/**
 * Hook for managing code input during interviews
 */
import { useState, useCallback } from 'react';
import { evaluateAnswer } from '@/services/aiService';
import { getRandomWaitingMessage } from '@/utils/questionUtils';
import { toast } from '@/components/ui/use-toast';

interface UseCodeInputHandlingProps {
  currentQuestionIndex: number;
  questions: string[];
  answers: string[];
  evaluations: Array<{score: number; feedback: string}>;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Array<{score: number; feedback: string}>>>;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  setWaitingMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowCodeInput: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInterviewComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useCodeInputHandling = ({
  currentQuestionIndex,
  questions,
  answers,
  evaluations,
  setAnswers,
  setEvaluations,
  setIsWaiting,
  setWaitingMessage,
  setShowCodeInput,
  setIsInterviewComplete
}: UseCodeInputHandlingProps) => {
  const [codeInput, setCodeInput] = useState("");

  const handleSubmitCode = useCallback(() => {
    console.log("Submitting code...");
    if (!codeInput.trim()) {
      toast({
        title: "Empty Code Submission",
        description: "Please enter your code solution before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = codeInput;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    setIsWaiting(true);
    setWaitingMessage(getRandomWaitingMessage());
    
    console.log("Processing code submission for question:", questions[currentQuestionIndex]);
    
    try {
      evaluateAnswer(
        questions[currentQuestionIndex],
        codeInput,
        jobRole
      ).then(result => {
        let normalizedScore = result.score;
        if (normalizedScore > 10) {
          normalizedScore = Math.round(normalizedScore / 10);
        }
        
        normalizedScore = Math.max(0, Math.min(10, normalizedScore));
        
        const updatedEvaluations = [...evaluations];
        updatedEvaluations[currentQuestionIndex] = {
          score: normalizedScore,
          feedback: result.feedback
        };
        setEvaluations(updatedEvaluations);
        setIsWaiting(false);
        setShowCodeInput(false);
        
        console.log("Code evaluation completed with score:", normalizedScore);
        
        if (currentQuestionIndex === questions.length - 1) {
          setIsInterviewComplete(true);
        }
      }).catch(error => {
        console.error("Error evaluating code answer:", error);
        toast({
          title: "Evaluation Error",
          description: "There was an error evaluating your code. Please try again.",
          variant: "destructive"
        });
        setIsWaiting(false);
        
        const updatedEvaluations = [...evaluations];
        updatedEvaluations[currentQuestionIndex] = {
          score: 5,
          feedback: "We'll provide detailed feedback at the end of the interview."
        };
        setEvaluations(updatedEvaluations);
      });
    } catch (error) {
      console.error("Error evaluating code answer:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your code. Please try again.",
        variant: "destructive"
      });
      setIsWaiting(false);
      
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 5,
        feedback: "We'll provide detailed feedback at the end of the interview."
      };
      setEvaluations(updatedEvaluations);
    }
  }, [
    codeInput, 
    answers, 
    currentQuestionIndex, 
    questions, 
    evaluations, 
    setAnswers, 
    setEvaluations, 
    setIsWaiting, 
    setWaitingMessage, 
    setShowCodeInput, 
    setIsInterviewComplete
  ]);

  return {
    codeInput,
    setCodeInput,
    handleSubmitCode
  };
};
