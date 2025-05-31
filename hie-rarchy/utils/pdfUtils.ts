import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  try {
    // Find the chart container
    const element = document.querySelector(".h-96.w-full.border.rounded-lg") as HTMLElement

    if (!element) {
      throw new Error("Chart element not found")
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Add metadata
    pdf.setProperties({
      title: "Organizational Chart",
      subject: "Company Organizational Structure",
      author: "Org Chart Builder",
      creator: "Org Chart Builder",
    })

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("PDF export failed:", error)
    throw new Error("Failed to export PDF. Please try again.")
  }
}

export function downloadAsImage(elementId: string, filename: string, format: "png" | "jpeg" = "png"): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const element = document.querySelector(".h-96.w-full.border.rounded-lg") as HTMLElement

      if (!element) {
        throw new Error("Chart element not found")
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `${filename}.${format}`
      link.href = canvas.toDataURL(`image/${format}`)

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
