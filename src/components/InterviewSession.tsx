
import React, { useEffect } from 'react';
import { useInterviewQuestions } from './interview-session/useInterviewQuestions';
import { useInterviewState } from './interview-session/useInterviewState';
import { InterviewLoading } from './interview-session/InterviewLoading';
import { InterviewError } from './interview-session/InterviewError';
import { InterviewMain } from './interview-session/InterviewMain';
import { ProgressDisplay } from './interview/ProgressDisplay';

const InterviewSession: React.FC = () => {
  const {
    questions,
    answers,
    evaluations,
    isLoading,
    usingFallbackQuestions,
    setAnswers,
    setEvaluations
  } = useInterviewQuestions();
  
  const {
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
    cleanedQuestions
  } = useInterviewState({
    questions,
    answers,
    evaluations,
    setAnswers,
    setEvaluations
  });
  
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
    };
  }, [waitingTimerRef]);
  
  if (isLoading) {
    return <InterviewLoading />;
  }
  
  if (questions.length === 0) {
    return <InterviewError />;
  }
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <ProgressDisplay 
          currentIndex={currentQuestionIndex} 
          totalQuestions={questions.length}
          usingFallbackQuestions={usingFallbackQuestions}
        />
        
        <InterviewMain
          questions={questions}
          answers={answers}
          evaluations={evaluations}
          currentQuestionIndex={currentQuestionIndex}
          isWaiting={isWaiting}
          waitingMessage={waitingMessage}
          isInterviewComplete={isInterviewComplete}
          showCodeInput={showCodeInput}
          codeInput={codeInput}
          waitingTimerRef={waitingTimerRef}
          handleNextQuestion={handleNextQuestion}
          processAnswer={processAnswer}
          setCodeInput={setCodeInput}
          handleSubmitCode={handleSubmitCode}
          handleFinishInterview={handleFinishInterview}
          cleanedQuestions={cleanedQuestions}
        />
      </div>
    </div>
  );
};

export default InterviewSession;
