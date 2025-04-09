
import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onTranscriptChange?: (transcript: string) => void;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isRecording: boolean;
  recognitionActive: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({ 
  onTranscriptChange 
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          const newTranscript = finalTranscript || interimTranscript || transcript;
          setTranscript(newTranscript);
          if (onTranscriptChange) {
            onTranscriptChange(newTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
        };
      }
    }
    
    return () => {
      stopRecognition();
    };
  }, [onTranscriptChange]);

  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setRecognitionActive(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };
  
  const stopRecognition = () => {
    if (recognitionRef.current && recognitionActive) {
      try {
        recognitionRef.current.stop();
        setRecognitionActive(false);
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    startRecognition();
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    stopRecognition();
  };
  
  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    transcript,
    isRecording,
    recognitionActive,
    startRecording,
    stopRecording,
    resetTranscript
  };
}
