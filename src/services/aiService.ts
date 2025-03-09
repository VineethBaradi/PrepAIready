import { toast } from "@/components/ui/use-toast";

// DeepSeek API base URL
const API_URL = "https://api.deepseek.com/v1/chat/completions";

// Fixed API key for data domain interviews
const DEEPSEEK_API_KEY = "sk-4277bf92d5de4cb3b7ccc16e10053d67";

// We'll keep the user API key functionality for backward compatibility
let userProvidedApiKey: string | null = null;

export const setApiKey = (apiKey: string) => {
  userProvidedApiKey = apiKey;
  localStorage.setItem('deepseek_api_key', apiKey);
};

export const getApiKey = (): string => {
  // First prioritize the fixed API key for the data domain
  if (DEEPSEEK_API_KEY) return DEEPSEEK_API_KEY;
  
  // Fall back to user provided key if needed
  if (!userProvidedApiKey) {
    userProvidedApiKey = localStorage.getItem('deepseek_api_key');
  }
  return userProvidedApiKey || "";
};

// Data domain roles for validation
export const dataRoles = [
  "Data Analyst",
  "Data Engineer", 
  "Data Scientist",
  "ML Engineer",
  "AI Engineer",
  "Business Intelligence Analyst",
  "Database Administrator",
  "Big Data Engineer",
  "Analytics Engineer",
  "Data Architect"
];

interface GenerateQuestionsOptions {
  resume: string;
  jobRole: string;
  count?: number;
}

export const generateInterviewQuestions = async (
  options: GenerateQuestionsOptions
): Promise<string[]> => {
  const { resume, jobRole, count = 8 } = options;
  const apiKey = getApiKey();

  if (!apiKey) {
    toast({
      title: "API Key Error",
      description: "There was an issue with the API key. Please try again later.",
      variant: "destructive",
    });
    return [];
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an expert technical interviewer for the data domain. You specialize in interviewing candidates for roles like Data Analysts, Data Engineers, Data Scientists, ML Engineers, and AI Engineers. Your task is to generate relevant technical and behavioral interview questions based on a resume and job role.`
          },
          {
            role: "user",
            content: `Generate ${count} interview questions for a ${jobRole} position based on this resume:\n\n${resume}\n\nCreate a mix of technical questions specific to ${jobRole} (SQL, Python, statistics, data modeling, machine learning concepts as relevant) and behavioral questions. Focus on assessing both technical skills and soft skills necessary for data professionals. Format your response as a JSON array of strings, with each string being a question.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response to extract questions
    let questions: string[] = [];
    try {
      const content = data.choices[0].message.content;
      // Try to parse as JSON if the model returned a JSON string
      questions = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract questions by line
      const content = data.choices[0].message.content;
      questions = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);
    }

    if (questions.length === 0) {
      throw new Error("Failed to parse questions from API response");
    }

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast({
      title: "Error",
      description: "Failed to generate interview questions. Please try again.",
      variant: "destructive",
    });
    
    // Return some fallback data-focused questions in case of API failure
    return [
      "Can you explain your experience with SQL and data manipulation?",
      "Describe a challenging data analysis project you worked on and how you approached it.",
      "How do you handle missing or inconsistent data in your analyses?",
      "Explain a machine learning model you've implemented and how you evaluated its performance.",
      "How do you communicate complex data insights to non-technical stakeholders?",
      "Describe your experience with data visualization tools and techniques.",
      "How do you approach data quality assurance in your projects?",
      "What ETL processes have you implemented or worked with?"
    ];
  }
};

// Function to evaluate a single interview answer
export const evaluateAnswer = async (
  question: string,
  answer: string,
  jobRole: string
): Promise<{ score: number; feedback: string }> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { 
      score: 0, 
      feedback: "Unable to evaluate response. API key missing." 
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an expert interviewer and evaluator for data roles. You're evaluating a candidate for a ${jobRole} position. Provide a concise evaluation of their answer.`
          },
          {
            role: "user",
            content: `Question: ${question}\nCandidate's Answer: ${answer}\n\nEvaluate this answer on a scale of 1-10 and provide brief, constructive feedback. Return your response in JSON format with 'score' and 'feedback' fields.`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the evaluation
    try {
      // Try to parse as JSON
      const evaluation = JSON.parse(content);
      return {
        score: evaluation.score || 5,
        feedback: evaluation.feedback || "No specific feedback provided."
      };
    } catch (e) {
      // If parsing fails, extract score and feedback manually
      const scoreMatch = content.match(/score[:\s]*([0-9\.]+)/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 5;
      
      // Remove the score part to get the feedback
      const feedback = content.replace(/score[:\s]*([0-9\.]+)/i, '').trim();
      
      return { score, feedback };
    }
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return { 
      score: 5, 
      feedback: "Unable to evaluate this response due to a technical issue." 
    };
  }
};

// Function to analyze interview responses
export const analyzeInterviewResponses = async (
  questions: string[],
  answers: string[],
  jobRole: string,
  resume: string
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    toast({
      title: "API Key Error",
      description: "There was an issue with the API key. Please try again later.",
      variant: "destructive",
    });
    return "Unable to analyze responses. API key missing.";
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an expert data interviewer and analyst specializing in roles like Data Scientists, Data Engineers, and ML Engineers. Your task is to provide constructive feedback on technical interviews for data professionals.`
          },
          {
            role: "user",
            content: `Please analyze the following interview for a ${jobRole} position. 
            
Resume: ${resume}

Questions and answers:
${questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n")}

Provide a detailed feedback analysis covering:
1. Technical proficiency in data concepts, tools, and methodologies
2. Understanding of data analysis, modeling, or engineering principles
3. Problem-solving approach for data challenges
4. Communication of complex data concepts
5. Overall fit for a ${jobRole} position
6. Specific areas for improvement with actionable steps
7. Technical skills they should develop further for this role
8. Overall score on a scale of 1-100

Format the response as constructive professional feedback that would help the candidate improve their data skills and interview performance.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;
    
    return feedback;
  } catch (error) {
    console.error("Error analyzing interview responses:", error);
    toast({
      title: "Error",
      description: "Failed to analyze interview responses. Please try again.",
      variant: "destructive",
    });
    
    return "An error occurred while analyzing your responses. Please try again later.";
  }
};
