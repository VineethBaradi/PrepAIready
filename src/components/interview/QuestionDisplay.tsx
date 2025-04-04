
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: string;
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  isSpeaking,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 relative">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-primary">Interviewer Question:</p>
          <button 
            onClick={onToggleMute} 
            className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className={cn(
                "h-4 w-4", 
                isSpeaking ? "text-primary animate-pulse" : "text-muted-foreground"
              )} />
            )}
          </button>
        </div>
        <p className="text-lg">{question}</p>
        {isSpeaking && !isMuted && (
          <div className="flex justify-center mt-2">
            <div className="flex gap-1 items-center">
              <span className="w-1 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "450ms" }}></span>
              <span className="w-1 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
