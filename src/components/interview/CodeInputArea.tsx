
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

interface CodeInputAreaProps {
  codeInput: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
}

export const CodeInputArea: React.FC<CodeInputAreaProps> = ({
  codeInput,
  onCodeChange,
  onSubmit
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <p className="text-sm font-medium mb-2">Please write your code solution:</p>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <textarea
          value={codeInput}
          onChange={(e) => onCodeChange(e.target.value)}
          className="flex-1 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="# Write your SQL query or Python code here..."
        />
        <div className="flex justify-end mt-4">
          <Button 
            type="submit"
            className="inline-flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              console.log("Submit button clicked");
              onSubmit();
            }}
          >
            Submit Code
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
