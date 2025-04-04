
import React from 'react';

interface InterviewWaitingProps {
  message: string;
}

export const InterviewWaiting: React.FC<InterviewWaitingProps> = ({ message }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
      </div>
    </div>
  );
};
