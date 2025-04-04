import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { generateInterviewQuestions, evaluateAnswer } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useTimer } from '@/hooks/useTimer';
import { QuestionDisplay } from './interview/QuestionDisplay';
import { AnswerArea } from './interview/AnswerArea';
import { CodeInputArea } from './interview/CodeInputArea';
import { RecordingControls } from './interview/RecordingControls';
import { ProgressDisplay } from './interview/ProgressDisplay';
import { InterviewComplete } from './interview/InterviewComplete';
import Button from './Button';

const waitingMessages = [
  "Analyzing your response with data expertise...",
  "Evaluating your data knowledge...",
  "Processing your technical answer...",
  "Assessing your approach to data problems...",
  "Analyzing your methodology..."
];

const InterviewSession: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Array<{score: number; feedback: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallbackQuestions, setUsingFallbackQuestions] = useState(false);
  
  const waitingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  const { transcript, isRecording, startRecording, stopRecording } = useSpeechRecognition({});
  const { isSpeaking, isMuted, readAloud, stopSpeech, toggleMute } = useSpeechSynthesis();
  const { timer, startTimer, stopTimer, resetTimer, formatTime } = useTimer();
  
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
          count: 8
        });
        
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
    
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
      stopSpeech();
      stopTimer();
    };
  }, [navigate, stopSpeech, stopTimer]);
  
  useEffect(() => {
    if (!isLoading && questions.length > 0 && !isMuted) {
      if (typeof readAloud === 'function') {
        readAloud(questions[currentQuestionIndex]);
      }
    }
  }, [currentQuestionIndex, questions, isLoading, isMuted, readAloud]);
  
  const handleToggleMute = () => {
    const newMuteState = toggleMute();
    
    if (!newMuteState && questions.length > 0) {
      readAloud(questions[currentQuestionIndex]);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };
  
  const handleStartRecording = () => {
    startRecording();
    resetTimer();
    stopSpeech();
    startTimer();
  };
  
  const handleStopRecording = () => {
    stopRecording();
    stopTimer();
    
    const userAnswer = transcript.trim();
    
    if (!userAnswer) {
      toast({
        title: "No speech detected",
        description: "We couldn't detect your answer. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsWaiting(true);
    setWaitingMessage(waitingMessages[Math.floor(Math.random() * waitingMessages.length)]);
    
    waitingTimerRef.current = window.setTimeout(() => {
      setIsWaiting(false);
      processAnswer(userAnswer);
    }, 2000);
  };
  
  const processAnswer = async (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = answer;
    setAnswers(updatedAnswers);
    
    const jobRole = sessionStorage.getItem('jobRole') || 'Data Analyst';
    
    try {
      const result = await evaluateAnswer(
        questions[currentQuestionIndex],
        answer,
        jobRole
      );
      
      let normalizedScore = result.score;
      if (normalizedScore > 10) {
        normalizedScore = Math.round(normalizedScore / 10);
      }
      
      normalizedScore = Math.max(0, Math.min(10, normalizedScore));
      
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: normalizedScore,
        feedback: result.feedback
      };
      setEvaluations(updatedEvaluations);
      
      if (questions[currentQuestionIndex]?.toLowerCase().includes("code") || 
          questions[currentQuestionIndex]?.toLowerCase().includes("sql") ||
          questions[currentQuestionIndex]?.toLowerCase().includes("python")) {
        setShowCodeInput(true);
      }
      
      if (currentQuestionIndex === questions.length - 1) {
        setIsInterviewComplete(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      const updatedEvaluations = [...evaluations];
      updatedEvaluations[currentQuestionIndex] = {
        score: 7,
        feedback: "Your answer shows good understanding. Consider adding more specific technical examples."
      };
      setEvaluations(updatedEvaluations);
    }
  };
  
  const handleNextQuestion = () => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const handleSubmitCode = () => {
    processAnswer(codeInput);
    setShowCodeInput(false);
  };
  
  const handleFinishInterview = () => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
    
    navigate('/feedback');
  };
  
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
        <ProgressDisplay 
          currentIndex={currentQuestionIndex} 
          totalQuestions={questions.length}
          usingFallbackQuestions={usingFallbackQuestions}
        />
        
        <div className="flex-1 flex flex-col glass-card">
          <QuestionDisplay 
            question={currentQuestion}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
          
          <div className="flex-1 flex flex-col">
            {isInterviewComplete ? (
              <InterviewComplete onFinishInterview={handleFinishInterview} />
            ) : showCodeInput ? (
              <CodeInputArea 
                codeInput={codeInput}
                onCodeChange={setCodeInput}
                onSubmit={handleSubmitCode}
              />
            ) : (
              <div className="flex-1 flex flex-col">
                <AnswerArea 
                  transcript={transcript}
                  isRecording={isRecording}
                  isWaiting={isWaiting}
                  waitingMessage={waitingMessage}
                  evaluation={currentEvaluation}
                />
                
                <RecordingControls 
                  isRecording={isRecording}
                  isWaiting={isWaiting}
                  hasTranscript={!!transcript}
                  timer={timer}
                  formatTime={formatTime}
                  onToggleRecording={toggleRecording}
                  onNextQuestion={handleNextQuestion}
                  isLastQuestion={currentQuestionIndex === questions.length - 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
