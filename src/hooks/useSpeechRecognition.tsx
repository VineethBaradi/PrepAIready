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
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
}

export function useSpeechRecognition({ 
  onTranscriptChange 
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastFinalTranscriptRef = useRef<string>("");
  const currentQuestionRef = useRef<string>("");
  
  useEffect(() => {
    // Check if the question has changed
    const currentQuestion = sessionStorage.getItem('currentQuestion') || '';
    if (currentQuestion !== currentQuestionRef.current) {
      // Question has changed, reset the transcript
      resetTranscript();
      currentQuestionRef.current = currentQuestion;
    }
  }, [sessionStorage.getItem('currentQuestion')]);
  
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
          
          // Only update the transcript if we have new final results
          if (finalTranscript) {
            const newTranscript = lastFinalTranscriptRef.current + finalTranscript;
            lastFinalTranscriptRef.current = newTranscript;
            setTranscript(newTranscript);
            if (onTranscriptChange) {
              onTranscriptChange(newTranscript);
            }
          } else if (interimTranscript) {
            // Show interim results with the last final transcript
            const newTranscript = lastFinalTranscriptRef.current + interimTranscript;
            setTranscript(newTranscript);
            if (onTranscriptChange) {
              onTranscriptChange(newTranscript);
            }
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
    lastFinalTranscriptRef.current = "";
  };

  return {
    transcript,
    isRecording,
    recognitionActive,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript
  };
}
