
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
}

const waitingMessages = [
  "Analyzing your response with data expertise...",
  "Evaluating your data knowledge...",
  "Processing your technical answer...",
  "Assessing your approach to data problems...",
  "Analyzing your methodology..."
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
  
  const toggleMute = () => {
    const newMuteState = toggleSpeechMute();
    
    if (!newMuteState && readAloud) {
      readAloud(currentQuestion);
    }
    
    return newMuteState;
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
    handleStopRecording
  };
};
