
import React from 'react';
import { Clock } from 'lucide-react';

interface ProgressDisplayProps {
  currentIndex: number;
  totalQuestions: number;
  usingFallbackQuestions: boolean;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  currentIndex,
  totalQuestions,
  usingFallbackQuestions
}) => {
  return (
    <>
      {usingFallbackQuestions && (
        <div className="mb-4 p-3 bg-yellow-100/50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            We're using pre-defined questions optimized for your selected role. Your responses will still be evaluated for personalized feedback.
          </p>
        </div>
      )}
      
      <div className="mb-8 animate-slide-down">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Data Interview Progress</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
          </div>
        </div>
        
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
};
