
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateAnswer } from '@/services/aiService';

const waitingMessages = [
  "Analyzing your response with data expertise...",
  "Evaluating your data knowledge...",
  "Processing your technical answer...",
  "Assessing your approach to data problems...",
  "Analyzing your methodology..."
];

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
}

export const useInterviewState = ({
  questions,
  answers,
  evaluations,
  setAnswers,
  setEvaluations
}: UseInterviewStateProps): UseInterviewStateReturn => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  
  const waitingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  const handleNextQuestion = () => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const processAnswer = async (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    
    try {
      const result = await evaluateAnswer(
        questions[currentQuestionIndex],
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
      
      if (questions[currentQuestionIndex]?.toLowerCase().includes("code") || 
          questions[currentQuestionIndex]?.toLowerCase().includes("sql") ||
          questions[currentQuestionIndex]?.toLowerCase().includes("python")) {
        setShowCodeInput(true);
      }
      
      if (currentQuestionIndex === questions.length - 1) {
        setIsInterviewComplete(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 7,
        feedback: "Your answer shows good understanding. Consider adding more specific technical examples."
      };
      setEvaluations(updatedEvaluations);
    }
  };
  
  const handleSubmitCode = () => {
    processAnswer(codeInput);
    setShowCodeInput(false);
  };
  
  const handleFinishInterview = () => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
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
    handleFinishInterview
  };
};
