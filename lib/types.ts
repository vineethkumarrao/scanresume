// Core Analysis Types
export interface AnalysisCriteria {
  name: string
  status: 'Yes' | 'No' | 'Partial'
  comments: string
}

export interface AnalysisSection {
  score: number
  maxScore: number
  criteria: AnalysisCriteria[]
  summary: string
}

export interface ResumeAnalysisResult {
  overallScore: number
  technicalSkills: AnalysisSection
  experience: AnalysisSection
  education: AnalysisSection
  formatting: AnalysisSection
  softSkills: AnalysisSection
  improvementSuggestions: string[]
  analysisId?: string
  timestamp?: Date
}

// File Processing Types
export interface ProcessedFile {
  name: string
  size: number
  type: string
  content: string
  pages?: number
  extractionMethod: 'pdf-parse' | 'mammoth' | 'tesseract' | 'fallback'
}

export interface FileProcessingError {
  code: 'INVALID_FORMAT' | 'FILE_TOO_LARGE' | 'EXTRACTION_FAILED' | 'CORRUPTED_FILE'
  message: string
  originalError?: Error
}

// Education Analysis Types
export interface EducationEntry {
  institution: string
  degree: string
  field: string
  graduationDate?: string
  gpa?: number
  honors?: string[]
  relevantCoursework?: string[]
}

export interface EducationAnalysis {
  entries: EducationEntry[]
  relevanceScore: number
  gapAnalysis: string[]
  recommendations: string[]
}

// Experience Analysis Types
export interface ExperienceEntry {
  title: string
  company: string
  duration: string
  responsibilities: string[]
  achievements: string[]
  technologies?: string[]
}

export interface ExperienceAnalysis {
  entries: ExperienceEntry[]
  totalYears: number
  relevantExperience: number
  careerProgression: 'ascending' | 'lateral' | 'mixed' | 'unclear'
  keySkills: string[]
  gaps: string[]
}

// Skills Analysis Types
export interface SkillCategory {
  category: string
  skills: string[]
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

export interface SkillsAnalysis {
  technical: SkillCategory[]
  soft: SkillCategory[]
  matched: string[]
  missing: string[]
  recommendations: string[]
}

// API Response Types
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: string
  code?: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// Rate Limiting Types
export interface RateLimitInfo {
  remaining: number
  limit: number
  resetTime: Date
  blocked: boolean
}

// Environment Types
export interface ValidatedEnvironment {
  NEXT_PUBLIC_APP_URL: string
  GEMINI_API_KEY: string
  API_TOKEN: string
  RESEND_API_KEY?: string
  REDIS_URL?: string
  RATE_LIMIT_REQUESTS: number
  RATE_LIMIT_WINDOW_MS: number
  NODE_ENV: 'development' | 'production' | 'test'
}

// Form Types
export interface JobDetailsFormData {
  jobTitle: string
  jobDescription: string
  company?: string
  requirements?: string[]
}

export interface FeedbackFormData {
  feedback: string
  rating: number
  email?: string
  analysisId?: string
}

// Component Props Types
export interface StepProgressProps {
  currentStep: number
  steps: string[]
  className?: string
}

export interface AnalysisProgressProps {
  progress: number
  isAnalyzing: boolean
  stage?: string
}

export interface ResultsDisplayProps {
  analysisResult: ResumeAnalysisResult
  onStartOver: () => void
  onDownloadReport?: () => void
}

// Hook Return Types
export interface UseAnalysisReturn {
  isAnalyzing: boolean
  analysisResult: ResumeAnalysisResult | null
  progress: number
  error: string | null
  handleAnalyze: (jobDescription: string, resumeText: string) => Promise<void>
  reset: () => void
}

export interface UseFileHandlingReturn {
  file: File | null
  fileText: string
  error: string | null
  isProcessing: boolean
  handleFileChange: (files: File[]) => void
  clearFile: () => void
}

export interface UseStepNavigationReturn {
  currentStep: number
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  canProceed: boolean
}

// Error Types
export interface ProcessingError {
  type: 'validation' | 'processing' | 'api' | 'network' | 'unknown'
  message: string
  code?: string
  details?: Record<string, unknown>
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Event Handler Types
export type FileChangeHandler = (files: File[]) => void
export type AnalysisCompleteHandler = (result: ResumeAnalysisResult) => void
export type ErrorHandler = (error: ProcessingError) => void
export type StepChangeHandler = (step: number) => void
