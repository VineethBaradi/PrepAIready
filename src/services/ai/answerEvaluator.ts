
import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

// Function to evaluate a single interview answer
export const evaluateAnswer = async (
  question: string,
  answer: string,
  jobRole: string
): Promise<{ score: number; feedback: string }> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return generateDefaultFeedback(question, answer);
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
            content: `You are an expert interviewer and evaluator for ${jobRole} positions. You're evaluating a candidate's interview answer. Provide a concise, constructive evaluation.`
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
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        return generateDefaultFeedback(question, answer);
      }
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
    return generateDefaultFeedback(question, answer);
  }
};

// Helper function to generate default feedback if AI fails
function generateDefaultFeedback(question: string, answer: string): { score: number; feedback: string } {
  // Default positive feedback - the real AI would provide much more nuanced feedback
  return { 
    score: 7, 
    feedback: "Your answer shows good understanding of the topic. For improvement, consider adding more specific examples from your experience." 
  };
}
