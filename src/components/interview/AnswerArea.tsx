
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { isCodingQuestion } from '@/utils/codingQuestionDetector';

interface AnswerAreaProps {
  transcript: string;
  isRecording: boolean;
  isWaiting: boolean;
  waitingMessage: string;
  showCodeInput?: boolean;
  onToggleCodeInput?: () => void;
}

export const AnswerArea: React.FC<AnswerAreaProps> = ({
  transcript,
  isRecording,
  isWaiting,
  waitingMessage,
  showCodeInput = false,
  onToggleCodeInput
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentQuestion = sessionStorage.getItem('currentQuestion') || '';
  const needsCodeInput = isCodingQuestion(currentQuestion);
  
  useEffect(() => {
    console.log("AnswerArea received transcript:", transcript);
  }, [transcript]);
  
  // Auto-scroll to bottom when transcript changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Determine if we should show the transcript or listening message
  const hasTranscript = transcript && transcript.trim().length > 0;
  const showTranscript = hasTranscript && !isWaiting;
  const showListening = isRecording && !hasTranscript && !isWaiting;
  const showStartPrompt = !isRecording && !hasTranscript && !isWaiting;

  return (
    <div 
      className={cn(
        "flex-1 p-4 border rounded-lg mb-4 transition-all duration-300 relative",
        isRecording 
          ? "border-primary bg-primary/5 animate-pulse-subtle" 
          : "border-input"
      )}
    >
      {needsCodeInput && onToggleCodeInput && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant={showCodeInput ? "default" : "outline"} 
            size="sm"
            onClick={onToggleCodeInput}
            className="flex items-center gap-1 px-2 py-1"
          >
            <Code className="h-4 w-4" />
            <span>{showCodeInput ? "Show Transcript" : "Write Code"}</span>
          </Button>
        </div>
      )}
      
      {isWaiting ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">{waitingMessage}</p>
          </div>
        </div>
      ) : showTranscript ? (
        <ScrollArea className="h-full max-h-[300px]">
          <div className="pr-4" ref={scrollRef}>
            <p className="whitespace-pre-wrap">{transcript}</p>
          </div>
        </ScrollArea>
      ) : showListening ? (
        <div className="text-muted-foreground text-center my-8">
          Listening... Speak your answer to the question
        </div>
      ) : showStartPrompt ? (
        <div className="text-muted-foreground text-center my-8">
          Click the microphone button to start answering
        </div>
      ) : null}
    </div>
  );
};
