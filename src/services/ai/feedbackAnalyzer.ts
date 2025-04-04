
import { toast } from "@/components/ui/use-toast";
import { API_URL, getApiKey } from './apiConfig';

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
            content: `You are an expert data interviewer and analyst specializing in roles like Data Scientists, Data Engineers, and ML Engineers. Your task is to provide constructive feedback on technical interviews for data professionals.
            
Format your feedback in clear sections with headings and bullet points where appropriate. Be specific with strengths and areas for improvement. The feedback should be balanced, professional, and tailored to the candidate's actual responses.`
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

Format the response as constructive professional feedback that would help the candidate improve their data skills and interview performance. Use specific examples from their answers when possible. The feedback should reflect their actual performance, not generic advice.`
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
function getSimulatedFeedback(questions: string[], answers: string[]): string {
  // Calculate score based on answer content and length
  let totalScore = 0;
  let technicalScore = 0;
  let communicationScore = 0;
  let problemSolvingScore = 0;
  
  // Check for key indicators of good answers
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i]?.toLowerCase() || "";
    const question = questions[i]?.toLowerCase() || "";
    
    // Skip empty answers
    if (!answer) continue;
    
    // Base score for answering
    let answerScore = 60;
    
    // Length and detail
    if (answer.length > 100) answerScore += 5;
    if (answer.length > 200) answerScore += 10;
    
    // Technical terms
    const technicalTerms = [
      "sql", "python", "spark", "hadoop", "aws", "azure", 
      "algorithm", "model", "pipeline", "database", "schema", 
      "query", "optimization", "analysis", "visualization", 
      "join", "index", "cluster", "partition", "regression",
      "classification", "etl", "data lake", "data warehouse"
    ];
    
    let termCount = 0;
    technicalTerms.forEach(term => {
      if (answer.includes(term)) termCount++;
    });
    
    answerScore += Math.min(termCount * 3, 15);
    
    // Structure and coherence
    if (answer.includes("first") && (answer.includes("then") || answer.includes("second") || answer.includes("next") || answer.includes("finally"))) {
      answerScore += 5;
    }
    
    // Examples
    if (answer.includes("example") || answer.includes("instance") || answer.includes("case")) {
      answerScore += 5;
    }
    
    // SQL specifics
    if (question.includes("sql") && answer.includes("select") && answer.includes("from")) {
      answerScore += 10;
    }
    
    // Python specifics
    if (question.includes("python") && (answer.includes("def") || answer.includes("import") || answer.includes("for") || answer.includes("if"))) {
      answerScore += 10;
    }
    
    // Problem-solving approach
    if ((answer.includes("approach") || answer.includes("solution") || answer.includes("solve")) && 
        (answer.includes("step") || answer.includes("process"))) {
      problemSolvingScore += 10;
    }
    
    // Cap the score
    answerScore = Math.min(answerScore, 95);
    totalScore += answerScore;
    
    // Add to category scores
    if (question.includes("sql") || question.includes("python") || question.includes("technical") || 
        question.includes("data") || question.includes("algorithm") || question.includes("model")) {
      technicalScore += answerScore;
    }
    
    communicationScore += answer.length > 50 ? 70 : 50;
    communicationScore += answer.includes("explain") || answer.includes("clarify") || answer.includes("communicate") ? 10 : 0;
  }
  
  // Calculate final score
  const answeredQuestions = answers.filter(a => a && a.length > 0).length;
  const overallScore = answeredQuestions > 0 ? Math.round(totalScore / answeredQuestions) : 60;
  
  // Normalized category scores
  const normalizedTechnicalScore = answeredQuestions > 0 ? Math.round(technicalScore / answeredQuestions) : 65;
  const normalizedCommunicationScore = answeredQuestions > 0 ? Math.min(90, Math.round(communicationScore / answeredQuestions)) : 70;
  const normalizedProblemSolvingScore = answeredQuestions > 0 ? Math.min(90, 60 + (problemSolvingScore / answeredQuestions)) : 65;
  
  // Determine strengths and areas for improvement
  const strengths = [];
  const improvements = [];
  
  if (normalizedTechnicalScore > 75) strengths.push("Strong technical knowledge in data concepts and methodologies");
  else improvements.push("Deepen technical expertise in core data tools and technologies");
  
  if (normalizedCommunicationScore > 75) strengths.push("Clear and structured communication of technical concepts");
  else improvements.push("Enhance ability to explain complex data concepts in a clear, concise manner");
  
  if (normalizedProblemSolvingScore > 75) strengths.push("Effective problem-solving approach to data challenges");
  else improvements.push("Develop a more structured approach to solving data problems");
  
  if (answeredQuestions < questions.length * 0.8) {
    improvements.push("Work on addressing all aspects of technical questions thoroughly");
  }
  
  // Add some specific strengths based on keywords
  let allAnswers = answers.join(" ").toLowerCase();
  if (allAnswers.includes("sql") && allAnswers.includes("join")) {
    strengths.push("Demonstrated knowledge of SQL query capabilities");
  }
  
  if (allAnswers.includes("python") && (allAnswers.includes("pandas") || allAnswers.includes("numpy"))) {
    strengths.push("Familiar with Python data processing libraries");
  }
  
  // Create the feedback
  return `# Interview Performance Assessment

