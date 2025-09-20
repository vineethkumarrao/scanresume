"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ResumeAnalysisResult } from "@/components/resume-analysis-result"
import { ResumeAnalysisResult as AnalysisResult } from "@/lib/types"
import { staggerContainerVariants, staggerItemVariants } from "../animations"

interface ResultsDisplayProps {
  analysisResult: AnalysisResult
  file: File | null
  jobTitle: string
  resetAnalysis: () => void
}

export function ResultsDisplay({ analysisResult, file, jobTitle, resetAnalysis }: ResultsDisplayProps) {
  // Add state for feedback popup
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false)

  // Add function to handle feedback button click
  const handleFeedbackClick = () => {
    setShowFeedbackMessage(true)

    // Show message briefly then scroll to feedback section
    setTimeout(() => {
      setShowFeedbackMessage(false)
      // Find the feedback section in the footer and scroll to it
      const feedbackSection = document.querySelector("footer form")
      if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: "smooth" })
      }
    }, 2000)
  }

  return (
    <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
      <motion.div variants={staggerItemVariants} className="mb-6">
        <h2 className="text-xl font-bold">Analysis Results</h2>
      </motion.div>

      <motion.div variants={staggerItemVariants}>
        <ResumeAnalysisResult
          result={analysisResult}
          resumeName={file?.name || "Unnamed Resume"}
          jobTitle={jobTitle || "Untitled Job"}
        />
      </motion.div>

      <motion.div variants={staggerItemVariants} className="mt-8 flex justify-center gap-4">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={resetAnalysis}
            className="gap-2 px-6 py-2 text-sm rounded-full bg-gradient-to-r from-white to-white/90 text-black hover:from-white/95 hover:to-white/85 group interactive-dots"
          >
            Start New Analysis
          </Button>
        </motion.div>

        {/* Add the new Loved it? button */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleFeedbackClick}
            className="gap-2 px-6 py-2 text-sm rounded-full bg-gradient-to-r from-white/10 to-white/20 border border-white/20 hover:bg-white/15 group"
          >
            Loved it?
          </Button>
        </motion.div>
      </motion.div>

      {/* Add feedback popup message */}
      {showFeedbackMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-white/80 bg-white/10 p-3 rounded-lg border border-white/10 max-w-md mx-auto"
        >
          leave your feedback with us 😊
        </motion.div>
      )}
    </motion.div>
  )
}
