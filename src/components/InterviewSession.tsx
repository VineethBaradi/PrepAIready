
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Clock, ChevronRight } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

// Mock interview questions
const mockQuestions = [
  "Tell me about yourself and your background.",
  "What interests you about this role?",
  "Describe a challenging project you worked on and how you handled it.",
  "What are your strengths and weaknesses?",
  "How do you stay current with industry trends?",
  "Can you describe your experience with [relevant technology]?",
  "How do you handle pressure and tight deadlines?",
  "Where do you see yourself in five years?",
  "Do you have any questions for me about the role or company?"
];

// Mock waiting messages
const waitingMessages = [
  "Analyzing your response...",
  "Processing your answer...",
  "Evaluating your response...",
  "Preparing next question..."
];

const InterviewSession: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  
  const timerRef = useRef<number | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  const currentQuestion = mockQuestions[currentQuestionIndex];
  
  // Start/stop recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setTimer(0);
    
    // In a real app, we would start the microphone recording here
    // For now, we'll just update the UI and start a timer
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // In a real app, we would stop the microphone and process the recording
    // For now, we'll just simulate waiting for AI processing
    
    setIsWaiting(true);
    setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    
    // Simulate AI processing time
    waitingTimerRef.current = window.setTimeout(() => {
      setIsWaiting(false);
      
      // For question #6, show code input
      if (currentQuestionIndex === 5) {
        setShowCodeInput(true);
      }
      
      // If this was the last question, end the interview
      if (currentQuestionIndex === mockQuestions.length - 1) {
        setIsInterviewComplete(true);
      }
    }, 2000);
  };
  
  const handleNextQuestion = () => {
    // Move to the next question
    setCurrentQuestionIndex(prev => prev + 1);
    setTranscript("");
    setShowCodeInput(false);
    setCodeInput("");
  };
  
  const handleSubmitCode = () => {
    setShowCodeInput(false);
    // In a real app, we would evaluate the code here
  };
  
  const handleFinishInterview = () => {
    navigate('/feedback');
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
    };
  }, []);
  
  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Interview progress */}
        <div className="mb-8 animate-slide-down">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Interview Progress</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
            </div>
          </div>
          
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex) / mockQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Main interview area */}
        <div className="flex-1 flex flex-col glass-card">
          {/* AI question */}
          <div className="mb-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">Interviewer Question:</p>
              <p className="text-lg">{currentQuestion}</p>
            </div>
          </div>
          
          {/* User response area */}
          <div className="flex-1 flex flex-col">
            {isInterviewComplete ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <h3 className="text-xl font-medium mb-3">Interview Complete!</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Thanks for completing the interview. Click below to see your feedback and performance analysis.
                </p>
                <Button variant="primary" onClick={handleFinishInterview}>
                  View Your Feedback
                </Button>
              </div>
            ) : showCodeInput ? (
              <div className="flex-1 flex flex-col animate-fade-in">
                <p className="text-sm font-medium mb-2">Please write your code solution:</p>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="flex-1 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="// Write your code here..."
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="primary"
                    onClick={handleSubmitCode}
                    rightIcon={<Send className="h-4 w-4" />}
                  >
                    Submit Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
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
                    <p>{transcript}</p>
                  ) : (
                    <p className="text-muted-foreground text-center my-8">
                      {isRecording 
                        ? "Listening... Speak your answer" 
                        : "Click the microphone button to start answering"
                      }
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Button
                      variant={isRecording ? "primary" : "outline"}
                      size="lg"
                      onClick={toggleRecording}
                      className={cn(
                        "rounded-full h-12 w-12 p-0",
                        isRecording && "bg-primary text-white"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                    
                    {isRecording && (
                      <span className="ml-3 text-sm font-medium animate-fade-in">{formatTime(timer)}</span>
                    )}
                  </div>
                  
                  {!isRecording && !isWaiting && currentQuestionIndex < mockQuestions.length - 1 && (
                    <Button
                      variant="secondary"
                      onClick={handleNextQuestion}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
