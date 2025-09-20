import { useState, useEffect, useRef, useCallback } from "react"
import { analyzeResume } from "@/lib/analyze-resume"
import { STEPS } from "../constants"
import type { ResumeAnalysisResult } from "@/lib/types"

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset progress when analysis completes
  useEffect(() => {
    if (!isAnalyzing && progress > 0 && progress < 100) {
      setProgress(100)
    }
  }, [isAnalyzing, progress])

  // Simulate progress during analysis
  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0)

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Create new interval to update progress
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 90
          }
          return prev + 5
        })
      }, 500)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAnalyzing])

  const handleAnalyze = useCallback(async (
    jobDescription: string,
    resumeText: string,
    setCurrentStep: (step: number) => void,
    setError: (error: string | null) => void,
  ) => {
    if (!resumeText) {
      setError("Could not extract text from the resume file. Please check the file and try again.")
      return
    }

    if (!jobDescription) {
      setError("Please enter a job description.")
      return
    }

    setIsAnalyzing(true)
    setCurrentStep(STEPS.ANALYSIS)
    setError(null)

    try {
      const result = await analyzeResume(jobDescription, resumeText)
      setAnalysisResult(result)
      setProgress(100)
      setCurrentStep(STEPS.RESULTS)
    } catch (err: unknown) {
      console.error("Error analyzing resume:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Error analyzing resume: ${errorMessage}`)
      setCurrentStep(STEPS.UPLOAD_RESUME)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAnalysisResult(null)
    setProgress(0)
    setIsAnalyzing(false)
  }, [])

  return {
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    progress,
    handleAnalyze,
    reset,
  }
}
