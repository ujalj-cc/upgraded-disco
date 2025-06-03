import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function downloadPDF(element: HTMLElement, filename: string) {
  try {
    // Show loading indicator
    const loadingDiv = document.createElement("div")
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; color: white; font-family: system-ui;">
        <div style="text-align: center;">
          <div style="width: 40px; height: 40px; border: 3px solid #ffffff30; border-top: 3px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <div>Generating PDF...</div>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `
    document.body.appendChild(loadingDiv)

    // Wait a bit for the loading indicator to show
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Find the SVG element specifically
    const svgElement = element.querySelector("svg")
    if (!svgElement) {
      throw new Error("No SVG element found in the container")
    }

    // Get the SVG dimensions
    const svgRect = svgElement.getBoundingClientRect()
    const svgWidth = svgRect.width
    const svgHeight = svgRect.height

    console.log("SVG dimensions:", { svgWidth, svgHeight })

    // Create canvas with higher resolution for better quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f8fafc", // Match the gradient background
      width: svgWidth,
      height: svgHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: svgWidth,
      windowHeight: svgHeight,
      onclone: (clonedDoc) => {
        // Ensure all SVG elements are properly styled in the clone
        const clonedSvg = clonedDoc.querySelector("svg")
        if (clonedSvg) {
          clonedSvg.style.backgroundColor = "#f8fafc"
          clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

          // Fix any potential SVG rendering issues
          const allElements = clonedSvg.querySelectorAll("*")
          allElements.forEach((el) => {
            if (el instanceof SVGElement) {
              // Ensure proper SVG namespace
              el.setAttribute("xmlns", "http://www.w3.org/2000/svg")
            }
          })
        }
      },
    })

    console.log("Canvas created:", { width: canvas.width, height: canvas.height })

    const imgData = canvas.toDataURL("image/png", 1.0)

    // Calculate PDF dimensions
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Determine orientation based on aspect ratio
    const isLandscape = imgWidth > imgHeight
    const orientation = isLandscape ? "landscape" : "portrait"

    // Standard page sizes
    const pageFormats = {
      landscape: { width: 297, height: 210 }, // A4 landscape in mm
      portrait: { width: 210, height: 297 }, // A4 portrait in mm
    }

    const pageFormat = pageFormats[orientation]

    // Calculate scale to fit the image on the page with margins
    const margin = 10 // 10mm margin
    const availableWidth = pageFormat.width - margin * 2
    const availableHeight = pageFormat.height - margin * 2

    const scaleX = availableWidth / (imgWidth * 0.264583) // Convert pixels to mm
    const scaleY = availableHeight / (imgHeight * 0.264583)
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up

    const finalWidth = imgWidth * 0.264583 * scale
    const finalHeight = imgHeight * 0.264583 * scale

    // Center the image on the page
    const x = (pageFormat.width - finalWidth) / 2
    const y = (pageFormat.height - finalHeight) / 2

    console.log("PDF dimensions:", {
      orientation,
      pageFormat,
      scale,
      finalWidth,
      finalHeight,
      x,
      y,
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4",
    })

    // Add the image to PDF
    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight, undefined, "FAST")

    // Add header with company info
    pdf.setFontSize(16)
    pdf.setTextColor(30, 41, 59) // Dark gray
    pdf.text("Organizational Chart", margin, margin + 5)

    pdf.setFontSize(10)
    pdf.setTextColor(100, 116, 139) // Gray
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, margin + 12)
    pdf.text(
      `Total Employees: ${element.querySelector("[data-employee-count]")?.textContent || "N/A"}`,
      margin,
      margin + 18,
    )

    // Add footer
    const pageHeight = pageFormat.height
    pdf.setFontSize(8)
    pdf.setTextColor(148, 163, 184) // Light gray
    pdf.text("Confidential - Internal Use Only", margin, pageHeight - margin)
    pdf.text(`Page 1 of 1`, pageFormat.width - margin - 20, pageHeight - margin)

    // Add metadata
    pdf.setProperties({
      title: "Organizational Chart",
      subject: "Company Hierarchy Structure",
      author: "Organization Management System",
      creator: "Advanced Org Chart Generator",
      keywords: "organizational chart, hierarchy, employees, structure",
    })

    // Remove loading indicator
    document.body.removeChild(loadingDiv)

    // Use a different approach to trigger download
    try {
      // First try the standard save method
      pdf.save(filename)
      console.log("PDF generated successfully using standard method")
    } catch (saveError) {
      console.warn("Standard PDF save failed, trying alternative method:", saveError)

      // Alternative method: Create a blob and use a download link
      const blob = pdf.output("blob")
      const url = URL.createObjectURL(blob)

      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = filename
      downloadLink.style.display = "none"
      document.body.appendChild(downloadLink)

      // Trigger download and clean up
      downloadLink.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(downloadLink)
        console.log("PDF generated successfully using alternative method")
      }, 100)
    }
  } catch (error) {
    // Remove loading indicator if it exists
    const loadingDiv = document.querySelector('[style*="position: fixed"]')
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv)
    }

    console.error("Error generating PDF:", error)

    // Show user-friendly error message
    const errorDiv = document.createElement("div")
    errorDiv.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 20px; border-radius: 8px; z-index: 9999; font-family: system-ui; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div style="font-weight: 600; margin-bottom: 4px;">PDF Generation Failed</div>
        <div style="font-size: 14px; opacity: 0.9;">Please try again or contact support</div>
      </div>
    `
    document.body.appendChild(errorDiv)

    // Auto-remove error message after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv)
      }
    }, 5000)

    throw new Error("Failed to generate PDF. Please try again.")
  }
}
