
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, FileText, Award } from 'lucide-react';
import Button from './Button';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "AI-Powered Questions",
    description: "Intelligent questions based on job role and your resume"
  },
  {
    icon: <Award className="h-6 w-6 text-primary" />,
    title: "Detailed Feedback",
    description: "Get personalized insights to improve your performance"
  },
  {
    icon: <Upload className="h-6 w-6 text-primary" />,
    title: "Practice Anytime",
    description: "Unlimited practice sessions to boost your confidence"
  }
];

const jobRoles = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "Marketing Specialist",
  "Sales Representative",
  "Financial Analyst",
  "Human Resources"
];

const LandingPage: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const navigate = useNavigate();
  
  const handleStartInterview = () => {
    // In a real app, we would upload the resume and process it
    // For now, we'll just navigate to the interview page
    navigate('/interview');
  };
  
  const jobRole = isCustomRole ? customRole : selectedRole;
  const isReadyToStart = resume && jobRole;
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Ace Your Next Interview with AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with our AI-powered interview simulator that provides personalized feedback to help you land your dream job.
          </p>
        </div>
        
        {/* Main Card */}
        <div className="glass-card max-w-3xl mx-auto mb-16 animate-fade-in" style={{animationDelay: "100ms"}}>
          <h2 className="text-2xl font-medium mb-6 text-center">Start Your Practice Interview</h2>
          
          <div className="space-y-8">
            <FileUpload
              label="Upload your resume"
              onChange={setResume}
              accept=".pdf,.doc,.docx"
            />
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select job role
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {jobRoles.map((role) => (
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
                  Custom job role
                </label>
              </div>
              
              {isCustomRole && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter job role (e.g., Frontend Developer)"
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
              Start Interview
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
