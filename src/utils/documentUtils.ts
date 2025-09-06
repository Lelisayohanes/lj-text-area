// Utility functions for document import/export
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Export to HTML
export const exportToHtml = (content: string): string => {
  return content;
};

// Export to DOCX (simplified implementation)
export const exportToDocx = (content: string): void => {
  // In a real implementation, this would use the docx library to create a DOCX file
  // For now, we'll just download the HTML content as a .doc file
  const blob = new Blob([content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import from DOCX
export const importFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error importing DOCX:', error);
    throw new Error('Failed to import DOCX file');
  }
};

// Import from Excel
export const importFromExcel = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Convert first sheet to HTML table
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const html = XLSX.utils.sheet_to_html(worksheet);
        
        resolve(html);
      } catch (error) {
        reject(new Error('Failed to import Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

// Import from PDF
export const importFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => item.str).join(' ') + '\n\n';
    }
    
    // Convert text to basic HTML
    const html = `<p>${textContent.replace(/\n/g, '</p><p>').replace(/<p>\s*<\/p>/g, '')}</p>`;
    return html;
  } catch (error) {
    console.error('Error importing PDF:', error);
    throw new Error('Failed to import PDF file');
  }
};

// Export to PDF (simplified implementation)
export const exportToPdf = (content: string): void => {
  // In a real implementation, this would use a library like jsPDF to create a PDF
  // For now, we'll just open the content in a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Document</title>
          <style>
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // printWindow.print();
    // printWindow.close();
  }
};