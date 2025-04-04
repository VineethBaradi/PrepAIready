
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
            const result = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += result + ' ';
            } else {
              interimTranscript += result;
            }
          }
          
          // Use the final transcript if available, otherwise use the interim
          const newText = finalTranscript || interimTranscript;
          
          if (newText) {
            // Update the transcript by appending the new text
            setTranscript(prevTranscript => {
              const updatedTranscript = prevTranscript + ' ' + newText;
              console.log("Updated transcript:", updatedTranscript);
              
              // Notify through callback
              if (onTranscriptChange) {
                onTranscriptChange(updatedTranscript);
              }
              
              return updatedTranscript;
            });
          }
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          // Try to restart on error
          if (isRecording) {
            try {
              stopRecognition();
              setTimeout(() => {
                startRecognition();
              }, 1000);
            } catch (e) {
              console.error("Failed to restart recognition", e);
            }
          }
        };
      }
    }
    
    return () => {
      stopRecognition();
    };
  }, [onTranscriptChange, isRecording]);

  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Speech recognition started");
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
        console.log("Speech recognition stopped");
        setRecognitionActive(false);
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  };
  
  const startRecording = () => {
    console.log("Starting recording in hook");
    setIsRecording(true);
    setTranscript(''); // Reset transcript when starting a new recording
    startRecognition();
  };
  
  const stopRecording = () => {
    console.log("Stopping recording in hook");
    setIsRecording(false);
    stopRecognition();
  };
  
  const resetTranscript = () => {
    console.log("Resetting transcript");
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
