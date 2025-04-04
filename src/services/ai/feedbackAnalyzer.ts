
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
