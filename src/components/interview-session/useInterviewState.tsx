
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useAnswerProcessing } from '@/hooks/useAnswerProcessing';
import { useCodeInputHandling } from '@/hooks/useCodeInputHandling';
import { cleanQuestionText } from '@/utils/questionUtils';

interface UseInterviewStateProps {
  questions: string[];
  answers: string[];
  evaluations: Array<{score: number; feedback: string}>;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Array<{score: number; feedback: string}>>>;
}

interface UseInterviewStateReturn {
  currentQuestionIndex: number;
  isWaiting: boolean;
  waitingMessage: string;
  isInterviewComplete: boolean;
  showCodeInput: boolean;
  codeInput: string;
  waitingTimerRef: React.MutableRefObject<number | null>;
  handleNextQuestion: () => void;
  processAnswer: (answer: string) => Promise<void>;
  setCodeInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmitCode: () => void;
  handleFinishInterview: () => void;
  cleanedQuestions: string[];
}

export const useInterviewState = ({
  questions,
  answers,
  evaluations,
  setAnswers,
  setEvaluations
}: UseInterviewStateProps): UseInterviewStateReturn => {
  // Clean the questions when they're first received
  const cleanedQuestions = questions.map(cleanQuestionText);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  
  const waitingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { saveInterviewData } = useInterviewSession();
  
  // Initialize answer processing
  const { processAnswer } = useAnswerProcessing({
    questions: cleanedQuestions,
    answers,
    evaluations,
    currentQuestionIndex,
    setAnswers,
    setEvaluations,
    setShowCodeInput,
    setIsInterviewComplete
  });
  
  // Initialize code input handling
  const { codeInput, setCodeInput, handleSubmitCode } = useCodeInputHandling({
    currentQuestionIndex,
    questions: cleanedQuestions,
    answers,
    evaluations,
    setAnswers,
    setEvaluations,
    setIsWaiting,
    setWaitingMessage,
    setShowCodeInput,
    setIsInterviewComplete
  });
  
  // Handle advancing to the next question
  const handleNextQuestion = () => {
    // Store the cleaned questions in session storage
    saveInterviewData(cleanedQuestions, answers, evaluations);
    
    // Reset code input state for next question
    setShowCodeInput(false);
    setCodeInput("");
    
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  // Handle finishing the interview
  const handleFinishInterview = () => {
    saveInterviewData(cleanedQuestions, answers, evaluations);
    navigate('/feedback');
  };
  
  return {
    currentQuestionIndex,
    isWaiting,
    waitingMessage,
    isInterviewComplete,
    showCodeInput,
    codeInput,
    waitingTimerRef,
    handleNextQuestion,
    processAnswer,
    setCodeInput,
    handleSubmitCode,
    handleFinishInterview,
    cleanedQuestions
  };
};
