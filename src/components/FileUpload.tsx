
import React, { useState } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // In MB
  onChange: (file: File | null) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.doc,.docx',
  maxSize = 5, // Default 5MB
  onChange,
  className,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const validateFile = (selectedFile: File): boolean => {
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    // Check file type
    const fileTypes = accept.split(',');
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileTypes.includes(fileExtension)) {
      setError(`File type not supported. Please upload: ${accept}`);
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleFile = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onChange(selectedFile);
    } else {
      setFile(null);
      onChange(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleRemove = () => {
    setFile(null);
    onChange(null);
    setError(null);
  };
  
  return (
    <div className={cn('w-full', className)}>
      <p className="text-sm font-medium mb-2">{label}</p>
      
      {!file ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            error ? 'border-destructive/50 bg-destructive/5' : ''
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-center text-sm">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept.replace(/\./g, '').toUpperCase()} up to {maxSize}MB
          </p>
          
          {error && (
            <p className="text-xs text-destructive mt-2 animate-slide-up">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center p-3 bg-accent rounded-lg animate-fade-in">
          <div className="h-9 w-9 rounded bg-background flex items-center justify-center mr-3">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 ml-2 rounded-full"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
