import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Code, Edit2, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { isCodingQuestion } from '@/utils/codingQuestionDetector';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface AnswerAreaProps {
  transcript: string;
  isRecording: boolean;
  isWaiting: boolean;
  waitingMessage: string;
  showCodeInput?: boolean;
  onToggleCodeInput?: () => void;
  onTranscriptChange?: (newTranscript: string) => void;
}

export const AnswerArea: React.FC<AnswerAreaProps> = ({
  transcript,
  isRecording,
  isWaiting,
  waitingMessage,
  showCodeInput = false,
  onToggleCodeInput,
  onTranscriptChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentQuestion = sessionStorage.getItem('currentQuestion') || '';
  const needsCodeInput = isCodingQuestion(currentQuestion);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  
  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);
  
  useEffect(() => {
    console.log("AnswerArea received transcript:", transcript);
  }, [transcript]);
  
  // Auto-scroll to bottom when transcript changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onTranscriptChange) {
      onTranscriptChange(editedTranscript);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTranscript(transcript);
    setIsEditing(false);
  };

  // Determine if we should show the transcript or listening message
  const hasTranscript = transcript && transcript.trim().length > 0;
  const showTranscript = hasTranscript && !isWaiting;
  const showListening = isRecording && !hasTranscript && !isWaiting;
  const showStartPrompt = !isRecording && !hasTranscript && !isWaiting;
  const showEditButton = !isRecording && hasTranscript && !isWaiting;

  return (
    <div 
      className={cn(
        "flex-1 p-4 border rounded-lg mb-4 transition-all duration-300 relative",
        isRecording 
          ? "border-primary bg-primary/5 animate-pulse-subtle" 
          : "border-input"
      )}
    >
      {needsCodeInput && onToggleCodeInput && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="input-mode"
              checked={showCodeInput}
              onCheckedChange={onToggleCodeInput}
            />
            <Code className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
      
      {isWaiting ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">{waitingMessage}</p>
          </div>
        </div>
      ) : showTranscript ? (
        <div className="relative">
          {!isEditing ? (
            <>
              <ScrollArea className="h-full max-h-[300px]">
                <div className="pr-4" ref={scrollRef}>
                  <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
              </ScrollArea>
              {showEditButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="absolute top-2 right-2"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <ScrollArea className="h-full max-h-[300px]">
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </ScrollArea>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : showListening ? (
        <div className="text-muted-foreground text-center my-8">
          Listening... Speak your answer to the question
        </div>
      ) : showStartPrompt ? (
        <div className="text-muted-foreground text-center my-8">
          Click the microphone button to start answering
        </div>
      ) : null}
    </div>
  );
};
