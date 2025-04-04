
import React from 'react';
import { cn } from '@/lib/utils';

interface EvaluationResult {
  score: number;
  feedback: string;
}

interface AnswerAreaProps {
  transcript: string;
  isRecording: boolean;
  isWaiting: boolean;
  waitingMessage: string;
  evaluation: EvaluationResult | null;
}

export const AnswerArea: React.FC<AnswerAreaProps> = ({
  transcript,
  isRecording,
  isWaiting,
  waitingMessage,
  evaluation
}) => {
  return (
    <div 
      className={cn(
        "flex-1 p-4 border rounded-lg mb-4 transition-all duration-300 overflow-y-auto",
        isRecording 
          ? "border-primary bg-primary/5 animate-pulse-subtle" 
          : "border-input"
      )}
    >
      {isWaiting ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">{waitingMessage}</p>
          </div>
        </div>
      ) : transcript ? (
        <div>
          <p>{transcript}</p>
        </div>
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
