// Utility functions for document import/export
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Set up PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// Export to HTML
export const exportToHtml = (content: string): string => {
  return content;
};

// Export to DOCX
export const exportToDocx = async (content: string): Promise<void> => {
  try {
    // Parse HTML content to create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: parseHtmlToDocxElements(content)
      }]
    });

    // Create blob from DOCX document
    const blob = await Packer.toBlob(doc);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw new Error('Failed to export document to DOCX format');
  }
};

// Simple parser to convert HTML to DOCX elements
function parseHtmlToDocxElements(html: string): any[] {
  const elements: any[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Process all child nodes
  doc.body.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      switch (element.tagName.toLowerCase()) {
        case 'h1':
          elements.push(new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_1
          }));
          break;
        case 'h2':
          elements.push(new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_2
          }));
          break;
        case 'h3':
          elements.push(new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_3
          }));
          break;
        case 'p':
          elements.push(new Paragraph({
            text: element.textContent || '',
          }));
          break;
        case 'strong':
        case 'b':
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: element.textContent || '',
                bold: true
              })
            ]
          }));
          break;
        case 'em':
        case 'i':
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: element.textContent || '',
                italics: true
              })
            ]
          }));
          break;
        case 'ul':
          Array.from(element.children).forEach(li => {
            elements.push(new Paragraph({
              text: `• ${li.textContent || ''}`,
              bullet: {
                level: 0
              }
            }));
          });
          break;
        case 'ol':
          Array.from(element.children).forEach((li, index) => {
            elements.push(new Paragraph({
              text: `${index + 1}. ${li.textContent || ''}`,
              bullet: {
                level: 0
              }
            }));
          });
          break;
        default:
          if (element.textContent) {
            elements.push(new Paragraph({
              text: element.textContent,
            }));
          }
          break;
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      elements.push(new Paragraph({
        text: node.textContent,
      }));
    }
  });
  
  return elements;
}

// Import from DOCX
export const importFromDocx = async (file: File): Promise<string> => {
  try {
    // Check if file is valid
    if (!file || !file.name || !file.size) {
      throw new Error('Invalid file');
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      throw new Error('File must be a DOCX or DOC file');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if file is empty
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty');
    }
    
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  } catch (error: any) {
    console.error('Error importing DOCX:', error);
    throw new Error(`Failed to import DOCX file: ${error.message || 'Unknown error'}`);
  }
};

// Import from Excel
export const importFromExcel = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file is valid
      if (!file || !file.name || !file.size) {
        throw new Error('Invalid file');
      }
      
      // Check file extension
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.xlsx', '.xls'];
      const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidExtension) {
        throw new Error('File must be an Excel file (.xlsx or .xls)');
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          
          // Check if file is empty
          if (data.length === 0) {
            throw new Error('File is empty');
          }
          
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Check if workbook has sheets
          if (workbook.SheetNames.length === 0) {
            throw new Error('Excel file has no sheets');
          }
          
          // Convert first sheet to HTML table
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(worksheet);
          
          resolve(html);
        } catch (error: any) {
          reject(new Error(`Failed to import Excel file: ${error.message || 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      reject(new Error(`Failed to import Excel file: ${error.message || 'Unknown error'}`));
    }
  });
};

// Import from PDF
export const importFromPdf = async (file: File): Promise<string> => {
  try {
    // Check if file is valid
    if (!file || !file.name || !file.size) {
      throw new Error('Invalid file');
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      throw new Error('File must be a PDF file');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if file is empty
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty');
    }
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Check if PDF has pages
    if (pdf.numPages === 0) {
      throw new Error('PDF file has no pages');
    }
    
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => item.str).join(' ') + '\n\n';
    }
    
    // Convert text to basic HTML
    const html = `<p>${textContent.replace(/\n/g, '</p><p>').replace(/<p>\s*<\/p>/g, '')}</p>`;
    return html;
  } catch (error: any) {
    console.error('Error importing PDF:', error);
    throw new Error(`Failed to import PDF file: ${error.message || 'Unknown error'}`);
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