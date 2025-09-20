import { z } from 'zod'

// API Request Schemas
export const analyzeResumeSchema = z.object({
  resumeText: z.string()
    .min(50, 'Resume text must be at least 50 characters')
    .max(50000, 'Resume text must not exceed 50,000 characters'),
  jobDescription: z.string()
    .min(20, 'Job description must be at least 20 characters')
    .max(10000, 'Job description must not exceed 10,000 characters'),
  jobTitle: z.string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must not exceed 100 characters')
    .optional(),
})

export const sendFeedbackSchema = z.object({
  feedback: z.string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must not exceed 2,000 characters'),
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  analysisId: z.string()
    .uuid('Invalid analysis ID format')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
})

// Analysis Result Schemas
export const criteriaSchema = z.object({
  name: z.string(),
  status: z.enum(['Yes', 'No', 'Partial']),
  comments: z.string(),
})

export const analysisScoreSchema = z.object({
  score: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
  criteria: z.array(criteriaSchema),
  summary: z.string(),
})

export const analysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalSkills: analysisScoreSchema,
  experience: analysisScoreSchema,
  education: analysisScoreSchema,
  formatting: analysisScoreSchema,
  softSkills: analysisScoreSchema,
  improvementSuggestions: z.array(z.string()),
  analysisId: z.string().uuid().optional(),
  timestamp: z.date().optional(),
})

// File Upload Schemas
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, 'File name is required'),
    size: z.number()
      .min(100, 'File must be at least 100 bytes')
      .max(10 * 1024 * 1024, 'File must not exceed 10MB'),
    type: z.string().refine(
      (type) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type),
      'File must be PDF or DOCX format'
    ),
  }),
})

// User Input Schemas
export const jobDetailsSchema = z.object({
  jobTitle: z.string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must not exceed 100 characters'),
  jobDescription: z.string()
    .min(20, 'Job description must be at least 20 characters')
    .max(10000, 'Job description must not exceed 10,000 characters'),
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),
  requirements: z.array(z.string())
    .max(20, 'Cannot have more than 20 requirements')
    .optional(),
})

// Rate Limiting Schema
export const rateLimitSchema = z.object({
  ip: z.string().ip('Invalid IP address'),
  requests: z.number().int().min(0),
  windowMs: z.number().int().min(0),
})

// Export all types
export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>
export type SendFeedbackInput = z.infer<typeof sendFeedbackSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type JobDetailsInput = z.infer<typeof jobDetailsSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type RateLimitInput = z.infer<typeof rateLimitSchema>

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      throw new Error(`Validation failed: ${errorMessage}`)
    }
    throw error
  }
}
