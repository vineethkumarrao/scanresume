import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/analyze-resume";
import { RateLimiter } from "@/lib/rate-limiter";
import { analyzeResumeSchema, validateInput } from "@/lib/validation-schemas";
import { getValidatedEnv } from "@/lib/env-validation";

const rateLimiter = new RateLimiter();

export async function POST(req: NextRequest) {
  try {
    // Validate environment
    const env = getValidatedEnv();
    
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit - Optional Redis
    const isLimited = await rateLimiter.isRateLimited(ip);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate authorization token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
      return NextResponse.json(
        { error: "Unauthorized access" }, 
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = validateInput(analyzeResumeSchema, body);

    // Analyze resume with validated data
    const analysis = await analyzeResume(
      validatedData.jobDescription, 
      validatedData.resumeText
    );

    // Add remaining requests to response headers
    const remaining = await rateLimiter.getRemainingRequests(ip);
    const response = NextResponse.json({
      success: true,
      data: analysis,
    });
    
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Limit', env.RATE_LIMIT_REQUESTS.toString());
    
    return response;
  } catch (error: unknown) {
    console.error("Error analyzing resume:", error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { 
          error: "Invalid input data",
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to analyze resume",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 