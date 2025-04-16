import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

interface InterviewData {
  questions: string[];
  answers: string[];
  resume: string;
  jobDescription: string;
}

const FEEDBACK_PROMPT = `You are an expert interviewer and career coach. Your task is to provide direct and constructive feedback on technical interviews.

Format your feedback in clear sections with headings and bullet points where appropriate. Be specific with strengths and areas for improvement. The feedback should be balanced, professional, direct, Stright Forward and tailored to the candidate's actual responses.`;

const ANALYSIS_POINTS = [
  "Technical proficiency in concepts, tools, and methodologies relevant to the job description",
  "Understanding of principles and best practices",
  "Problem-solving approach",
  "Communication skills",
  "Overall fit for the position",
  "Specific areas for improvement with actionable steps",
  "Technical skills they should develop further",
  "Overall score on a scale of 1-100"
].join('\n');

// Function to analyze interview responses
export const analyzeInterviewResponses = async ({
  questions,
  answers,
  resume,
  jobDescription
}: InterviewData): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return generateBasicFeedback({ questions, answers, jobDescription });
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
            content: FEEDBACK_PROMPT
          },
          {
            role: "user",
            content: `Please analyze the following interview.

Resume: ${resume}

Job Description: ${jobDescription}

Questions and answers:
${questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n")}

Provide a detailed feedback analysis covering:
${ANALYSIS_POINTS}

Format the response as constructive professional feedback that would help the candidate improve their skills and interview performance. Use specific examples from their answers when possible.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        return generateBasicFeedback({ questions, answers, jobDescription });
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing interview responses:", error);
    toast({
      title: "Using Basic Feedback",
      description: "We're providing simplified feedback for your interview practice.",
      variant: "default",
    });
    
    return generateBasicFeedback({ questions, answers, jobDescription });
  }
};

interface BasicFeedbackData {
  questions: string[];
  answers: string[];
  jobDescription: string;
}

// Helper function to generate basic feedback if AI fails
function generateBasicFeedback({ questions, answers, jobDescription }: BasicFeedbackData): string {
  const answeredCount = answers.filter(a => a?.trim().length > 0).length;
  const completionRate = Math.round((answeredCount / questions.length) * 100);
  
  return `# Interview Performance Assessment

## Overall Evaluation

You answered ${answeredCount} out of ${questions.length} questions (${completionRate}% completion rate) for the following job description:

${jobDescription}

## Strengths
- You demonstrated initiative by participating in this interview practice
- You engaged with questions related to the job description

## Areas for Improvement
- Continue practicing your interview responses to build confidence
- Research common technical questions for this type of position
- Prepare specific examples from your experience to illustrate your skills

## Recommended Next Steps
1. Research more about typical interview questions for this type of position
2. Practice explaining technical concepts clearly and concisely
3. Prepare a list of your accomplishments and how they relate to this role
4. Consider doing more mock interviews to build confidence

This assessment is meant to provide direction for your interview preparation. With more practice, you'll gain confidence in your ability to showcase your skills and qualifications for this type of position.`;
}
