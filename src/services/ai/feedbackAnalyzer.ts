
import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

// Function to analyze interview responses
export const analyzeInterviewResponses = async (
  questions: string[],
  answers: string[],
  jobRole: string,
  resume: string
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return generateBasicFeedback(questions, answers, jobRole);
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
            content: `You are an expert interviewer and career coach specializing in ${jobRole} positions. Your task is to provide constructive feedback on technical interviews.
            
Format your feedback in clear sections with headings and bullet points where appropriate. Be specific with strengths and areas for improvement. The feedback should be balanced, professional, and tailored to the candidate's actual responses.`
          },
          {
            role: "user",
            content: `Please analyze the following interview for a ${jobRole} position. 
            
Resume: ${resume}

Questions and answers:
${questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n")}

Provide a detailed feedback analysis covering:
1. Technical proficiency in concepts, tools, and methodologies relevant to ${jobRole}
2. Understanding of principles and best practices for ${jobRole}
3. Problem-solving approach 
4. Communication skills
5. Overall fit for a ${jobRole} position
6. Specific areas for improvement with actionable steps
7. Technical skills they should develop further for this role
8. Overall score on a scale of 1-100

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
        return generateBasicFeedback(questions, answers, jobRole);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;
    
    return feedback;
  } catch (error) {
    console.error("Error analyzing interview responses:", error);
    toast({
      title: "Using Basic Feedback",
      description: "We're providing simplified feedback for your interview practice.",
      variant: "default",
    });
    
    return generateBasicFeedback(questions, answers, jobRole);
  }
};

// Helper function to generate basic feedback if AI fails
function generateBasicFeedback(questions: string[], answers: string[], jobRole: string): string {
  // Count answered questions
  const answeredCount = answers.filter(a => a && a.trim().length > 0).length;
  const completionRate = Math.round((answeredCount / questions.length) * 100);
  
  // Generate basic feedback
  return `# Interview Performance Assessment

## Overall Evaluation

You answered ${answeredCount} out of ${questions.length} questions (${completionRate}% completion rate) for the ${jobRole} position.

## Strengths

- You demonstrated initiative by participating in this interview practice
- You engaged with questions related to ${jobRole} responsibilities

## Areas for Improvement

- Continue practicing your interview responses to build confidence
- Research common technical questions for ${jobRole} positions
- Prepare specific examples from your experience to illustrate your skills

## Recommended Next Steps

1. Research more about typical interview questions for ${jobRole} positions
2. Practice explaining technical concepts clearly and concisely
3. Prepare a list of your accomplishments and how they relate to this role
4. Consider doing more mock interviews to build confidence

This assessment is meant to provide direction for your interview preparation. With more practice, you'll gain confidence in your ability to showcase your skills and qualifications for ${jobRole} positions.`;
}
