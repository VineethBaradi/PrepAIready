
/**
 * Helper function to detect if a question requires code input
 */
export function isCodingQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  return (
    (lowerQuestion.includes('sql') && (lowerQuestion.includes('query') || lowerQuestion.includes('write'))) ||
    (lowerQuestion.includes('python') && (lowerQuestion.includes('write') || lowerQuestion.includes('implement') || lowerQuestion.includes('create'))) ||
    lowerQuestion.includes('coding') ||
    (lowerQuestion.includes('code') && lowerQuestion.includes('write')) ||
    lowerQuestion.includes('implement a function') ||
    lowerQuestion.includes('write a function') ||
    lowerQuestion.includes('algorithm')
  );
}
