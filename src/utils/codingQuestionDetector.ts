
/**
 * Utility to detect if a question requires code input
 */

// Detect if a question requires code input based on its content
export const isCodingQuestion = (question: string): boolean => {
  if (!question) return false;
  
  const lowerQuestion = question.toLowerCase();
  
  // Common phrases that indicate a coding question
  const codingPhrases = [
    'write a sql',
    'sql query',
    'write an sql',
    'write a function',
    'implement a function',
    'coding',
    'write code',
    'python function',
    'create a function',
    'algorithm',
    'programming',
    'implement the following',
    'write a program',
    'using python',
    'create a class',
    'create a method',
    'write pseudocode',
    'implement an algorithm'
  ];
  
  // Check for markers that strongly indicate coding questions
  if ((lowerQuestion.includes('sql') && 
      (lowerQuestion.includes('query') || lowerQuestion.includes('write'))) || 
      (lowerQuestion.includes('python') && 
      (lowerQuestion.includes('write') || lowerQuestion.includes('implement') || 
       lowerQuestion.includes('create') || lowerQuestion.includes('code')))) {
    console.log("Detected coding question (SQL/Python):", question);
    return true;
  }
  
  // Check for any coding phrases
  for (const phrase of codingPhrases) {
    if (lowerQuestion.includes(phrase)) {
      console.log("Detected coding question (phrase):", question);
      return true;
    }
  }
  
  return false;
};
