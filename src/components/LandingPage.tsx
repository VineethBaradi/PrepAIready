import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, FileText, Award, Database, Brain, Clipboard } from 'lucide-react';
import Button from './Button';
import FileUpload from './FileUpload';
import { cn } from '@/lib/utils';
import { getApiKey, dataRoles } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from './ui/textarea';

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
  const [jobDescription, setJobDescription] = useState<string>(`Data Analyst Job Description:

We are seeking a skilled Data Analyst to join our team. The ideal candidate will be responsible for:

• Analyzing large datasets to identify trends, patterns, and insights
• Creating data visualizations and reports to communicate findings
• Working with SQL and data analysis tools to extract and manipulate data
• Collaborating with stakeholders to understand business requirements
• Developing and maintaining dashboards for key performance indicators
• Ensuring data accuracy and integrity in all analyses
• Presenting findings to both technical and non-technical audiences

Requirements:
• Strong analytical and problem-solving skills
• Proficiency in SQL and data visualization tools
• Experience with statistical analysis and data modeling
• Excellent communication and presentation skills
• Ability to work with cross-functional teams
• Bachelor's degree in Data Science, Statistics, or related field

This role offers the opportunity to work with cutting-edge data technologies and make a significant impact on business decisions.`);
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
    
    // Store resume and job description in sessionStorage
    if (resume) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        sessionStorage.setItem('resume', content);
        sessionStorage.setItem('jobDescription', jobDescription);
        navigate('/interview');
      };
      reader.readAsText(resume);
    }
  };
  
  const isReadyToStart = resume && jobDescription;
  
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
                Job Description
              </label>
              <div className="relative">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you're preparing for..."
                  className="min-h-[150px] resize-none"
                />
                <div className="absolute top-2 right-2 text-muted-foreground">
                  <Clipboard className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The job description helps us generate more relevant interview questions
              </p>
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
