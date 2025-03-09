
import { toast } from "@/components/ui/use-toast";

// DeepSeek API base URL
const API_URL = "https://api.deepseek.com/v1/chat/completions";

// Temporary API key input handling until Supabase integration
let userProvidedApiKey: string | null = null;

export const setApiKey = (apiKey: string) => {
  userProvidedApiKey = apiKey;
  localStorage.setItem('deepseek_api_key', apiKey);
};

export const getApiKey = (): string | null => {
  if (!userProvidedApiKey) {
    userProvidedApiKey = localStorage.getItem('deepseek_api_key');
  }
  return userProvidedApiKey;
};

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
      title: "API Key Required",
      description: "Please provide a DeepSeek API key to generate questions.",
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
        model: "deepseek-chat", // Update with the correct model from DeepSeek
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer. Your task is to generate relevant interview questions based on a resume and job role."
          },
          {
            role: "user",
            content: `Please generate ${count} interview questions for a ${jobRole} position based on the following resume:\n\n${resume}\n\nProvide questions that will test both technical skills and behavioral aspects. Format your response as a JSON array of strings, with each string being a question.`
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
    // Note: Adjust this based on actual DeepSeek API response format
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
    
    // Return some fallback questions in case of API failure
    return [
      "Tell me about yourself and your background.",
      "What interests you about this role?",
      "Describe a challenging project you worked on and how you handled it.",
      "What are your strengths and weaknesses?",
      "How do you stay current with industry trends?",
    ];
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
      title: "API Key Required",
      description: "Please provide a DeepSeek API key to analyze responses.",
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
        model: "deepseek-chat", // Update with the correct model
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer and analyst. Your task is to provide constructive feedback on interview responses."
          },
          {
            role: "user",
            content: `Please analyze the following interview for a ${jobRole} position. 
            
Resume: ${resume}

Questions and answers:
${questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n")}

Provide a detailed feedback analysis covering:
1. Technical proficiency
2. Communication clarity
3. Overall impression
4. Areas for improvement
5. Strengths demonstrated

Format the response as constructive feedback that would help the candidate improve.`
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
