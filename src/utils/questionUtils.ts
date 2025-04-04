
/**
 * Utility functions for formatting and processing interview questions
 */

// Clean question text by removing JSON formatting, prefixes, etc.
export const cleanQuestionText = (question: string): string => {
  // Remove common prefixes from AI-generated responses
  let cleaned = question.replace(/^Here's a JSON array.*?:/i, '');
  cleaned = cleaned.replace(/^\/\/\s*[A-Z\s]+\s*\(\d+%\):/i, '');
  
  // Remove JSON formatting and markdown code blocks
  cleaned = cleaned.replace(/```json|```/g, '');
  
  // Remove array brackets and numbering
  cleaned = cleaned.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
  cleaned = cleaned.replace(/^\d+\.\s*/gm, '');
  
  // Remove comments like "// Technical Questions (50%)"
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  
  // Remove any remaining JSON formatting
  try {
    // If it's still valid JSON, parse it and extract just the question text
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === 'object' && parsed.question) {
      return parsed.question;
    }
  } catch (e) {
    // Not JSON, continue with cleaning
  }
  
  // Final cleanup - trim whitespace and remove quotes
  return cleaned.trim().replace(/^["']|["']$/g, '');
};

// Get waiting messages that can be displayed during processing
export const getWaitingMessages = (): string[] => [
  "Processing your response...",
  "Analyzing your answer...",
  "Recording your response...",
  "Capturing your answer...",
  "Saving your response..."
];

// Get a random waiting message
export const getRandomWaitingMessage = (): string => {
  const messages = getWaitingMessages();
  return messages[Math.floor(Math.random() * messages.length)];
};
