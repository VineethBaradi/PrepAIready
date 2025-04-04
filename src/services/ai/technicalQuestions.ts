
// Repository of technical questions by category

// Technical coding questions for SQL and Python
export const technicalQuestions = {
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

// Helper function to generate technical questions based on role
export function generateTechnicalQuestions(jobRole: string): string[] {
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
