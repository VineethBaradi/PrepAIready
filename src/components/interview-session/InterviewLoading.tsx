
import React from 'react';
import { Loader2 } from 'lucide-react';

export const InterviewLoading: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Generating data interview questions based on your resume...</p>
      </div>
    </div>
  );
};
