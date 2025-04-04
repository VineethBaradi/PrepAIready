
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateAnswer } from '@/services/aiService';

const waitingMessages = [
  "Processing your response...",
  "Analyzing your answer...",
  "Recording your response...",
  "Capturing your answer...",
  "Saving your response..."
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
  cleanedQuestions: string[];
}

// Helper function to clean question text
const cleanQuestionText = (question: string): string => {
  // Remove common prefixes from AI-generated responses
  let cleaned = question.replace(/^Here's a JSON array.*?:/i, '');
  cleaned = cleaned.replace(/^\/\/\s*[A-Z\s]+\s*\(\d+%\):/i, '');
  
  // Remove JSON formatting and markdown code blocks
  cleaned = cleaned.replace(/```json|```/g, '');
  
  // Remove array brackets and numbering
  cleaned = cleaned.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
  cleaned = cleaned.replace(/^\d+\.\s*/gm, '');
  
  // Remove comments like "// Technical Questions (50%)"
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  
  // Remove any remaining JSON formatting
  try {
    // If it's still valid JSON, parse it and extract just the question text
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === 'object' && parsed.question) {
      return parsed.question;
    }
  } catch (e) {
    // Not JSON, continue with cleaning
  }
  
  // Final cleanup - trim whitespace and remove quotes
  return cleaned.trim().replace(/^["']|["']$/g, '');
};

// Helper function to detect if a question requires code input
const isCodingQuestion = (question: string): boolean => {
  const lowerQuestion = question.toLowerCase();
  return (
    (lowerQuestion.includes('sql') && (lowerQuestion.includes('query') || lowerQuestion.includes('write'))) ||
    (lowerQuestion.includes('python') && (lowerQuestion.includes('write') || lowerQuestion.includes('implement') || lowerQuestion.includes('create'))) ||
    lowerQuestion.includes('coding') ||
    (lowerQuestion.includes('code') && lowerQuestion.includes('write')) ||
    lowerQuestion.includes('implement a function') ||
    lowerQuestion.includes('write a function') ||
    lowerQuestion.includes('algorithm')
  );
};

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
  const [codeInput, setCodeInput] = useState("");
  
  const waitingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  const handleNextQuestion = () => {
    // Store the cleaned questions in session storage
    sessionStorage.setItem('interviewQuestions', JSON.stringify(cleanedQuestions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    // Reset code input state for next question
    setShowCodeInput(false);
    setCodeInput("");
    
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const processAnswer = async (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    
    try {
      // Check for SQL or Python coding questions before evaluation
      const currentQuestion = cleanedQuestions[currentQuestionIndex];
      
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
  };
  
  const handleSubmitCode = () => {
    if (!codeInput.trim()) {
      return; // Don't submit empty code
    }
    
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = codeInput;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    setIsWaiting(true);
    setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    
    try {
      evaluateAnswer(
        cleanedQuestions[currentQuestionIndex],
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
        
        if (currentQuestionIndex === questions.length - 1) {
          setIsInterviewComplete(true);
        }
      }).catch(error => {
        console.error("Error evaluating code answer:", error);
        setIsWaiting(false);
        setShowCodeInput(false);
        
        const updatedEvaluations = [...evaluations];
        updatedEvaluations[currentQuestionIndex] = {
          score: 5,
          feedback: "We'll provide detailed feedback at the end of the interview."
        };
        setEvaluations(updatedEvaluations);
      });
    } catch (error) {
      console.error("Error evaluating code answer:", error);
      setIsWaiting(false);
      setShowCodeInput(false);
      
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 5,
        feedback: "We'll provide detailed feedback at the end of the interview."
      };
      setEvaluations(updatedEvaluations);
    }
  };
  
  const handleFinishInterview = () => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(cleanedQuestions));
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
    handleFinishInterview,
    cleanedQuestions
  };
};
