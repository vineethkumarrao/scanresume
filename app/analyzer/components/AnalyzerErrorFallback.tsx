"use client"

import React from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface AnalyzerErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

export function AnalyzerErrorFallback({ error, resetError }: AnalyzerErrorFallbackProps) {
  const isRateLimitError = error?.message.includes('Rate limit') || error?.message.includes('429')
  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network')
  const isValidationError = error?.message.includes('Validation failed')

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isRateLimitError ? (
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            ) : (
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {isRateLimitError && 'Rate Limit Exceeded'}
            {isNetworkError && 'Network Error'}
            {isValidationError && 'Invalid Input'}
            {!isRateLimitError && !isNetworkError && !isValidationError && 'Analysis Failed'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {isRateLimitError && 
              'You\'ve made too many requests. Please wait a moment before trying again.'
            }
            {isNetworkError && 
              'Unable to connect to our analysis service. Please check your internet connection.'
            }
            {isValidationError && 
              'The provided data is invalid. Please check your inputs and try again.'
            }
            {!isRateLimitError && !isNetworkError && !isValidationError && 
              'We encountered an error while analyzing your resume. Please try again.'
            }
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-gray-50 p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                Developer Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {resetError && (
              <Button onClick={resetError} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>

          {isRateLimitError && (
            <p className="text-xs text-gray-500 mt-4">
              Rate limits help us maintain service quality for all users.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
