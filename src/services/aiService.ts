
// Main export file that re-exports all AI service functionality

import { getApiKey, setApiKey, dataRoles } from './ai/apiConfig';
import { generateInterviewQuestions } from './ai/questionGenerator';
import { evaluateAnswer } from './ai/answerEvaluator';
import { analyzeInterviewResponses } from './ai/feedbackAnalyzer';
import { technicalQuestions, generateTechnicalQuestions } from './ai/technicalQuestions';

export {
  getApiKey,
  setApiKey,
  dataRoles,
  generateInterviewQuestions,
  evaluateAnswer,
  analyzeInterviewResponses,
  technicalQuestions,
  generateTechnicalQuestions
};
