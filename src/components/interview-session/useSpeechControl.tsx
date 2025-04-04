
import { useRef, useState, useEffect } from 'react';
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
  const [localTranscript, setLocalTranscript] = useState('');
  
  const { 
    transcript, 
    isRecording, 
    startRecording: startSpeechRecognition, 
    stopRecording: stopSpeechRecognition, 
    resetTranscript 
  } = useSpeechRecognition({
    onTranscriptChange: (newTranscript) => {
      console.log("Transcript updated in useSpeechControl:", newTranscript);
      setLocalTranscript(newTranscript);
    }
  });
  
  const { isSpeaking, isMuted, readAloud, stopSpeech, toggleMute: toggleSpeechMute } = useSpeechSynthesis();
  const lastReadQuestionRef = useRef<string>('');
  
  // Synchronize states: When transcript changes from recognition, update localTranscript
  useEffect(() => {
    console.log("useSpeechControl - transcript value updated:", transcript);
    if (transcript) {
      setLocalTranscript(transcript);
    }
  }, [transcript]);
  
  const handleStartRecording = () => {
    console.log("Starting recording...");
    setLocalTranscript(''); // Clear local transcript when starting
    startSpeechRecognition();
    if (stopSpeech) {
      stopSpeech();
    }
  };
  
  const handleStopRecording = () => {
    console.log("Stopping recording...");
    stopSpeechRecognition();
    
    // Use localTranscript for processing, which should be in sync with transcript
    const userAnswer = localTranscript.trim();
    
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
    transcript: localTranscript, // Return the local transcript for consistency
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
    resetTranscript: () => {
      console.log("Reset transcript called from useSpeechControl");
      resetTranscript();
      setLocalTranscript('');
    }
  };
};
