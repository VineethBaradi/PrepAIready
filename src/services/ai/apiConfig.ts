// API configuration and key management

// DeepSeek API base URL
const API_URL = "https://api.deepseek.com/v1/chat/completions";

// Fixed API key for data domain interviews
const DEEPSEEK_API_KEY = "sk-4277bf92d5de4cb3b7ccc16e10053d67";

// We'll keep the user API key functionality for backward compatibility
let userProvidedApiKey: string | null = null;

export const setApiKey = (apiKey: string) => {
  userProvidedApiKey = apiKey;
  localStorage.setItem('deepseek_api_key', apiKey);
};

export const getApiKey = (): string => {
  // First prioritize the fixed API key for the data domain
  if (DEEPSEEK_API_KEY) return DEEPSEEK_API_KEY;
  
  // Fall back to user provided key if needed
  if (!userProvidedApiKey) {
    userProvidedApiKey = localStorage.getItem('deepseek_api_key');
  }
  return userProvidedApiKey || "";
};

// Data domain roles for validation
export const dataRoles = [
  "Data Analyst",
  "Data Engineer", 
  "Data Scientist",
  "ML Engineer",
  "AI Engineer",
  "Business Intelligence Analyst",
  "Database Administrator",
  "Big Data Engineer",
  "Analytics Engineer",
  "Data Architect"
];

export { API_URL };
