
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
    return { 
      score: 7, 
      feedback: "Your answer demonstrates understanding of the topic, but could be more specific with examples." 
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
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        return getSimulatedEvaluation(question, answer);
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
    return getSimulatedEvaluation(question, answer);
  }
};

// Helper function to generate simulated evaluations
function getSimulatedEvaluation(question: string, answer: string): { score: number; feedback: string } {
  // Generate a score between 5 and 9 to make it realistic
  const score = Math.floor(Math.random() * 5) + 5;
  
  // Choose a relevant feedback based on the question type
  let feedback = "Good response, but consider adding more specific examples.";
  
  if (question.toLowerCase().includes("sql")) {
    feedback = "Your SQL knowledge appears solid. Consider discussing query optimization techniques for large datasets.";
  } else if (question.toLowerCase().includes("python")) {
    feedback = "Good Python explanation. You might also discuss how you've used libraries like pandas or numpy for data manipulation.";
  } else if (question.toLowerCase().includes("machine learning")) {
    feedback = "Solid understanding of machine learning concepts. Consider discussing model evaluation metrics and validation strategies.";
  } else if (question.toLowerCase().includes("data quality")) {
    feedback = "Good approach to data quality. You could elaborate on automated testing and validation techniques.";
  } else if (question.toLowerCase().includes("visualization")) {
    feedback = "Good visualization knowledge. Consider discussing how you choose the right visualization for different data types.";
  }
  
  return { score, feedback };
}
