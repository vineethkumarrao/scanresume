// Fallback text extraction function that doesn't rely on PDF.js
export async function extractTextWithoutPdfJs(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        // For text files, just return the content
        const text = reader.result as string
        resolve(text)
      } catch {
        reject(new Error("Failed to extract text from file. Please try a different file format."))
      }
    }
    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }
    reader.readAsText(file)
  })
}

// Initialize PDF.js
export async function initPdfJs() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const pdfjs = await import("pdfjs-dist")
    const version = "5.2.133" // Use a specific version for stability
    // Use unpkg.com instead of cdnjs for better reliability
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`
    return pdfjs
  } catch (error) {
    console.error("Failed to initialize PDF.js:", error)
    return null
  }
}
