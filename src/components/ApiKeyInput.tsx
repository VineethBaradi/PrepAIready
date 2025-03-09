
import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKey, getApiKey } from '@/services/aiService';

interface ApiKeyInputProps {
  onKeySubmit?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySubmit }) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKeyLocal] = useState('');
  const [hasKey, setHasKey] = useState(false);
  
  useEffect(() => {
    const key = getApiKey();
    setHasKey(!!key);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(apiKey);
    setHasKey(true);
    setOpen(false);
    if (onKeySubmit) onKeySubmit();
  };
  
  return (
    <>
      <Button 
        variant={hasKey ? "outline" : "destructive"} 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Key className="h-4 w-4" />
        {hasKey ? "API Key Saved" : "Set API Key"}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>DeepSeek API Key</DialogTitle>
            <DialogDescription>
              Enter your DeepSeek API key to enable AI-generated interview questions and feedback.
              The key will be stored in your browser's local storage.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyLocal(e.target.value)}
                  placeholder="Enter your DeepSeek API key"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyInput;
