
import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';
import { technicalQuestions, generateTechnicalQuestions } from './technicalQuestions';

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
    return generateTechnicalQuestions(jobRole);
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
            content: `Act as a Technical Interviewer for data roles. Your goal is to gauge the candidate's fit for a ${jobRole} role by asking technical (50%), coding (40%), and behavioral/situational (10%) questions. For coding questions, focus heavily on SQL and Python practical problems.

Steps to Follow:
1. Analyze the Resume: Identify key technical skills, experience, and gaps from the resume.

2. Create Questions:
   - Technical (50%): Questions about tools/skills relevant to ${jobRole} (databases, analytics tools, etc.)
   - Coding (40%): SQL and Python coding questions that require demonstrating problem-solving skills. Include specific data manipulation, analysis, or algorithm challenges.
   - Behavioral (10%): Brief questions about teamwork or problem-solving approach.
   
3. Make at least 3 questions specifically about SQL queries and 2 about Python data manipulation/analysis.`
          },
          {
            role: "user",
            content: `Generate ${count} challenging interview questions for a ${jobRole} position based on this resume:\n\n${resume}\n\nCreate a mix of questions including: 50% technical questions specific to ${jobRole}, 40% coding questions that require demonstrating SQL and Python skills (make these practical and challenging), and 10% behavioral questions. Format your response as a JSON array of strings, with each string being a question. Include detailed SQL and Python scenario-based questions that would require writing code.`
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
          description: "Using generated technical questions for this interview session.",
          variant: "default",
        });
        return generateTechnicalQuestions(jobRole);
      }
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

    // Ensure we have at least a few technical coding questions
    if (!questions.some(q => q.toLowerCase().includes('sql') || q.toLowerCase().includes('query'))) {
      const sqlQuestion = technicalQuestions.sql[Math.floor(Math.random() * technicalQuestions.sql.length)];
      questions.splice(Math.floor(questions.length / 2), 0, sqlQuestion);
    }
    
    if (!questions.some(q => q.toLowerCase().includes('python'))) {
      const pythonQuestion = technicalQuestions.python[Math.floor(Math.random() * technicalQuestions.python.length)];
      questions.splice(Math.floor(questions.length / 2) + 1, 0, pythonQuestion);
    }

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast({
      title: "Using Generated Technical Questions",
      description: "We're generating technical questions for your interview practice.",
      variant: "default",
    });
    
    return generateTechnicalQuestions(jobRole);
  }
};
