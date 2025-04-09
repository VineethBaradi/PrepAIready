import React, { useState, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { toast } from '@/components/ui/use-toast';
import { useSpeechControl } from './useSpeechControl';
import { QuestionDisplay } from '../interview/QuestionDisplay';
import { AnswerArea } from '../interview/AnswerArea';
import { CodeInputArea } from '../interview/CodeInputArea';
import { RecordingControls } from '../interview/RecordingControls';
import { InterviewComplete } from '../interview/InterviewComplete';
import { cleanQuestionText } from '@/utils/questionUtils';

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
  cleanedQuestions?: string[];
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
  handleFinishInterview,
  cleanedQuestions = []
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
  
  // Use cleaned questions if available, otherwise clean them now
  const displayQuestions = cleanedQuestions.length > 0 
    ? cleanedQuestions 
    : questions.map(cleanQuestionText);
  
  const currentQuestion = displayQuestions[currentQuestionIndex] || "";
  
  // Store current question in sessionStorage for AnswerArea to check
  useEffect(() => {
    if (currentQuestion) {
      sessionStorage.setItem('currentQuestion', currentQuestion);
    }
    console.log("Current question:", currentQuestion);
  }, [currentQuestion]);

  const {
    transcript,
    isRecording,
    isSpeaking,
    isMuted,
    toggleMute,
    toggleRecording,
    readQuestion,
    resetTranscript,
    hasRecordedTranscript
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

  // Reset transcript when moving to next question
  useEffect(() => {
    console.log("Current question index changed, resetting transcript");
    if (resetTranscript) {
      resetTranscript();
    }
  }, [currentQuestionIndex, resetTranscript]);

  const handleToggleRecording = () => {
    console.log("Toggling recording");
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
  };

  const handleNextWithReset = () => {
    console.log("Handling next question with reset");
    // Clear transcript first
    resetTranscript();
    // Then go to next question
    handleNextQuestion();
    
    // Notify the user
    toast({
      title: "Next Question",
      description: "Moving to the next question"
    });
  };

  // Debug logging for transcript
  useEffect(() => {
    console.log("InterviewMain - Current transcript:", transcript);
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
    };
  }, [waitingTimerRef]);
  
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
        ) : localShowCodeInput ? (
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
              isWaiting={localIsWaiting}
              waitingMessage={localWaitingMessage}
              showCodeInput={localShowCodeInput}
              onToggleCodeInput={handleToggleCodeInput}
            />
            
            <RecordingControls 
              isRecording={isRecording}
              isWaiting={localIsWaiting}
              hasTranscript={hasRecordedTranscript}
              timer={timer}
              formatTime={formatTime}
              onToggleRecording={handleToggleRecording}
              onNextQuestion={handleNextWithReset}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
};
