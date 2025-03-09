import { toast } from "@/components/ui/use-toast";

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

// Fallback questions for different data roles
const fallbackQuestions = {
  "Data Analyst": [
    "Can you explain your experience with SQL and data manipulation?",
    "What data visualization tools have you worked with and how do you choose the right visualization for different scenarios?", 
    "Describe a difficult data cleaning challenge you've faced and how you approached it.",
    "How do you ensure data quality in your analyses?",
    "Explain your process for developing dashboards and reporting solutions.",
    "How do you communicate data insights to non-technical stakeholders?",
    "Describe your experience with statistical analysis and hypothesis testing.",
    "How do you approach a new data analysis project from start to finish?"
  ],
  "Data Engineer": [
    "Describe your experience designing and implementing data pipelines.",
    "What ETL tools have you worked with and what were their pros and cons?",
    "How do you approach data modeling in a data warehouse environment?",
    "Explain how you've implemented data quality checks in your pipelines.",
    "What's your experience with stream processing versus batch processing?",
    "How do you handle schema evolution in a production environment?",
    "Describe your experience with distributed computing frameworks.",
    "How do you optimize database performance for analytical workloads?"
  ],
  "Data Scientist": [
    "Explain your approach to feature engineering and selection.",
    "Describe a machine learning project you've worked on from problem definition to deployment.",
    "How do you validate machine learning models and prevent overfitting?",
    "What techniques do you use to handle imbalanced datasets?",
    "How do you approach time series forecasting problems?",
    "Describe your experience with natural language processing.",
    "How do you communicate model results to business stakeholders?",
    "What's your approach to productionizing machine learning models?"
  ],
  "ML Engineer": [
    "Describe your experience deploying machine learning models to production.",
    "How do you handle model versioning and experiment tracking?",
    "What techniques have you used for model monitoring and maintenance?",
    "Explain how you've optimized model inference performance.",
    "What's your approach to building scalable ML infrastructure?",
    "How do you handle data drift and concept drift in production models?",
    "Describe a time when you had to debug a complex ML system issue.",
    "What frameworks and tools do you use for ML development and deployment?"
  ],
  "default": [
    "Can you explain your experience with data manipulation and analysis?",
    "Describe a challenging data project you worked on and how you approached it.",
    "How do you handle missing or inconsistent data in your analyses?",
    "Explain a technical solution you've implemented and how you evaluated its performance.",
    "How do you communicate complex technical concepts to non-technical stakeholders?",
    "Describe your experience with data visualization tools and techniques.",
    "How do you approach data quality assurance in your projects?",
    "What data processing frameworks or tools have you worked with?"
  ]
};

interface GenerateQuestionsOptions {
  resume: string;
  jobRole: string;
  count?: number;
}

