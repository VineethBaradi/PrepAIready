
import { useRef, useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { getRandomWaitingMessage } from '@/utils/questionUtils';

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
  resetTranscript: () => void;
}

export const useSpeechControl = ({
  currentQuestion,
  processAnswer,
  waitingTimerRef,
  isWaiting,
  setIsWaiting,
  setWaitingMessage
}: UseSpeechControlProps): UseSpeechControlReturn => {
  const { transcript, isRecording, startRecording: startSpeechRecognition, stopRecording: stopSpeechRecognition, resetTranscript } = useSpeechRecognition({
    onTranscriptChange: (newTranscript) => {
      console.log("Transcript updated:", newTranscript);
    }
  });
  const { isSpeaking, isMuted, readAloud, stopSpeech, toggleMute: toggleSpeechMute } = useSpeechSynthesis();
  const lastReadQuestionRef = useRef<string>('');
  const [localTranscript, setLocalTranscript] = useState('');
  
  const handleStartRecording = () => {
    console.log("Starting recording...");
    startSpeechRecognition();
    if (stopSpeech) {
      stopSpeech();
    }
  };
  
  const handleStopRecording = () => {
    console.log("Stopping recording...");
    stopSpeechRecognition();
    
    const userAnswer = transcript.trim();
    
    if (!userAnswer) {
      console.log("No transcript to process");
      return;
    }
    
    console.log("Processing answer:", userAnswer);
    setIsWaiting(true);
    setWaitingMessage(getRandomWaitingMessage());
    
    // Clear any existing timer
    if (waitingTimerRef.current) {
      clearTimeout(waitingTimerRef.current);
    }
    
    waitingTimerRef.current = window.setTimeout(() => {
      setIsWaiting(false);
      processAnswer(userAnswer);
    }, 2000);
  };
  
  const toggleRecording = () => {
    console.log("Toggling recording, current state:", isRecording);
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };
  
  const toggleMute = (): boolean => {
    return toggleSpeechMute();
  };
  
  // Modified to only read a question once by tracking the last question read
  const readQuestion = (text: string) => {
    if (typeof readAloud === 'function' && !isMuted && text !== lastReadQuestionRef.current) {
      console.log("Reading question:", text);
      lastReadQuestionRef.current = text;
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
    readQuestion,
    resetTranscript
  };
};
