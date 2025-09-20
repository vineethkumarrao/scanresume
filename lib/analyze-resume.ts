"use server"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateText } from "./gemini-client"
import type { ResumeAnalysisResult } from "./types"
// Analysis modules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EducationAnalyzer } from "./education-analyzer"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ImprovedResumeSectionDetector } from "./improved-resume-section-detector"

// Define the base URL for Gemini API - using correct model name
// Gemini API URL - Updated to use Gemini 2.5 Flash (1.5 Flash is deprecated)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.")
}

// Define the system prompt for resume analysis - optimized for Gemini
const SYSTEM_PROMPT = `
You are an expert resume screener for technical roles with deep understanding of skills and experiences crucial for success.

## ANALYSIS APPROACH
1. FIRST: Carefully identify ALL sections in the resume (even if unconventionally labeled)
2. SECOND: Extract ALL information from each section, even if presented in non-standard formats
3. THIRD: Cross-reference information across sections (e.g., skills mentioned in experience sections)
4. FOURTH: Consider the entire resume context when analyzing each category
5. FINALLY: Provide comprehensive analysis based on all extracted information

## SECTION IDENTIFICATION GUIDELINES
- Look for standard section headers: Education, Experience, Skills, Projects, etc.
- Recognize sections by formatting patterns (bold/underlined text followed by details)
- Identify sections by content patterns even when headers are missing
- Pay attention to chronological listings which often indicate experience or education
- Look for degree names, institution names, and graduation dates as indicators of education
- Identify technical skills by looking for lists of technologies, programming languages, tools, etc.

## CATEGORY-SPECIFIC INSTRUCTIONS

### TECHNICAL SKILLS
- Identify ALL technical skills mentioned throughout the ENTIRE resume, not just in a dedicated skills section
- Look for programming languages, frameworks, tools, methodologies, platforms
- Consider skills implied by project descriptions or job responsibilities
- Recognize both hard technical skills and domain knowledge
- Examples: "Python", "React", "AWS", "Agile methodology", "Data analysis"

### EXPERIENCE
- Extract ALL work experiences, including internships, part-time roles, freelance work
- Identify job titles, companies, dates, and responsibilities
- Look for achievements, metrics, and impact statements
- Recognize industry-specific terminology that indicates specialized experience
- Examples: "Increased conversion rate by 25%", "Led team of 5 developers", "Implemented CI/CD pipeline"

### EDUCATION
- Identify ALL educational qualifications including degrees, certifications, bootcamps, courses
- Look for institution names, degree types, majors/minors, graduation dates
- Recognize educational achievements like honors, GPA, relevant coursework
- Consider continuing education and professional development
- Examples: "Bachelor of Science in Computer Science", "AWS Certified Solutions Architect", "Udacity Nanodegree"
- BE NUANCED in your assessment of education relevance. Many technical fields don't require specific degrees.
- For example, in cyber security, degrees in computer science, information technology, or even other technical fields can be relevant.
- Don't penalize candidates just because they don't have a degree specifically named after the job field.
- Consider how the skills and knowledge gained from their education apply to the job requirements.
- If a candidate has a technical degree (e.g., Computer Science) applying for a specialized role (e.g., Cyber Security Analyst), 
  recognize that the technical foundation is relevant even if not specialized in the exact field.
- Look for ANY education information throughout the ENTIRE resume, not just in a dedicated education section.

### FORMATTING
- Assess overall structure, readability, and organization
- Evaluate use of bullet points, sections, white space
- Check for consistent formatting of dates, job titles, etc.
- Look for ATS-friendly elements like standard section headers
- Examples: Consistent bullet formatting, clear section headers, appropriate length

### SOFT SKILLS
- Identify soft skills explicitly mentioned AND implied by achievements
- Look for leadership, communication, teamwork, problem-solving indicators
- Recognize soft skills in action statements and accomplishment descriptions
- Consider language that demonstrates adaptability, initiative, etc.
- Examples: "Collaborated with cross-functional teams", "Presented to executive stakeholders", "Mentored junior developers"

Analyze the provided resume against the job description and provide a detailed analysis in JSON format with the following structure:

{
  "overallScore": number, // 0-100 score representing overall match
  "technicalSkills": {
    "score": number, // 0-25 score for technical skills match
    "maxScore": 25,
    "criteria": [
      {
        "name": string, // Name of the criterion
        "status": "Yes" | "No" | "Partial", // Whether the resume meets this criterion
        "comments": string // Detailed explanation
      }
    ],
    "summary": string // Summary of technical skills analysis
  },
  "experience": {
    "score": number, // 0-25 score for experience match
    "maxScore": 25,
    "criteria": [
      {
        "name": string,
        "status": "Yes" | "No" | "Partial",
        "comments": string
      }
    ],
    "summary": string // Summary of experience analysis
  },
  "education": {
    "score": number, // 0-15 score for education match
    "maxScore": 15,
    "criteria": [
      {
        "name": string,
        "status": "Yes" | "No" | "Partial",
        "comments": string
      }
    ],
    "summary": string // Summary of education analysis
  },
  "formatting": {
    "score": number, // 0-15 score for resume formatting and ATS compatibility
    "maxScore": 15,
    "criteria": [
      {
        "name": string,
        "status": "Yes" | "No" | "Partial",
        "comments": string
      }
    ],
    "summary": string // Summary of formatting analysis
  },
  "softSkills": {
    "score": number, // 0-20 score for soft skills match
    "maxScore": 20,
    "criteria": [
      {
        "name": string,
        "status": "Yes" | "No" | "Partial",
        "comments": string
      }
    ],
    "summary": string // Summary of soft skills analysis
  },
  "improvementSuggestions": string[] // Array of specific suggestions to improve the resume
}

IMPORTANT GUIDELINES:
1. Your response must be valid JSON only, with no additional text before or after
2. Be thorough and specific in your analysis
3. Provide actionable feedback that will help the candidate improve their resume
4. If information seems missing, look more carefully throughout the entire resume before concluding it's absent
5. Consider non-traditional formats and implied information
6. When in doubt about a section's existence, err on the side of finding information rather than marking it as missing
7. Cross-reference information across different sections to build a complete picture
`