## Overall Evaluation

Based on your responses to the interview questions, you've demonstrated ${overallScore > 80 ? "strong" : overallScore > 70 ? "good" : "basic"} proficiency in skills required for a data role. Your answers reflect ${overallScore > 80 ? "in-depth knowledge" : overallScore > 70 ? "solid understanding" : "foundational knowledge"} of data concepts and methodologies.

## Technical Skills Assessment

Your technical proficiency is ${normalizedTechnicalScore > 80 ? "exemplary" : normalizedTechnicalScore > 70 ? "solid" : "developing"}. The answers demonstrate ${normalizedTechnicalScore > 80 ? "comprehensive knowledge" : normalizedTechnicalScore > 70 ? "good understanding" : "basic familiarity"} with data tools and technologies. ${normalizedTechnicalScore > 75 ? "Your explanations of technical concepts were clear and well-structured." : "Further depth in technical explanations would strengthen your responses."}

## Communication of Data Concepts

Your ability to articulate complex data concepts is ${normalizedCommunicationScore > 80 ? "excellent" : normalizedCommunicationScore > 70 ? "good" : "adequate"}. ${normalizedCommunicationScore > 75 ? "You explained technical ideas in a clear, accessible manner." : "Working on more concise and structured explanations would enhance your communication."}

## Problem-Solving Approach

Your approach to problem-solving in data scenarios is ${normalizedProblemSolvingScore > 80 ? "methodical and effective" : normalizedProblemSolvingScore > 70 ? "logical" : "developing"}. ${normalizedProblemSolvingScore > 75 ? "You demonstrated systematic thinking when tackling complex questions." : "Developing a more structured methodology when approaching problems would be beneficial."}

## Strengths

${strengths.map(s => `- ${s}`).join("\n")}

## Areas for Improvement

${improvements.map(i => `- ${i}`).join("\n")}

## Recommended Next Steps

1. ${overallScore > 80 ? "Further specialize in advanced techniques within your strongest areas" : "Focus on strengthening core technical skills through hands-on projects"}
2. ${normalizedCommunicationScore > 75 ? "Develop experience presenting complex findings to non-technical stakeholders" : "Practice explaining technical concepts in simple terms"}
3. Build a portfolio demonstrating your data analysis and problem-solving capabilities
4. ${normalizedTechnicalScore > 75 ? "Explore cutting-edge tools and methodologies in the field" : "Deepen knowledge of fundamental data tools and technologies"}

## Overall score: ${overallScore}

This assessment aims to provide constructive feedback for your continued growth in the data field. The challenges you faced in this interview reflect real-world scenarios you might encounter in a professional setting.`;
}
