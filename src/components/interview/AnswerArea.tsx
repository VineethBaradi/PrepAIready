
import React from 'react';
import { cn } from '@/lib/utils';
import { Code } from 'lucide-react';
import Button from '../Button';
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const question = sessionStorage.getItem('currentQuestion') || '';
  const needsCodeInput = question.toLowerCase().includes('sql') || 
                         question.toLowerCase().includes('python') ||
                         question.toLowerCase().includes('code') || 
                         question.toLowerCase().includes('write');

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
            variant={showCodeInput ? "primary" : "outline"} 
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
      ) : transcript ? (
        <ScrollArea className="h-full max-h-[300px] pr-4">
          <div>
            <p>{transcript}</p>
          </div>
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-center my-8">
          {isRecording 
            ? "Listening... Speak your answer to the data question" 
            : "Click the microphone button to start answering"
          }
        </p>
      )}
    </div>
  );
};
