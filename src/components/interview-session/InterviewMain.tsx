import React, { useState, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { toast } from '@/components/ui/use-toast';
import { useSpeechControl } from './useSpeechControl';
import { QuestionDisplay } from '../interview/QuestionDisplay';
import { AnswerArea } from '../interview/AnswerArea';
import { CodeInputArea } from '../interview/CodeInputArea';
import { RecordingControls } from '../interview/RecordingControls';
import { InterviewComplete } from '../interview/InterviewComplete';

interface InterviewMainProps {
  questions: string[];
  answers: string[];
  evaluations: Array<{score: number; feedback: string}>;
  currentQuestionIndex: number;
  isWaiting: boolean;
  waitingMessage: string;
  isInterviewComplete: boolean;
  showCodeInput: boolean;
  codeInput: string;
  waitingTimerRef: React.MutableRefObject<number | null>;
  handleNextQuestion: () => void;
  processAnswer: (answer: string) => Promise<void>;
  setCodeInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmitCode: () => void;
  handleFinishInterview: () => void;
}

export const InterviewMain: React.FC<InterviewMainProps> = ({
  questions,
  answers,
  evaluations,
  currentQuestionIndex,
  isWaiting,
  waitingMessage,
  isInterviewComplete,
  showCodeInput,
  codeInput,
  waitingTimerRef,
  handleNextQuestion,
  processAnswer,
  setCodeInput,
  handleSubmitCode,
  handleFinishInterview
}) => {
  const [localIsWaiting, setLocalIsWaiting] = useState(isWaiting);
  const [localWaitingMessage, setLocalWaitingMessage] = useState(waitingMessage);
  const [localShowCodeInput, setLocalShowCodeInput] = useState(showCodeInput);
  const { timer, startTimer, stopTimer, resetTimer, formatTime } = useTimer();

  useEffect(() => {
    setLocalIsWaiting(isWaiting);
    setLocalWaitingMessage(waitingMessage);
    setLocalShowCodeInput(showCodeInput);
  }, [isWaiting, waitingMessage, showCodeInput]);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Store current question in sessionStorage for AnswerArea to check
  useEffect(() => {
    if (currentQuestion) {
      sessionStorage.setItem('currentQuestion', currentQuestion);
    }
  }, [currentQuestion]);

  const {
    transcript,
    isRecording,
    isSpeaking,
    isMuted,
    toggleMute,
    toggleRecording,
    readQuestion,
    setTranscript
  } = useSpeechControl({
    currentQuestion,
    processAnswer,
    waitingTimerRef,
    isWaiting: localIsWaiting,
    setIsWaiting: setLocalIsWaiting,
    setWaitingMessage: setLocalWaitingMessage
  });

  // Automatically read the question aloud when it changes
  useEffect(() => {
    if (currentQuestion && !isMuted && readQuestion) {
      readQuestion(currentQuestion);
    }
  }, [currentQuestion, isMuted, readQuestion]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopTimer();
    } else {
      resetTimer();
      startTimer();
    }
    toggleRecording();
  };

  const handleToggleCodeInput = () => {
    setLocalShowCodeInput(prev => !prev);
    // When switching to code input, save the current transcript
    if (!localShowCodeInput && transcript) {
      sessionStorage.setItem(`answer_${currentQuestionIndex}`, transcript);
    }
    // When switching to answer input, save the current code
    if (localShowCodeInput && codeInput) {
      sessionStorage.setItem(`code_${currentQuestionIndex}`, codeInput);
    }
  };

  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
    };
  }, [waitingTimerRef]);
  
  const handleNextQuestionWithClear = () => {
    // Save both answer and code before moving to next question
    if (transcript) {
      sessionStorage.setItem(`answer_${currentQuestionIndex}`, transcript);
    }
    if (codeInput) {
      sessionStorage.setItem(`code_${currentQuestionIndex}`, codeInput);
    }
    
    // Clear the transcript before moving to next question
    if (setTranscript) {
      setTranscript('');
    }
    handleNextQuestion();
  };

  return (
    <div className="flex-1 flex flex-col glass-card">
      <QuestionDisplay 
        question={currentQuestion}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
      
      <div className="flex-1 flex flex-col">
        {isInterviewComplete ? (
          <InterviewComplete onFinishInterview={handleFinishInterview} />
        ) : (
          <div className="flex-1 flex flex-col">
            {localShowCodeInput ? (
              <CodeInputArea 
                codeInput={codeInput}
                onCodeChange={setCodeInput}
                onSubmit={handleSubmitCode}
                onToggleMode={handleToggleCodeInput}
              />
            ) : (
              <AnswerArea 
                transcript={transcript}
                isRecording={isRecording}
                isWaiting={localIsWaiting}
                waitingMessage={localWaitingMessage}
                showCodeInput={localShowCodeInput}
                onToggleCodeInput={handleToggleCodeInput}
                onTranscriptChange={setTranscript}
              />
            )}
            
            <RecordingControls 
              isRecording={isRecording}
              isWaiting={localIsWaiting}
              hasTranscript={!!transcript}
              timer={timer}
              formatTime={formatTime}
              onToggleRecording={handleToggleRecording}
              onNextQuestion={handleNextQuestionWithClear}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
};
