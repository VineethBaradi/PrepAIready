
import React from 'react';
import { BarChart } from 'lucide-react';
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
  evaluation: EvaluationResult;
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
          
          {evaluation.score > 0 && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Response Evaluation</span>
                </div>
                <div className="px-2 py-1 bg-primary/10 rounded text-sm font-medium">
                  Score: {evaluation.score}/10
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
            </div>
          )}
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
