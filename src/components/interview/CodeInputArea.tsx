
import React from 'react';
import { Send } from 'lucide-react';
import Button from '../Button';

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
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <p className="text-sm font-medium mb-2">Please write your code solution:</p>
      <textarea
        value={codeInput}
        onChange={(e) => onCodeChange(e.target.value)}
        className="flex-1 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="# Write your SQL query or Python code here..."
      />
      <div className="flex justify-end mt-4">
        <Button 
          variant="primary"
          onClick={onSubmit}
          rightIcon={<Send className="h-4 w-4" />}
        >
          Submit Code
        </Button>
      </div>
    </div>
  );
};
