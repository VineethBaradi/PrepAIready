import React from 'react';
import { Code, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface CodeInputAreaProps {
  codeInput: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
}

export const CodeInputArea: React.FC<CodeInputAreaProps> = ({
  codeInput,
  onCodeChange,
  onSubmit,
  onToggleMode
}) => {
  return (
    <div className="flex-1 p-4 border rounded-lg mb-4 relative">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="input-mode"
            checked={true}
            onCheckedChange={onToggleMode}
          />
          <Code className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1">
          <Textarea
            value={codeInput}
            onChange={(e) => onCodeChange(e.target.value)}
            className="h-full min-h-[300px] font-mono text-sm"
            placeholder="Write your code here..."
          />
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={onSubmit}>
            Submit Code
          </Button>
        </div>
      </div>
    </div>
  );
};
