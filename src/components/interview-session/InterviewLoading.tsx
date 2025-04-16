import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const InterviewLoading: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Glowing background effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl opacity-70 animate-pulse"></div>
          
          {/* Brain container with breathing animation */}
          <div className="relative flex items-center justify-center">
            <div className="animate-pulse [animation-duration:3s]">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-primary animate-pulse" />
          </div>
          
          {/* Neural network dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/30 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Generating interview questions based on your resume...</p>
          <p className="text-sm text-muted-foreground">Our AI is analyzing your experience and skills</p>
        </div>
      </div>
    </div>
  );
};
