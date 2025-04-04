
/**
 * Hook for processing spoken or written answers during interviews
 */
import { useCallback } from 'react';
import { evaluateAnswer } from '@/services/aiService';
import { isCodingQuestion } from '@/utils/codingQuestionDetector';

interface UseAnswerProcessingProps {
  questions: string[];
  answers: string[];
  evaluations: Array<{score: number; feedback: string}>;
  currentQuestionIndex: number;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Array<{score: number; feedback: string}>>>;
  setShowCodeInput: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInterviewComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAnswerProcessing = ({
  questions,
  answers,
  evaluations,
  currentQuestionIndex,
  setAnswers,
  setEvaluations,
  setShowCodeInput,
  setIsInterviewComplete
}: UseAnswerProcessingProps) => {
  
  const processAnswer = useCallback(async (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    
    try {
      // Check for SQL or Python coding questions before evaluation
      const currentQuestion = questions[currentQuestionIndex];
      
      if (isCodingQuestion(currentQuestion)) {
        setShowCodeInput(true);
        return;
      }
      
      const result = await evaluateAnswer(
        currentQuestion,
        answer,
        jobRole
      );
      
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
      
      if (currentQuestionIndex === questions.length - 1) {
        setIsInterviewComplete(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 5,
        feedback: "We'll provide detailed feedback at the end of the interview."
      };
      setEvaluations(updatedEvaluations);
    }
  }, [answers, currentQuestionIndex, evaluations, questions, setAnswers, setEvaluations, setIsInterviewComplete, setShowCodeInput]);

  return { processAnswer };
};
