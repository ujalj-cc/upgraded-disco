// utils/pdfUtils.ts

/**
 * Export an element to PDF using html2canvas and jsPDF
 * @param elementId - The ID of the element to export
 * @param filename - The filename for the PDF (optional)
 */
export async function exportToPDF(elementId: string, filename: string = 'export.pdf') {
  try {
    // Dynamic imports to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }

    // Create canvas with high quality settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })

    // Get canvas dimensions
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Calculate PDF dimensions (in points, 72 DPI)
    const pdfWidth = canvasWidth * 0.75  // Convert pixels to points
    const pdfHeight = canvasHeight * 0.75

    // Determine orientation
    const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait'

    // Create PDF with custom dimensions
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
      compress: true
    })

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0)

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

    // Add metadata
    pdf.setProperties({
      title: 'Organizational Chart',
      subject: 'Company Organization Structure',
      author: 'OrgChart App',
      creator: 'OrgChart PDF Exporter',
      keywords: 'organizational chart, company structure'
    })

    // Generate filename with timestamp if not provided
    const finalFilename = filename.includes('.pdf') 
      ? filename 
      : `${filename}-${new Date().toISOString().split('T')[0]}.pdf`

    // Save the PDF
    pdf.save(finalFilename)

    return true
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Export multiple elements to a single PDF
 * @param elementIds - Array of element IDs to export
 * @param filename - The filename for the PDF
 */
export async function exportMultipleToPDF(elementIds: string[], filename: string = 'multi-export.pdf') {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    })

    let isFirstPage = true

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId)
      if (!element) {
        console.warn(`Element with ID '${elementId}' not found, skipping...`)
        continue
      }

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      
      if (!isFirstPage) {
        pdf.addPage()
      }

      // Fit image to page
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height)
      
      const imgWidth = canvas.width * ratio
      const imgHeight = canvas.height * ratio
      const x = (pdfWidth - imgWidth) / 2
      const y = (pdfHeight - imgHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
      isFirstPage = false
    }

    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Multi-PDF export failed:', error)
    throw new Error(`Failed to export multi-PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}