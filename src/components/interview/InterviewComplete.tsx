
import React from 'react';
import Button from '../Button';

interface InterviewCompleteProps {
  onFinishInterview: () => void;
}

export const InterviewComplete: React.FC<InterviewCompleteProps> = ({
  onFinishInterview
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
      <h3 className="text-xl font-medium mb-3">Interview Complete!</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Thanks for completing the data interview. Click below to see your detailed technical feedback and performance analysis.
      </p>
      <Button variant="primary" onClick={onFinishInterview}>
        View Your Feedback
      </Button>
    </div>
  );
};