// Safe text extraction from PDF using data URL
// This function is unused and can be removed in future cleanup
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function safeExtractTextFromPDF(_file: File): Promise<string> {
  // Function implementation commented out to resolve lint errors
  // This function was causing import and type errors
  return ""
}

// Helper function to extract JSON from text that might contain non-JSON content
function extractJsonFromText(text: string): ResumeAnalysisResult | null {
  try {
    // First try direct parsing
    const parsed = JSON.parse(text);
    return parsed as ResumeAnalysisResult;
  } catch {
    console.log("Direct JSON parsing failed, attempting extraction...");
    
    // If that fails, try to find the largest complete JSON object
    try {
      // Find all potential JSON objects (including nested ones)
      const matches: string[] = [];
      let braceCount = 0;
      let startIndex = -1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
          if (braceCount === 0) {
            startIndex = i;
          }
          braceCount++;
        } else if (text[i] === '}') {
          braceCount--;
          if (braceCount === 0 && startIndex !== -1) {
            matches.push(text.substring(startIndex, i + 1));
          }
        }
      }
      
      // Try to parse each match, preferring the largest valid one
      let bestMatch: ResumeAnalysisResult | null = null;
      for (const match of matches) {
        try {
          const parsed = JSON.parse(match);
          if (validateAnalysisResult(parsed)) {
            bestMatch = parsed;
            break; // Use the first valid match
          }
        } catch {
          continue;
        }
      }
      
      return bestMatch;
    } catch {
      console.error("Failed to extract JSON from text");
      return null;
    }
  }
}

// Helper function to validate the analysis result structure
function validateAnalysisResult(result: unknown): result is ResumeAnalysisResult {
  if (!result || typeof result !== 'object') return false;
  
  const r = result as Record<string, unknown>;
  return (
    typeof r.overallScore === "number" &&
    !!r.technicalSkills &&
    typeof r.technicalSkills === 'object' &&
    !!r.experience &&
    typeof r.experience === 'object' &&
    !!r.education &&
    typeof r.education === 'object' &&
    !!r.formatting &&
    typeof r.formatting === 'object' &&
    !!r.softSkills &&
    typeof r.softSkills === 'object' &&
    Array.isArray(r.improvementSuggestions)
  );
}

// Inside the analyzeResume function, update the education analysis part:

// Find the section where education is analyzed in the SYSTEM_PROMPT or in the code logic
// and replace it with this improved approach:

// Example of how to integrate this into your existing code:
// This would go inside your analyzeResume function

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function analyzeEducation(_resumeText: string, _jobDescription: string, _jobTitle: string) {
  // Function body commented out to resolve lint errors since it's unused
  return null
  /*
  // Extract education information
  const educationInfo = await EducationAnalyzer.extractEducation(_resumeText)

  // Check if we found any education information
  const hasEducation =
    educationInfo.degrees.length > 0 ||
    educationInfo.certifications.length > 0 ||
    educationInfo.continuingEducation.length > 0 ||
    educationInfo.hasEducationSection

  // If no education was found, double-check with the improved section detector
  if (!hasEducation) {
    const educationSection = await ImprovedResumeSectionDetector.detectEducationSection(resumeText)
    if (educationSection.found) {
      // If we found education information this way, update our educationInfo
      const additionalEducation = await EducationAnalyzer.extractEducation(educationSection.content)
      Object.assign(educationInfo, additionalEducation)
    }
  }

  // Assess relevance to the job
  const relevanceAssessment = await EducationAnalyzer.assessEducationRelevance(educationInfo.degrees, jobTitle, jobDescription)

  // Get common degree requirements for this job field
  const degreeRequirements = await EducationAnalyzer.getCommonDegreeRequirements(jobTitle)

  // Return the complete education analysis
  return {
    educationInfo,
    relevanceAssessment,
    degreeRequirements,
    hasEducation,
  }
  */
}

