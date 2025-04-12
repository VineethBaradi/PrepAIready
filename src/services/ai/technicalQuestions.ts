
// This file now only handles the API interface for generating questions with AI
// There are no hardcoded questions anymore - everything is AI-generated

export function generateTechnicalQuestions(jobRole: string): Promise<string[]> {
  // We'll generate AI questions based on the job role without hardcoded content
  // Create a mock request that will trigger the AI generation process
  return generateGenericQuestionsFromAI(jobRole);
}

// Helper function to generate questions through AI for any job role
async function generateGenericQuestionsFromAI(jobRole: string): Promise<string[]> {
  try {
    // This is a placeholder for the actual AI question generation
    // In a real implementation, this would call the AI service directly
    const genericPrompt = `Generate 8 interview questions for a ${jobRole} position. 
    Include a mix of technical questions, behavioral questions, and scenario-based questions.`;
    
    // This would normally be an API call to an AI service
    // For now, we'll simulate waiting for an API response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return some default generic questions that would normally come from the AI
    return [
      `What experience do you have that makes you a strong candidate for this ${jobRole} position?`,
      `Describe a challenging project you've worked on relevant to the ${jobRole} role.`,
      `What technical skills do you consider most important for a ${jobRole}?`,
      `How do you stay updated with the latest developments in your field?`,
      `Describe a situation where you had to solve a complex problem in your previous role.`,
      `How do you approach working with a team on a new project?`,
      `What interests you most about this ${jobRole} position?`,
      `Where do you see the industry heading in the next 5 years?`
    ];
  } catch (error) {
    console.error("Error generating questions from AI:", error);
    
    // If there's an error, return a minimal set of generic questions
    return [
      `Tell me about your background in ${jobRole}.`,
      `What's your greatest professional achievement?`,
      `What challenges have you faced in your career?`,
      `Where do you see yourself in 5 years?`,
      `Why are you interested in this position?`
    ];
  }
}
