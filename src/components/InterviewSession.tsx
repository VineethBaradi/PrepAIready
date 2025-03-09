
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Clock, ChevronRight, Loader2, BarChart, Volume2, VolumeX } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import { generateInterviewQuestions, evaluateAnswer } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';

// Improved waiting messages for data interviews
const waitingMessages = [
  "Analyzing your response with data expertise...",
  "Evaluating your data knowledge...",
  "Processing your technical answer...",
  "Assessing your approach to data problems...",
  "Analyzing your methodology..."
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
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Array<{score: number; feedback: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackQuestions, setUsingFallbackQuestions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuestions = async () => {
      const resumeContent = sessionStorage.getItem('resume');
      const jobRole = sessionStorage.getItem('jobRole');
      
      if (!resumeContent || !jobRole) {
        toast({
          title: "Missing information",
          description: "Please upload a resume and select a data role first.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      try {
        const generatedQuestions = await generateInterviewQuestions({
          resume: resumeContent,
          jobRole: jobRole,
          count: 8 // You can adjust the number of questions
        });
        
        // If we got fewer than expected questions, we're probably using fallbacks
        if (generatedQuestions.length < 5) {
          setUsingFallbackQuestions(true);
        }
        
        setQuestions(generatedQuestions);
        setAnswers(new Array(generatedQuestions.length).fill(''));
        setEvaluations(new Array(generatedQuestions.length).fill({ score: 0, feedback: '' }));
      } catch (error) {
        console.error("Failed to generate questions:", error);
        setUsingFallbackQuestions(true);
        toast({
          title: "Using backup questions",
          description: "We're using pre-defined questions for your interview practice.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
    
    // Clean up timers when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
      stopSpeech();
    };
  }, [navigate]);
  
  // Read the current question aloud
  useEffect(() => {
    if (!isLoading && questions.length > 0 && !isMuted) {
      readQuestionAloud(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, questions, isLoading, isMuted]);
  
  const readQuestionAloud = (text: string) => {
    if (isMuted) return;
    
    // Cancel any ongoing speech
    stopSpeech();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Store the utterance in the ref so we can cancel it later if needed
    speechSynthesisRef.current = utterance;
    
    // Set speaking state
    setIsSpeaking(true);
    
    // Add event listener for when speech ends
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    speechSynthesisRef.current = null;
  };
  
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      stopSpeech();
    } else if (questions.length > 0) {
      readQuestionAloud(questions[currentQuestionIndex]);
    }
  };
  
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
    
    // Stop any ongoing speech when recording starts
    stopSpeech();
    
    // In a real app, we would start the microphone recording here
    // For now, we'll just update the UI and start a timer
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const processAnswer = async (answer: string) => {
    // Save the answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
    
    // Get the current job role
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    
    // Evaluate the answer
    try {
      const result = await evaluateAnswer(
        questions[currentQuestionIndex],
        answer,
        jobRole
      );
      
      // Save the evaluation
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = result;
      setEvaluations(updatedEvaluations);
      
      // For coding questions, show code input instead
      if (questions[currentQuestionIndex]?.toLowerCase().includes("code") || 
          questions[currentQuestionIndex]?.toLowerCase().includes("sql") ||
          questions[currentQuestionIndex]?.toLowerCase().includes("python")) {
        setShowCodeInput(true);
      }
      
      // If this was the last question, end the interview
      if (currentQuestionIndex === questions.length - 1) {
        setIsInterviewComplete(true);
      }
      
    } catch (error) {
      console.error("Error evaluating answer:", error);
      // Generate a simulated evaluation for fallback
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 7,
        feedback: "Your answer shows good understanding. Consider adding more specific technical examples."
      };
      setEvaluations(updatedEvaluations);
    }
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Generate a simulated answer based on the question for our demo
    // In a real app this would be the transcribed speech
    let simulatedAnswer = "";
    const currentQuestion = questions[currentQuestionIndex];
    
    // Generate topic-specific simulated answers for demo purposes
    if (currentQuestion.toLowerCase().includes('sql')) {
      simulatedAnswer = "I have experience with complex SQL queries including joins, subqueries, and window functions. For example, in my last project, I used CTEs to analyze customer behavior patterns across multiple transaction tables.";
    } else if (currentQuestion.toLowerCase().includes('python')) {
      simulatedAnswer = "I've used Python extensively for data analysis with pandas and numpy. I'm comfortable with data cleaning, transformation, and visualization using libraries like matplotlib and seaborn.";
    } else if (currentQuestion.toLowerCase().includes('machine learning')) {
      simulatedAnswer = "I've implemented various ML models including random forests, gradient boosting, and neural networks. I follow a structured approach from data preprocessing to model evaluation using metrics appropriate for each problem type.";
    } else {
      simulatedAnswer = "I approach this type of problem by first understanding the business requirements, then exploring the data to identify patterns and outliers. After that, I develop a solution strategy and validate it against test cases.";
    }
    
    setTranscript(simulatedAnswer);
    
    // Evaluate the answer
    setIsWaiting(true);
    setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    
    // Simulate AI processing time
    waitingTimerRef.current = window.setTimeout(() => {
      setIsWaiting(false);
      processAnswer(simulatedAnswer);
    }, 2000);
  };
  
  const handleNextQuestion = () => {
    // Save all information for analysis
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    // Move to the next question
    setCurrentQuestionIndex(prev => prev + 1);
    setTranscript("");
    setShowCodeInput(false);
    setCodeInput("");
  };
  
  const handleSubmitCode = () => {
    // Process the code answer
    processAnswer(codeInput);
    setShowCodeInput(false);
  };
  
  const handleFinishInterview = () => {
    // Save all information for analysis
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    navigate('/feedback');
  };
  
  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // If still loading questions
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Generating data interview questions based on your resume...</p>
        </div>
      </div>
    );
  }
  
  // If no questions were generated
  if (questions.length === 0) {
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
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentEvaluation = evaluations[currentQuestionIndex];
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {usingFallbackQuestions && (
          <div className="mb-4 p-3 bg-yellow-100/50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              We're using pre-defined questions optimized for your selected role. Your responses will still be evaluated for personalized feedback.
            </p>
          </div>
        )}
        
        {/* Interview progress */}
        <div className="mb-8 animate-slide-down">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Data Interview Progress</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
          </div>
          
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Main interview area */}
        <div className="flex-1 flex flex-col glass-card">
          {/* AI question */}
          <div className="mb-6 animate-fade-in">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 relative">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-primary">Interviewer Question:</p>
                <button 
                  onClick={toggleMute} 
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
              <p className="text-lg">{currentQuestion}</p>
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
          
          {/* User response area */}
          <div className="flex-1 flex flex-col">
            {isInterviewComplete ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <h3 className="text-xl font-medium mb-3">Interview Complete!</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Thanks for completing the data interview. Click below to see your detailed technical feedback and performance analysis.
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
                  placeholder="# Write your SQL query or Python code here..."
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
                    <div>
                      <p>{transcript}</p>
                      
                      {currentEvaluation.score > 0 && (
                        <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <BarChart className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm font-medium">Response Evaluation</span>
                            </div>
                            <div className="px-2 py-1 bg-primary/10 rounded text-sm font-medium">
                              Score: {currentEvaluation.score}/10
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{currentEvaluation.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center my-8">
                      {isRecording 
                        ? "Listening... Speak your answer to the data question" 
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
                  
                  {!isRecording && !isWaiting && transcript && currentQuestionIndex < questions.length - 1 && (
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
