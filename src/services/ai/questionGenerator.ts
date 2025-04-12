
import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

export interface GenerateQuestionsOptions {
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
    return generateFallbackQuestions(jobRole);
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
            content: `Act as a Technical Interviewer for a ${jobRole} position. Your goal is to gauge the candidate's fit for this role by asking technical (50%), coding (25%), and behavioral/situational (25%) questions. For technical roles, focus on relevant technical skills and problem-solving.

Steps to Follow:
1. Analyze the Resume: Identify key skills, experience, and potential knowledge gaps.

2. Create Questions:
   - Technical: Questions about tools/technologies/methodologies relevant to ${jobRole}
   - Coding/Problem-Solving: Questions that demonstrate technical problem-solving abilities
   - Behavioral: Questions about teamwork, challenges, and professional experiences
   
3. Make questions specific to the candidate's background when possible.`
          },
          {
            role: "user",
            content: `Generate ${count} challenging interview questions for a ${jobRole} position based on this resume:\n\n${resume}\n\nCreate a mix of questions including technical questions specific to ${jobRole}, problem-solving questions, and behavioral questions. Format your response as a JSON array of strings, with each string being a question.`
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
        return generateFallbackQuestions(jobRole);
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
    
    return generateFallbackQuestions(jobRole);
  }
};

// Generate fallback questions if AI fails
async function generateFallbackQuestions(jobRole: string): Promise<string[]> {
  // Create generic questions based on job role
  return [
    `Tell me about your experience in ${jobRole}.`,
    `What technical skills do you have that are relevant to ${jobRole}?`,
    `Describe a challenging project you worked on related to ${jobRole}.`,
    `How do you stay updated with the latest trends in ${jobRole}?`,
    `What methodologies or frameworks do you use in your ${jobRole} work?`,
    `Tell me about a time you had to solve a complex problem in your role.`,
    `How do you approach working with a team on ${jobRole} projects?`,
    `Where do you see the future of ${jobRole} heading?`
  ];
}
