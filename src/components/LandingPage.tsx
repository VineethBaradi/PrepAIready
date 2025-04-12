
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, FileText, Award, Database, Brain } from 'lucide-react';
import Button from './Button';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';
import { getApiKey, dataRoles } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';

const features = [
  {
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "AI-Powered Interview Prep",
    description: "Dynamic questions tailored to your resume and job role"
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Resume Analysis",
    description: "AI generates questions based on your skills and experience"
  },
  {
    icon: <Award className="h-6 w-6 text-primary" />,
    title: "Personalized Feedback",
    description: "Get AI-driven insights to improve your interview performance"
  }
];

const LandingPage: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const navigate = useNavigate();
  
  const handleStartInterview = () => {
    // Check if API key is available
    if (!getApiKey()) {
      toast({
        title: "System Not Available",
        description: "The interview system is temporarily unavailable. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    // Store resume and job role in sessionStorage
    if (resume) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        sessionStorage.setItem('resume', content);
        sessionStorage.setItem('jobRole', isCustomRole ? customRole : selectedRole);
        navigate('/interview');
      };
      reader.readAsText(resume);
    }
  };
  
  const jobRole = isCustomRole ? customRole : selectedRole;
  const isReadyToStart = resume && jobRole;
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Ace Your Interview with PrepAIready
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with our AI-powered interview simulator. Get personalized feedback to help you land your dream job with confidence.
          </p>
        </div>
        
        {/* Main Card */}
        <div className="glass-card max-w-3xl mx-auto mb-16 animate-fade-in" style={{animationDelay: "100ms"}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-center">Start Your Interview Practice</h2>
          </div>
          
          <div className="space-y-8">
            <FileUpload
              label="Upload your resume"
              onChange={setResume}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select job role
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {dataRoles.map((role) => (
                  <button
                    key={role}
                    className={cn(
                      "p-3 text-sm border rounded-lg transition-all",
                      selectedRole === role && !isCustomRole
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsCustomRole(false);
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  id="custom-role"
                  type="checkbox"
                  checked={isCustomRole}
                  onChange={() => setIsCustomRole(!isCustomRole)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="custom-role"
                  className="ml-2 block text-sm"
                >
                  Other job role (specify)
                </label>
              </div>
              
              {isCustomRole && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter specific job role (e.g., Frontend Developer)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
            
            <Button
              variant="primary"
              rightIcon={<ArrowRight />}
              fullWidth
              onClick={handleStartInterview}
              disabled={!isReadyToStart}
            >
              Start Interview Practice
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="neo-card flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
