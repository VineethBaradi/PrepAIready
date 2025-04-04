
import { useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface UseSpeechControlProps {
  currentQuestion: string;
  processAnswer: (answer: string) => Promise<void>;
  waitingTimerRef: React.MutableRefObject<number | null>;
  isWaiting: boolean;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  setWaitingMessage: React.Dispatch<React.SetStateAction<string>>;
}

interface UseSpeechControlReturn {
  transcript: string;
  isRecording: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleMute: () => boolean;
  toggleRecording: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  readQuestion: (text: string) => void;
}

const waitingMessages = [
  "Processing your response...",
  "Analyzing your answer...",
  "Recording your response...",
  "Capturing your answer...",
  "Saving your response..."
];

export const useSpeechControl = ({
  currentQuestion,
  processAnswer,
  waitingTimerRef,
  isWaiting,
  setIsWaiting,
  setWaitingMessage
}: UseSpeechControlProps): UseSpeechControlReturn => {
  const { transcript, isRecording, startRecording: startSpeechRecognition, stopRecording: stopSpeechRecognition } = useSpeechRecognition({});
  const { isSpeaking, isMuted, readAloud, stopSpeech, toggleMute: toggleSpeechMute } = useSpeechSynthesis();
  
  const handleStartRecording = () => {
    startSpeechRecognition();
    if (stopSpeech) {
      stopSpeech();
    }
  };
  
  const handleStopRecording = () => {
    stopSpeechRecognition();
    
    const userAnswer = transcript.trim();
    
    if (!userAnswer) {
      return;
    }
    
    setIsWaiting(true);
    setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    
    waitingTimerRef.current = window.setTimeout(() => {
      setIsWaiting(false);
      processAnswer(userAnswer);
    }, 2000);
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };
  
  const toggleMute = (): boolean => {
    return toggleSpeechMute();
  };
  
  const readQuestion = (text: string) => {
    if (typeof readAloud === 'function' && !isMuted) {
      readAloud(text);
    }
  };
  
  return {
    transcript,
    isRecording,
    isSpeaking,
    isMuted,
    startRecording: startSpeechRecognition,
    stopRecording: stopSpeechRecognition,
    toggleMute,
    toggleRecording,
    handleStartRecording,
    handleStopRecording,
    readQuestion
  };
};
