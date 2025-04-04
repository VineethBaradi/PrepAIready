
/**
 * Hook for managing interview data in session storage
 */
import { useCallback } from 'react';
import { cleanQuestionText } from '@/utils/questionUtils';

export const useInterviewSession = () => {
  // Save interview data to session storage
  const saveInterviewData = useCallback((cleanedQuestions: string[], answers: string[], evaluations: Array<{score: number; feedback: string}>) => {
    sessionStorage.setItem('interviewQuestions', JSON.stringify(cleanedQuestions));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(answers));
    sessionStorage.setItem('interviewEvaluations', JSON.stringify(evaluations));
  }, []);

  // Load interview data from session storage
  const loadInterviewData = useCallback(() => {
    const questionsJSON = sessionStorage.getItem('interviewQuestions');
    const answersJSON = sessionStorage.getItem('interviewAnswers');
    const evaluationsJSON = sessionStorage.getItem('interviewEvaluations');
    
    let questions: string[] = [];
    let answers: string[] = [];
    let evaluations: Array<{score: number; feedback: string}> = [];
    
    if (questionsJSON) {
      questions = JSON.parse(questionsJSON);
    }
    
    if (answersJSON) {
      answers = JSON.parse(answersJSON);
    }
    
    if (evaluationsJSON) {
      const parsedEvaluations = JSON.parse(evaluationsJSON);
      // Filter out any null evaluations
      evaluations = parsedEvaluations.filter((item: any) => 
        item && typeof item === 'object' && item.score !== undefined
      );
    }
    
    return { questions, answers, evaluations };
  }, []);

  return {
    saveInterviewData,
    loadInterviewData
  };
};
