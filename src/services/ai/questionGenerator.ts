import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

export interface GenerateQuestionsOptions {
  resume: string;
  jobDescription: string;
  count?: number;
}

export const generateInterviewQuestions = async (
  options: GenerateQuestionsOptions
): Promise<string[]> => {
  const { resume, jobDescription, count = Math.floor(Math.random() * (15 - 12 + 1)) + 12 } = options;
  const apiKey = getApiKey();

  if (!apiKey) {
    toast({
      title: "API Key Error",
      description: "There was an issue with the API key. Please try again later.",
      variant: "destructive",
    });
    return generateFallbackQuestions();
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
            content: `Act as a Technical Interviewer. Your goal is to gauge the candidate's fit for a position by asking 12- 15 interview questions about previous work experience from resume, technical (50%), coding (25%), and behavioral/situational (25%) questions. For technical roles, focus on relevant technical skills and problem-solving.\n\nSteps to Follow:\n1. Analyze the Resume: Identify key skills, experience, and potential knowledge gaps.\n2. Review Job Description: Consider the specific requirements and responsibilities.\n3. Create Questions:\n   - Technical: Questions about tools/technologies/methodologies relevant to the job description\n   - Coding/Problem-Solving: Questions that demonstrate technical problem-solving abilities\n   - Behavioral: Questions about teamwork, challenges, and professional experiences\n4. Make questions specific to the candidate's background and job requirements when possible. And let the interview flow naturally with basic self introduction and ice breaking questions. And make sure the questions are very frequently asked in interviews for the role. And conclude the interview formally, and ask for feedback for the interview.`
          },
          {
            role: "user",
            content: `Generate 12 to 15 challenging interview questions for a position based on this resume and job description:\n\nResume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nCreate a mix of questions including previous work experience, relation between work experience and job description requirements, technical questions, problem-solving questions, and behavioral questions. Format your response as a JSON array of strings, with each string being a question.And let the interview flow naturally with basic self introduction and ice breaking questions. And make sure the questions are very frequently asked in interviews for the role.And conclude the interview formally, and ask for feedback for the interview.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        toast({
          title: "API Limit Reached",
          description: "Using generated fallback questions for this interview session.",
          variant: "default",
        });
        return generateFallbackQuestions();
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response to extract questions
    let questions: string[] = [];
    try {
      const content = data.choices[0].message.content;
      // Try to parse as JSON if the model returned a JSON string
      const parsedContent = JSON.parse(content);
      questions = Array.isArray(parsedContent) ? parsedContent : []; 
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

    // Clean up questions - remove JSON formatting, headers, etc.
    questions = questions.map(question => {
      // Remove JSON formatting indicators, headers, and annotations
      return question
        .replace(/```json|```|^\[|\]$|^"?|"?$/g, '')
        .replace(/^\/\/ \w+ Questions \(\d+%\):/i, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
    });
    
    // Filter out any empty questions
    questions = questions.filter(q => q && q.length > 5);

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast({
      title: "Using Fallback Questions",
      description: "We're generating generic questions for your interview practice.",
      variant: "default",
    });
    
    return generateFallbackQuestions();
  }
};

// Generate fallback questions if AI fails
async function generateFallbackQuestions(): Promise<string[]> {
  // Create generic questions
  return [
    `Tell me about your experience relevant to this position.`,
    `What technical skills do you have that are relevant to this job?`,
    `Describe a challenging project you worked on related to this field.`,
    `How do you stay updated with the latest trends in your profession?`,
    `What methodologies or frameworks do you use in your work?`,
    `Tell me about a time you had to solve a complex problem in your role.`,
    `How do you approach working with a team on projects?`,
    `Where do you see the future of this field heading?`
  ];
}
