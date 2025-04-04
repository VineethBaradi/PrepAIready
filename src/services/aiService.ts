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

// Technical coding questions for SQL and Python
const technicalQuestions = {
  "sql": [
    "Write a SQL query to find the top 5 customers who have placed the most orders in the past 6 months.",
    "Given a table 'employees' with columns (id, name, salary, department_id) and a table 'departments' with columns (id, name), write a SQL query to find the highest paid employee in each department.",
    "Write a SQL query to find duplicates in a table 'customer_data' based on email and phone fields.",
    "Write a SQL query to calculate a running total of sales for each day in the current month.",
    "Given a table of user logins with columns (user_id, login_date), write a SQL query to find users who logged in for 5 or more consecutive days.",
    "Write a SQL query that will pivot data from a 'sales' table showing product sales by quarter.",
    "Given a table 'transactions' with columns (transaction_id, user_id, transaction_date, amount), write a SQL query to calculate the month-over-month percentage change in total transaction amount."
  ],
  "python": [
    "Write a Python function to clean a dataset by handling missing values, removing duplicates, and converting date strings to datetime objects.",
    "Implement a function in Python to detect outliers in a dataset using the IQR method.",
    "Write a Python function to extract data from a JSON API response and convert it into a pandas DataFrame.",
    "Create a Python function that takes in two dataframes and performs a fuzzy match on specified columns.",
    "Write a Python function to perform feature scaling on a dataset using standardization and normalization.",
    "Implement a Python function that creates a time series forecasting model for sales data.",
    "Write a Python script to parse and extract structured data from PDF files using libraries like PyPDF2 or pdfplumber."
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
    return generateTechnicalQuestions(jobRole);
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
            content: `Act as a Technical Interviewer for data roles. Your goal is to gauge the candidate's fit for a ${jobRole} role by asking technical (50%), coding (40%), and behavioral/situational (10%) questions. For coding questions, focus heavily on SQL and Python practical problems.

Steps to Follow:
1. Analyze the Resume: Identify key technical skills, experience, and gaps from the resume.

2. Create Questions:
   - Technical (50%): Questions about tools/skills relevant to ${jobRole} (databases, analytics tools, etc.)
   - Coding (40%): SQL and Python coding questions that require demonstrating problem-solving skills. Include specific data manipulation, analysis, or algorithm challenges.
   - Behavioral (10%): Brief questions about teamwork or problem-solving approach.
   
3. Make at least 3 questions specifically about SQL queries and 2 about Python data manipulation/analysis.`
          },
          {
            role: "user",
            content: `Generate ${count} challenging interview questions for a ${jobRole} position based on this resume:\n\n${resume}\n\nCreate a mix of questions including: 50% technical questions specific to ${jobRole}, 40% coding questions that require demonstrating SQL and Python skills (make these practical and challenging), and 10% behavioral questions. Format your response as a JSON array of strings, with each string being a question. Include detailed SQL and Python scenario-based questions that would require writing code.`
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
          description: "Using generated technical questions for this interview session.",
          variant: "default",
        });
        return generateTechnicalQuestions(jobRole);
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

    // Ensure we have at least a few technical coding questions
    if (!questions.some(q => q.toLowerCase().includes('sql') || q.toLowerCase().includes('query'))) {
      const sqlQuestion = technicalQuestions.sql[Math.floor(Math.random() * technicalQuestions.sql.length)];
      questions.splice(Math.floor(questions.length / 2), 0, sqlQuestion);
    }
    
    if (!questions.some(q => q.toLowerCase().includes('python'))) {
      const pythonQuestion = technicalQuestions.python[Math.floor(Math.random() * technicalQuestions.python.length)];
      questions.splice(Math.floor(questions.length / 2) + 1, 0, pythonQuestion);
    }

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    toast({
      title: "Using Generated Technical Questions",
      description: "We're generating technical questions for your interview practice.",
      variant: "default",
    });
    
    return generateTechnicalQuestions(jobRole);
  }
};

// Helper function to generate technical questions based on role
function generateTechnicalQuestions(jobRole: string): string[] {
  // Base questions for all roles
  const baseQuestions = [
    "Tell me about your experience with data analysis and how you've applied it in your previous roles.",
    "How do you approach cleaning and preparing data for analysis?",
    "Describe a challenging data project you've worked on and how you overcame obstacles."
  ];
  
  // Role-specific technical questions
  const roleSpecificQuestions: Record<string, string[]> = {
    "Data Analyst": [
      "How do you determine which type of visualization is most appropriate for different types of data?",
      "Explain how you would identify and handle outliers in a dataset.",
      "What statistical methods do you commonly use to validate findings in your analyses?"
    ],
    "Data Engineer": [
      "Describe your experience with designing and optimizing data pipelines.",
      "How do you ensure data quality and consistency in ETL processes?",
      "What strategies do you use for database optimization and performance tuning?"
    ],
    "Data Scientist": [
      "How do you approach feature selection and engineering in machine learning projects?",
      "Explain your process for validating and testing machine learning models.",
      "How do you handle imbalanced datasets in classification problems?"
    ],
    "ML Engineer": [
      "Describe your experience deploying machine learning models to production environments.",
      "How do you monitor and update models that are already in production?",
      "What techniques do you use to optimize model inference performance?"
    ]
  };
  
  // Get role-specific questions or use general questions if role not found
  const specificQuestions = Object.keys(roleSpecificQuestions).find(
    key => jobRole.toLowerCase().includes(key.toLowerCase())
  ) 
    ? roleSpecificQuestions[Object.keys(roleSpecificQuestions).find(
        key => jobRole.toLowerCase().includes(key.toLowerCase())
      ) as keyof typeof roleSpecificQuestions] 
    : [
        "What data tools and technologies are you most experienced with?",
        "How do you keep up with emerging trends in data technology?",
        "Describe your approach to documenting your work and communicating results to stakeholders."
      ];
  
  // Always include SQL and Python coding questions
  const sqlQuestions = [
    "Write a SQL query to find the top 5 customers who have placed the most orders in the past 6 months.",
    "Given tables 'employees' and 'departments', write a SQL query to find the average salary by department, showing only departments with an average salary above $50,000.",
    "Write a SQL query to identify customers who haven't made a purchase in the last 3 months but were active in the 3 months before that."
  ];
  
  const pythonQuestions = [
    "Write a Python function that takes a pandas DataFrame and identifies columns with more than 20% missing values, then handles them appropriately based on data type.",
    "Create a Python function to perform time series analysis on sales data, identifying trends and seasonal patterns.",
    "Write a Python script that connects to an API, retrieves JSON data, and transforms it into a structured pandas DataFrame for analysis."
  ];
  
  // Combine questions
  const allQuestions = [
    ...baseQuestions,
    ...specificQuestions,
    ...sqlQuestions.slice(0, 2),
    ...pythonQuestions.slice(0, 2)
  ];
  
  // Shuffle questions
  return allQuestions.sort(() => Math.random() - 0.5);
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