export const generateInterviewQuestions = async (
  options: GenerateQuestionsOptions
): Promise<string[]> => {
  const { resume, jobRole, count = 8 } = options;
  const apiKey = getApiKey();

  if (!apiKey) {
    toast({
      title: "API Key Error",
      description: "There was an issue with the API key. Please try again later.",
      variant: "destructive",
    });
    return getFallbackQuestions(jobRole);
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
            content: `Act as a Technical Interviewer for data roles. Your goal is to gauge the candidate's fit for a ${jobRole} role by asking technical (70%), coding (20%), and behavioral/situational (10%) questions. You'll provide blunt, concise feedback at the end.

Steps to Follow:
1. Analyze the Resume and Job Description:
   - Identify key technical skills (e.g., SQL, Python, ETL tools), experience, and gaps.
   - Note the job requirements relevant to ${jobRole} (e.g., cloud platforms, data pipelines, visualization tools).

2. Create Questions:
   - Technical (70%): Ask about tools/skills listed in the resume and job description.
   - Coding (20%): Ask coding-related questions to test hands-on skills in Python, SQL, or other relevant languages/tools.
   - Others (10%): Ask behavioral, teamwork, problem-solving, and motivation questions.`
          },
          {
            role: "user",
            content: `Generate ${count} interview questions for a ${jobRole} position based on this resume:\n\n${resume}\n\nCreate a mix of questions following this distribution: 70% technical questions specific to ${jobRole} (including SQL, Python, statistics, data modeling, machine learning concepts as relevant), 20% coding questions that require demonstrating code writing skills, and 10% behavioral questions. Format your response as a JSON array of strings, with each string being a question.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        toast({
          title: "API Limit Reached",
          description: "Using backup questions for this interview session.",
          variant: "default",
        });
        return getFallbackQuestions(jobRole);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response to extract questions
    let questions: string[] = [];
    try {
      const content = data.choices[0].message.content;
      // Try to parse as JSON if the model returned a JSON string
      questions = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract questions by line
      const content = data.choices[0].message.content;
      questions = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);
    }

    if (questions.length === 0) {
      throw new Error("Failed to parse questions from API response");
    }

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast({
      title: "Using Backup Questions",
      description: "We're using pre-defined questions for your interview practice.",
      variant: "default",
    });
    
    return getFallbackQuestions(jobRole);
  }
};

// Helper function to get role-specific fallback questions
function getFallbackQuestions(jobRole: string): string[] {
  // Find the matching role or use default questions
  const roleKey = Object.keys(fallbackQuestions).find(
    key => jobRole.toLowerCase().includes(key.toLowerCase())
  ) || "default";
  
  // @ts-ignore - we know this is safe
  return fallbackQuestions[roleKey as keyof typeof fallbackQuestions];
}

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

// Function to analyze interview responses
export const analyzeInterviewResponses = async (
  questions: string[],
  answers: string[],
  jobRole: string,
  resume: string
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return getSimulatedFeedback(questions, answers, jobRole);
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
            content: `You are an expert data interviewer and analyst specializing in roles like Data Scientists, Data Engineers, and ML Engineers. Your task is to provide constructive feedback on technical interviews for data professionals.`
          },
          {
            role: "user",
            content: `Please analyze the following interview for a ${jobRole} position. 
            
Resume: ${resume}

Questions and answers:
${questions.map((q, i) => `Question: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n")}

Provide a detailed feedback analysis covering:
1. Technical proficiency in data concepts, tools, and methodologies
2. Understanding of data analysis, modeling, or engineering principles
3. Problem-solving approach for data challenges
4. Communication of complex data concepts
5. Overall fit for a ${jobRole} position
6. Specific areas for improvement with actionable steps
7. Technical skills they should develop further for this role
8. Overall score on a scale of 1-100

Format the response as constructive professional feedback that would help the candidate improve their data skills and interview performance.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        console.error("API quota exceeded or payment required");
        return getSimulatedFeedback(questions, answers, jobRole);
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;
    
    return feedback;
  } catch (error) {
    console.error("Error analyzing interview responses:", error);
    toast({
      title: "Using Simulated Feedback",
      description: "We're providing simulated feedback for your interview practice.",
      variant: "default",
    });
    
    return getSimulatedFeedback(questions, answers, jobRole);
  }
};

// Helper function to generate simulated feedback
function getSimulatedFeedback(questions: string[], answers: string[], jobRole: string): string {
  // Calculate a realistic score
  const score = Math.floor(Math.random() * 20) + 70; // Between 70-90
  
  // Count how many answers mention important skills
  const mentionSQL = answers.filter(a => a.toLowerCase().includes("sql")).length;
  const mentionPython = answers.filter(a => a.toLowerCase().includes("python")).length;
  const mentionAnalysis = answers.filter(a => a.toLowerCase().includes("analysis")).length;
  const mentionVisualization = answers.filter(a => a.toLowerCase().includes("visualization")).length;
  
  // Role-specific templates
  let roleSpecificFeedback = "";
  
  if (jobRole.toLowerCase().includes("analyst")) {
    roleSpecificFeedback = `
## Data Analysis Skills

Your interview responses demonstrate a solid foundation in data analysis methodology. You've shown understanding of how to approach data exploration and derive insights. To further strengthen this area, consider deepening your knowledge of statistical analysis techniques and hypothesis testing.

## SQL Proficiency

Your SQL knowledge appears to be ${mentionSQL > 1 ? "strong" : "adequate"}. ${mentionSQL > 1 ? "You demonstrated familiarity with joins, aggregations, and complex queries." : "Consider practicing more complex queries involving window functions, CTEs, and performance optimization."} For a Data Analyst role, advanced SQL is often a daily requirement.

## Visualization and Communication

${mentionVisualization > 0 ? "Your discussion of data visualization shows good awareness of its importance." : "You could have emphasized data visualization techniques more in your responses."} Effective communication of findings is crucial for a Data Analyst. Consider developing a portfolio showcasing your visualization skills using tools like Tableau, Power BI, or Python libraries.`;
  } else if (jobRole.toLowerCase().includes("engineer")) {
    roleSpecificFeedback = `
## Data Pipeline Design

Your interview responses show ${mentionSQL > 1 ? "strong" : "some"} understanding of data engineering principles. You mentioned experience with ${mentionSQL > 1 ? "SQL and database systems" : "some data technologies"}, which is good. To excel as a Data Engineer, deepen your knowledge of distributed systems, stream processing, and modern data architecture patterns.

## Technical Skills Assessment

Your technical foundation appears ${mentionPython > 1 ? "solid" : "adequate"}, particularly in ${mentionPython > 1 ? "Python and programming concepts" : "basic coding principles"}. For a Data Engineer role, consider strengthening your skills in cloud platforms (AWS/Azure/GCP), container orchestration, and infrastructure as code.

## Data Modeling and Architecture

Your responses could have more thoroughly addressed data modeling concepts and schema design. Data Engineers need strong skills in designing efficient, scalable data models that support both operational and analytical workloads.`;
  } else {
    roleSpecificFeedback = `
## Technical Data Skills

Your interview responses demonstrate a foundation in data concepts and methodologies. You've shown understanding of ${mentionSQL > 0 ? "SQL and " : ""}${mentionPython > 0 ? "Python programming and " : ""}${mentionAnalysis > 0 ? "data analysis approaches" : "technical principles"}. For a ${jobRole} role, continue developing depth in these technical areas.

## Problem-Solving Approach

Your approach to data problems appears methodical. You've described steps for tackling challenges in a structured way. To further enhance this skill, practice breaking down complex data scenarios into manageable components and identifying potential bottlenecks before implementation.

## Communication Skills

Your ability to articulate technical concepts came across ${mentionAnalysis > 2 ? "clearly" : "adequately"} in your answers. In data roles, the ability to translate technical findings into business insights is crucial. Continue practicing explanations of complex topics for non-technical audiences.`;
  }
  
  // Combine all sections
  return `# Interview Performance Assessment

## Overall Evaluation

Thank you for completing your ${jobRole} interview simulation. Based on your responses, you've demonstrated several strengths along with areas for potential growth. Your overall performance indicates someone with fundamental data skills who is developing proficiency in key areas required for this role.

${roleSpecificFeedback}

## Strengths

1. You demonstrated knowledge of fundamental data concepts
2. Your communication style was clear and structured
3. You showed problem-solving capabilities when addressing technical questions

## Areas for Improvement

1. Deepen technical expertise in specialized tools relevant to ${jobRole} roles
2. Provide more specific examples from projects or work experience
3. Strengthen answers with quantitative results and business impact
4. Develop more comprehensive responses to situational questions

## Recommended Next Steps

1. Build a portfolio project demonstrating end-to-end data skills
2. Practice more technical interview questions, especially focusing on algorithms and data structures
3. Strengthen knowledge of modern data tools and cloud technologies
4. Prepare specific examples from your experience that highlight impact

## Overall score: ${score}

This simulated interview practice gives you a foundation to build upon. Continue practicing responses to technical questions and developing your ability to communicate complex data concepts clearly and concisely.`;
}
