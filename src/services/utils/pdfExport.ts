import { AnalysisResult } from '@/services/imageAnalysis';

export async function exportAnalysisPDF(result: AnalysisResult): Promise<void> {
  try {
    // Dynamic import to avoid large bundle
    const { jsPDF } = await import('jspdf');
    const { html2canvas } = await import('html2canvas');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(20);
    doc.text('AiroDx Analysis Report', pageWidth / 2, 20, { align: 'center' });

    // Metadata
    doc.setFontSize(10);
    let yPos = 35;
    doc.text(`Analysis ID: ${result.id}`, 20, yPos);
    yPos += 7;
    doc.text(`Date: ${new Date(result.timestamp).toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Model: ${result.modelUsed}`, 20, yPos);
    yPos += 7;
    doc.text(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, 20, yPos);

    // Image
    if (result.imageUrl) {
      yPos += 15;
      try {
        const canvas = await html2canvas(document.querySelector('[data-export-image]') || new Image());
        const imgData = canvas.toDataURL('image/jpeg');
        doc.addImage(imgData, 'JPEG', 20, yPos, 170, 100);
        yPos += 110;
      } catch {
        yPos += 20;
      }
    }

    // Findings
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Clinical Findings', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    result.findings.forEach(finding => {
      const text = `${finding.label} (${(finding.confidence * 100).toFixed(0)}%): ${finding.description}`;
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      lines.forEach(line => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 4;
    });

    // Disclaimer
    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(180, 0, 0);
    const disclaimer = 'DISCLAIMER: This report is AI-generated. Clinical decisions must be verified by qualified medical professionals.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    disclaimerLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });

    // Save
    doc.save(`AiroDx-${result.id.slice(0, 8)}.pdf`);
  } catch (e) {
    console.error('PDF export failed:', e);
    throw new Error('Failed to export PDF');
  }
}
