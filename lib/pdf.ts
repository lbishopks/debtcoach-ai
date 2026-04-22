/**
 * DebtCoach AI — PDF letter generator
 * Produces a clean, print-ready formal letter PDF using jsPDF.
 * No branding watermarks — letter looks like a professional document.
 */

export async function downloadLetterPDF(letterText: string, letterType: string, creditorName: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 25.4  // 1 inch margins
  const contentW = pageW - margin * 2
  let y = margin

  // ── Body text ────────────────────────────────────────────────────────────────
  doc.setFont('courier', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)

  const paragraphs = letterText.split('\n')

  for (const para of paragraphs) {
    if (para.trim() === '') {
      y += 5
      continue
    }

    // Detect header-like lines (all caps, short)
    const isHeader = para.trim().length < 60 && para.trim() === para.trim().toUpperCase() && /[A-Z]{3,}/.test(para)

    if (isHeader) {
      doc.setFont('courier', 'bold')
    } else {
      doc.setFont('courier', 'normal')
    }

    const lines = doc.splitTextToSize(para, contentW)

    for (const line of lines) {
      // New page if needed — clean page with matching margins
      if (y + 6 > pageH - margin) {
        doc.addPage()
        y = margin
        doc.setFont('courier', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
      }

      doc.text(line, margin, y)
      y += 6
    }
  }

  // ── Page numbers only ────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages()
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' })
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const safeName = creditorName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'letter'
  const safeType = letterType.replace(/_/g, '-')
  doc.save(`${safeType}-${safeName}.pdf`)
}