// You would then use this function in your main analysis logic
// and incorporate the results into your final analysis output

export async function analyzeResume(jobDescription: string, resumeText: string): Promise<ResumeAnalysisResult> {
  try {
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Could not extract text from the resume file. Please check the file and try again.")
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error("Job description is required for analysis.")
    }

    // Use the hardcoded API key
    const apiKey = GEMINI_API_KEY
    const url = `${GEMINI_API_URL}?key=${apiKey}`

    console.log("Sending request to Gemini API...")
    console.log("API URL:", url.replace(apiKey || "", "***"))
    console.log("Job Description length:", jobDescription.length)
    console.log("Resume Text length:", resumeText.length)

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }, { text: `Job Description: ${jobDescription}\n\nResume: ${resumeText}` }],
        },
      ],
      generationConfig: {
        temperature: 0, // Lower temperature for more consistent JSON output
        maxOutputTokens: 8192, // Increased from 4000 - Gemini 2.5 Flash supports up to 32,768
        topP: 1,
        topK: 1,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster, more predictable responses
        },
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }

    console.log("Request body keys:", Object.keys(requestBody))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`
      console.log("API Error Status:", response.status)
      console.log("API Error Status Text:", response.statusText)
      
      try {
        const errorData = await response.json()
        console.log("API Error Data:", JSON.stringify(errorData, null, 2))
        errorMessage += `: ${JSON.stringify(errorData)}`

        // Check for specific Gemini API error types
        if (errorData.error) {
          if (errorData.error.code === 429) {
            errorMessage = "Rate limit exceeded. Please try again later."
          } else if (errorData.error.code === 400) {
            errorMessage = `Invalid request to Gemini API: ${errorData.error.message || "Please check your inputs."}`
          } else if (errorData.error.message) {
            errorMessage = `Gemini API error: ${errorData.error.message}`
          }
        }
      } catch {
        console.log("Could not parse error response as JSON")
        // If we can't parse the error as JSON, just use the status code
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()

    // Check for safety ratings that might have blocked generation
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Content blocked by Gemini API: ${data.promptFeedback.blockReason}`)
    }

    // Check if we have a valid response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated by Gemini API")
    }

    // Check for finish reason and handle MAX_TOKENS specifically
    const finishReason = data.candidates[0].finishReason
    if (finishReason && finishReason !== "STOP") {
      console.warn(`Generation did not complete normally: ${finishReason}`)
      
      if (finishReason === "MAX_TOKENS") {
        console.log("Response was truncated due to token limit. Attempting to extract partial results...")
        // Continue processing - we might still have usable partial JSON
      } else {
        throw new Error(`Generation failed with reason: ${finishReason}`)
      }
    }

    const content = data.candidates[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error("No content returned from the API")
    }

    try {
      // Try to extract and parse the JSON response
      const result = extractJsonFromText(content)

      // Validate the structure of the result
      if (!validateAnalysisResult(result)) {
        throw new Error("The analysis result does not have the expected structure")
      }

      return result
    } catch {
      console.error("Error parsing JSON response")
      console.error("Raw response:", content)

      // Attempt to create a fallback response if parsing fails
      if (typeof content === "string" && content.includes("technicalSkills") && content.includes("experience")) {
        console.log("Attempting to create fallback response...")

        // Create a basic fallback response
        return {
          overallScore: 50,
          technicalSkills: {
            score: 12,
            maxScore: 25,
            criteria: [{ name: "Skills Matching", status: "Partial", comments: "Could not fully analyze skills." }],
            summary: "Technical skills analysis incomplete due to processing error.",
          },
          experience: {
            score: 12,
            maxScore: 25,
            criteria: [
              { name: "Experience Relevance", status: "Partial", comments: "Could not fully analyze experience." },
            ],
            summary: "Experience analysis incomplete due to processing error.",
          },
          education: {
            score: 7,
            maxScore: 15,
            criteria: [
              { name: "Education Requirements", status: "Partial", comments: "Could not fully analyze education." },
            ],
            summary: "Education analysis incomplete due to processing error.",
          },
          formatting: {
            score: 7,
            maxScore: 15,
            criteria: [
              { name: "ATS Compatibility", status: "Partial", comments: "Could not fully analyze formatting." },
            ],
            summary: "Formatting analysis incomplete due to processing error.",
          },
          softSkills: {
            score: 10,
            maxScore: 20,
            criteria: [
              { name: "Communication Skills", status: "Partial", comments: "Could not fully analyze soft skills." },
            ],
            summary: "Soft skills analysis incomplete due to processing error.",
          },
          improvementSuggestions: [
            "Please try analyzing again with a clearer resume format.",
            "Ensure your resume text is properly formatted and readable.",
            "Consider simplifying complex formatting in your resume for better analysis.",
          ],
        } as ResumeAnalysisResult;
      }

      throw new Error("Failed to parse the analysis result. Please try again.")
    }
  } catch (error: unknown) {
    console.error("Error analyzing resume:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("An unexpected error occurred during analysis");
  }
}
