
import React from 'react';
import { Mic, MicOff, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface RecordingControlsProps {
  isRecording: boolean;
  isWaiting: boolean;
  hasTranscript: boolean;
  timer: number;
  formatTime: (seconds: number) => string;
  onToggleRecording: () => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isWaiting,
  hasTranscript,
  timer,
  formatTime,
  onToggleRecording,
  onNextQuestion,
  isLastQuestion
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          variant={isRecording ? "destructive" : "default"} 
          size="icon" 
          onClick={onToggleRecording} 
          className={cn("rounded-full h-12 w-12", isRecording && "animate-pulse")}
          disabled={isWaiting}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        {isRecording && <span className="ml-3 text-sm font-medium animate-fade-in">{formatTime(timer)}</span>}
      </div>
      
      {(!isRecording && hasTranscript && !isLastQuestion) && (
        <Button 
          variant="secondary" 
          onClick={onNextQuestion} 
          className="mx-[15px] flex items-center gap-2"
        >
          Next Question
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
