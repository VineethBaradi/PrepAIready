
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, BarChart3, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

// Mock feedback data
const mockFeedback = {
  overallScore: 8.2,
  technicalScore: 7.8,
  communicationScore: 8.5,
  confidenceScore: 8.3,
  strengths: [
    "Strong technical knowledge demonstrated in system design questions",
    "Clear and concise communication style",
    "Good examples provided to support claims",
    "Thoughtful responses to behavioral questions"
  ],
  improvements: [
    "Consider providing more specific metrics when discussing past achievements",
    "Could improve depth of knowledge in distributed systems concepts",
    "Sometimes used filler words like 'um' and 'like'",
    "Take more time to structure complex answers before diving in"
  ],
  questionFeedback: [
    {
      question: "Tell me about yourself and your background.",
      rating: 9,
      feedback: "Excellent introduction that highlighted relevant experience and skills. Good balance of personal and professional information."
    },
    {
      question: "What interests you about this role?",
      rating: 8,
      feedback: "Demonstrated good research about the company and role. Could have made a stronger connection between personal goals and company mission."
    },
    {
      question: "Describe a challenging project you worked on and how you handled it.",
      rating: 7,
      feedback: "Good example, but could have followed the STAR method more clearly to structure the response. The outcome was well explained."
    },
    {
      question: "What are your strengths and weaknesses?",
      rating: 8,
      feedback: "Honest self-assessment with good examples. The weakness mentioned was genuine and you explained how you're working to improve it."
    },
    {
      question: "How do you stay current with industry trends?",
      rating: 9,
      feedback: "Excellent response with specific resources and learning methods mentioned. Showed proactive approach to professional development."
    }
  ]
};

const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const navigate = useNavigate();
  
  const handlePracticeAgain = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold mb-2">Your Interview Feedback</h1>
          <p className="text-muted-foreground">
            Review your performance and get insights to help you improve.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b mb-6 animate-fade-in">
          <button
            className={cn(
              "pb-2 mr-8 text-sm font-medium transition-colors relative",
              activeTab === 'overview'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('overview')}
          >
            Overview
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            className={cn(
              "pb-2 text-sm font-medium transition-colors relative",
              activeTab === 'detailed'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('detailed')}
          >
            Question Details
            {activeTab === 'detailed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
        
        {activeTab === 'overview' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Overall Score Card */}
            <div className="glass-card flex flex-col md:flex-row items-center">
              <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
                <div className="text-5xl font-bold text-primary">
                  {mockFeedback.overallScore}<span className="text-xl text-muted-foreground">/10</span>
                </div>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5 mr-1",
                        i < Math.round(mockFeedback.overallScore / 2)
                          ? "text-primary fill-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ScoreCard
                    title="Technical"
                    score={mockFeedback.technicalScore}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                  <ScoreCard
                    title="Communication"
                    score={mockFeedback.communicationScore}
                    icon={<Award className="h-5 w-5" />}
                  />
                  <ScoreCard
                    title="Confidence"
                    score={mockFeedback.confidenceScore}
                    icon={<Award className="h-5 w-5" />}
                  />
                </div>
              </div>
            </div>
            
            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neo-card">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  Your Strengths
                </h3>
                <ul className="space-y-3">
                  {mockFeedback.strengths.map((strength, index) => (
                    <li key={index} className="flex">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="neo-card">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </div>
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {mockFeedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Practice Again */}
            <div className="text-center pt-6">
              <Button
                variant="primary"
                onClick={handlePracticeAgain}
                size="lg"
              >
                Practice Another Interview
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Question Details */}
            <div className="glass-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Question Feedback</h3>
                <div className="text-sm text-muted-foreground">
                  Question {activeQuestionIndex + 1} of {mockFeedback.questionFeedback.length}
                </div>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg mb-4">
                <p className="text-sm font-medium mb-1">Question:</p>
                <p>{mockFeedback.questionFeedback[activeQuestionIndex].question}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Your Performance:</p>
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-primary mr-1">
                      {mockFeedback.questionFeedback[activeQuestionIndex].rating}
                    </span>
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-secondary rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${mockFeedback.questionFeedback[activeQuestionIndex].rating * 10}%` }}
                  />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Feedback:</p>
                <p className="text-sm text-muted-foreground">
                  {mockFeedback.questionFeedback[activeQuestionIndex].feedback}
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestionIndex === 0}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveQuestionIndex(prev => Math.min(mockFeedback.questionFeedback.length - 1, prev + 1))}
                  disabled={activeQuestionIndex === mockFeedback.questionFeedback.length - 1}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                variant="primary"
                onClick={handlePracticeAgain}
              >
                Practice Another Interview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, icon }) => {
  return (
    <div className="p-4 rounded-lg border bg-background flex items-center">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-medium">{score}<span className="text-sm text-muted-foreground">/10</span></p>
      </div>
    </div>
  );
};

export default FeedbackPage;
