
import React from 'react';
import { Mic, MicOff, ChevronRight } from 'lucide-react';
import Button from '../Button';
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
          variant={isRecording ? "primary" : "outline"} 
          size="lg" 
          onClick={onToggleRecording} 
          className={cn("rounded-full h-12 w-12 p-0", isRecording && "bg-primary text-white")}
          disabled={isWaiting}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        {isRecording && <span className="ml-3 text-sm font-medium animate-fade-in">{formatTime(timer)}</span>}
      </div>
      
      {(!isRecording && !isWaiting && hasTranscript && !isLastQuestion) && (
        <Button 
          variant="secondary" 
          onClick={onNextQuestion} 
          rightIcon={<ChevronRight className="h-4 w-4" />} 
          className="mx-[15px]"
        >
          Next Question
        </Button>
      )}
    </div>
  );
};
