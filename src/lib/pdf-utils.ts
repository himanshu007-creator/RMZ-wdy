import { Contract } from '@/types';

/**
 * Generates and downloads a PDF for a contract
 */
export const downloadContractPDF = async (contract: Contract): Promise<void> => {
  try {
    // Import jsPDF dynamically to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Wedding Vendor Contract', 20, 30);
    
    // Contract details
    doc.setFontSize(12);
    let yPosition = 50;
    
    // Client information
    doc.setFontSize(14);
    doc.text('Contract Details', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Contract ID: ${contract.id}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Client Name: ${contract.clientName}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Event Date: ${new Date(contract.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Event Venue: ${contract.eventVenue}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Service Package: ${contract.servicePackage}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Amount: ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(contract.amount)}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Status: ${contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}`, 20, yPosition);
    yPosition += 15;
    
    // Contract terms
    doc.setFontSize(14);
    doc.text('Contract Terms', 20, yPosition);
    yPosition += 10;
    
    // Convert HTML content to plain text for PDF
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contract.content;
    const plainTextContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Split content into lines that fit the page width
    doc.setFontSize(10);
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 40; // 20px margin on each side
    const lines = doc.splitTextToSize(plainTextContent, maxLineWidth);
    
    // Add content lines
    for (let i = 0; i < lines.length; i++) {
      if (yPosition > 270) { // Check if we need a new page
        doc.addPage();
        yPosition = 20;
      }
      doc.text(lines[i], 20, yPosition);
      yPosition += 6;
    }
    
    // Signature section if contract is signed
    if (contract.status === 'signed' && contract.signature) {
      yPosition += 20;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Digital Signature', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Signed on: ${new Date(contract.signature.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, yPosition);
      yPosition += 8;
      
      doc.text(`Signature Type: ${contract.signature.type === 'drawn' ? 'Digital Drawing' : 'Typed Signature'}`, 20, yPosition);
      yPosition += 15;
      
      // Add signature image if it's a drawn signature
      if (contract.signature.type === 'drawn' && contract.signature.data) {
        try {
          doc.addImage(contract.signature.data, 'PNG', 20, yPosition, 100, 30);
        } catch (error) {
          console.warn('Could not add signature image to PDF:', error);
          doc.text('Signature: [Digital signature applied]', 20, yPosition);
        }
      } else if (contract.signature.type === 'typed') {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'italic');
        doc.text(contract.signature.data, 20, yPosition);
      }
    }
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Download the PDF
    const fileName = `contract-${contract.clientName.replace(/\s+/g, '-').toLowerCase()}-${contract.id}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Checks if PDF generation is supported in the current environment
 */
export const isPDFSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};