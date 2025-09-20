import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid APP_URL'),
  GEMINI_API_KEY: z.string().min(10, 'GEMINI_API_KEY is required'),
  API_TOKEN: z.string().min(20, 'API_TOKEN must be at least 20 characters'),
  RESEND_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  RATE_LIMIT_REQUESTS: z.string().transform(Number).pipe(z.number().positive()),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function getValidatedEnv(): Env {
  if (validatedEnv) return validatedEnv

  try {
    validatedEnv = envSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n')
      
      throw new Error(`Environment validation failed:\n${errorMessage}`)
    }
    throw error
  }
}

// API key validation utilities
export function validateApiKey(key: string, service: string): boolean {
  if (!key) {
    throw new Error(`${service} API key is not configured`)
  }
  
  // Basic format validation for common services
  switch (service) {
    case 'gemini':
      return key.startsWith('AIza') && key.length >= 39
    case 'resend':
      return key.startsWith('re_') && key.length >= 20
    default:
      return key.length >= 10
  }
}

// Generate secure API token
export function generateSecureApiToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
