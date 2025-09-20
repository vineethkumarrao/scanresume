import { NextResponse } from "next/server"
import { Resend } from "resend"
import { sendFeedbackSchema, validateInput } from "@/lib/validation-schemas"
import { getValidatedEnv } from "@/lib/env-validation"

export async function POST(request: Request) {
  try {
    // Validate environment
    const env = getValidatedEnv()
    
    // Initialize Resend with validated API key
    if (!env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - feedback emails disabled")
      return NextResponse.json(
        { error: "Email service not configured" }, 
        { status: 503 }
      )
    }
    
    const resend = new Resend(env.RESEND_API_KEY)

    // Parse and validate request body
    const body = await request.json()
    
    // For backward compatibility, map old format to new schema
    const mappedBody = {
      feedback: body.feedback,
      rating: body.rating || 5, // Default rating if not provided
      email: body.email,
      analysisId: body.analysisId,
    }
    
    const validatedData = validateInput(sendFeedbackSchema, mappedBody)

    // Send the email
    const { data, error } = await resend.emails.send({
  from: "Scanresume Feedback <noreply@scanresume.com>",
  to: "vineethkumarrao@gmail.com",
      subject: `New Feedback - Rating: ${validatedData.rating}/5`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">New Feedback from Scanresume</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Rating:</strong> ${validatedData.rating}/5 ⭐</p>
            ${validatedData.email ? `<p><strong>Email:</strong> ${validatedData.email}</p>` : ''}
            ${validatedData.analysisId ? `<p><strong>Analysis ID:</strong> ${validatedData.analysisId}</p>` : ''}
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #555;">Feedback:</h3>
            <p style="white-space: pre-line;">${validatedData.feedback}</p>
          </div>
          
          <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">
            This email was sent automatically from the Scanresume website feedback form.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Feedback sent successfully",
      data 
    })
  } catch (error) {
    console.error("Error in feedback API:", error)
    
    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { 
          error: "Invalid feedback data",
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
