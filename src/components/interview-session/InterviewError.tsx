
import React from 'react';
import Button from '../Button';
import { useNavigate } from 'react-router-dom';

export const InterviewError: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center">
      <div className="glass-card max-w-lg">
        <h2 className="text-xl font-medium mb-4">Unable to Start Interview</h2>
        <p className="mb-6">We couldn't generate interview questions. Please try again later.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    </div>
  );
};
