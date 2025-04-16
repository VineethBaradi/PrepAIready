import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Mic, MicOff, Square, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const FunctionalInterview: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sample interview questions
  const questions = [
    "Tell me about yourself and your experience.",
    "What are your greatest strengths?",
    "Describe a challenging project you worked on and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why should we hire you?"
  ];

  useEffect(() => {
    // Set first question on component mount
    setCurrentQuestion(questions[0]);
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      if (!videoRef.current) {
        toast({
          title: "Camera Error",
          description: "Video element not found. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }

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

      // Start confidence score simulation
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setConfidenceScore(prev => {
          const newScore = Math.min(100, prev + Math.floor(Math.random() * 10));
          return newScore;
        });
      }, 2000);

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
    cleanup();
    setIsCameraActive(false);
    setIsRecording(false);
    setConfidenceScore(0);
    
    toast({
      title: "Camera Stopped",
      description: "Your camera has been turned off.",
    });
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
          a.download = `interview-answer-${currentQuestion.substring(0, 20)}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        
        // Start timer
        setTimeElapsed(0);
        const timer = setInterval(() => {
          setTimeElapsed(prev => prev + 1);
        }, 1000);
        
        toast({
          title: "Recording Started",
          description: "Your answer is now being recorded.",
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

  const handleNextQuestion = () => {
    const currentIndex = questions.indexOf(currentQuestion);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
      setTranscript('');
      setIsAnswerSubmitted(false);
      setConfidenceScore(0);
    } else {
      toast({
        title: "Interview Complete",
        description: "You have completed all questions!",
      });
    }
  };

  const handleSubmitAnswer = () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsAnswerSubmitted(true);
    toast({
      title: "Answer Submitted",
      description: "Your answer has been recorded successfully.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex gap-6">
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
                      Recording... {formatTime(timeElapsed)}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Confidence Score</h3>
                  <Progress value={confidenceScore} className="h-2" />
                  <p className="text-right mt-1 text-sm text-gray-600">{confidenceScore}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Question and Answer */}
          <div className="w-1/2">
            <Card className="h-full p-4 bg-white">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Interview Questions</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Question {questions.indexOf(currentQuestion) + 1} of {questions.length}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Current Question</h3>
                  <Card className="p-4 bg-gray-50">
                    {currentQuestion}
                  </Card>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Your Answer</h3>
                  <Textarea
                    className="h-full resize-none"
                    placeholder="Type your answer here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    disabled={isAnswerSubmitted}
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setTranscript('')}
                      disabled={isAnswerSubmitted}
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={handleSubmitAnswer}
                      disabled={isAnswerSubmitted}
                    >
                      Submit Answer
                    </Button>
                  </div>
                  {isAnswerSubmitted && (
                    <Button 
                      variant="outline" 
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2"
                    >
                      Next Question
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalInterview; 