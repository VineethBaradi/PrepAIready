import React, { useEffect, useRef, useState } from 'react';
import { useInterviewQuestions } from './interview-session/useInterviewQuestions';
import { useInterviewState } from './interview-session/useInterviewState';
import { InterviewLoading } from './interview-session/InterviewLoading';
import { InterviewError } from './interview-session/InterviewError';
import { InterviewMain } from './interview-session/InterviewMain';
import { ProgressDisplay } from './interview/ProgressDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, Square } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InterviewSession: React.FC = () => {
  // Camera and recording state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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
    handleFinishInterview
  } = useInterviewState({
    questions,
    answers,
    evaluations,
    setAnswers,
    setEvaluations
  });

  // Check browser support for camera
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support camera access. Please use a modern browser.",
        variant: "destructive"
      });
    }
  }, []);

  // Camera control functions
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support camera access. Please use a modern browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, ensure any existing streams are stopped
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access with basic constraints first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      // Wait for the video element to be available
      if (!videoRef.current) {
        console.error('Video element not found');
        toast({
          title: "Camera Error",
          description: "Video element not found. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }

      // Set up the video element
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => {
          console.error('Error playing video:', e);
          toast({
            title: "Video Playback Error",
            description: "Failed to play camera feed. Please refresh and try again.",
            variant: "destructive"
          });
        });
      };

      streamRef.current = stream;
      setIsCameraActive(true);
      
      toast({
        title: "Camera Active",
        description: "Your camera is now on.",
      });

    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let errorMessage = "Unable to access camera. ";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += "Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += "No camera device found. Please connect a camera.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += "Camera is in use by another application.";
      } else {
        errorMessage += "Please check your camera permissions and try again.";
      }

      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      
      setIsCameraActive(false);
      
      toast({
        title: "Camera Stopped",
        description: "Your camera has been turned off.",
      });
    } catch (err) {
      console.error('Error stopping camera:', err);
      toast({
        title: "Error",
        description: "Failed to stop camera properly. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const startRecording = () => {
    if (streamRef.current && !isRecording) {
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Create a download link for the recording
          const a = document.createElement('a');
          a.href = url;
          a.download = `interview-question-${currentQuestionIndex + 1}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        
        toast({
          title: "Recording Started",
          description: "Your interview is now being recorded.",
        });
      } catch (err) {
        console.error('Error starting recording:', err);
        toast({
          title: "Recording Error",
          description: "Failed to start recording. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Your recording will be downloaded automatically.",
      });
    }
  };
  
  useEffect(() => {
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl w-full mx-auto">
        <ProgressDisplay 
          currentIndex={currentQuestionIndex} 
          totalQuestions={questions.length}
          usingFallbackQuestions={usingFallbackQuestions}
        />
        
        <div className="flex gap-6 mt-6">
          {/* Left side - Camera feed */}
          <div className="w-1/2">
            <Card className="h-full p-4 bg-white">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Camera Feed</h2>
                  <div className="flex space-x-2">
                    {!isCameraActive ? (
                      <Button 
                        onClick={startCamera}
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive" 
                        onClick={stopCamera}
                        className="flex items-center gap-2"
                      >
                        <VideoOff className="h-4 w-4" />
                        Stop Camera
                      </Button>
                    )}
                    {isCameraActive && (
                      <>
                        {!isRecording ? (
                          <Button 
                            onClick={startRecording}
                            className="flex items-center gap-2"
                          >
                            <Mic className="h-4 w-4" />
                            Record
                          </Button>
                        ) : (
                          <Button 
                            variant="destructive"
                            onClick={stopRecording}
                            className="flex items-center gap-2"
                          >
                            <Square className="h-4 w-4" />
                            Stop
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-[400px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <VideoOff className="h-12 w-12 mx-auto mb-2" />
                        <p>Camera is off</p>
                        <p className="text-sm mt-2">Click 'Start Camera' to begin</p>
                      </div>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      Recording...
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Interview content */}
          <div className="w-1/2">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
