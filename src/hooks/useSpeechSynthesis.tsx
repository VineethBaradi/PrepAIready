
import { useState, useRef, useEffect } from 'react';

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isMuted: boolean;
  readAloud: (text: string) => void;
  stopSpeech: () => void;
  toggleMute: () => boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const spokenTextsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);
  
  const readAloud = (text: string) => {
    if (isMuted) return;
    
    // Check if this text has already been spoken to prevent repetition
    if (spokenTextsRef.current.has(text)) return;
    
    stopSpeech();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    speechSynthesisRef.current = utterance;
    
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
      // Add to set of spoken texts to prevent repetition
      spokenTextsRef.current.add(text);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    speechSynthesisRef.current = null;
  };
  
  const toggleMute = (): boolean => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      stopSpeech();
    }
    
    return newMuteState;
  };

  return {
    isSpeaking,
    isMuted,
    readAloud,
    stopSpeech,
    toggleMute
  };
}
