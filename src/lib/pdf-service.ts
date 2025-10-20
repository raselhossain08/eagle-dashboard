// PDF service
export const generatePDF = async (content: any) => {
  // PDF generation logic
  return Buffer.from('PDF content', 'utf-8');
};

export const createContractPDF = async (contract: any) => {
  // Contract PDF creation logic
  return generatePDF(contract);
};

// Also export as pdfService for backward compatibility
export const pdfService = {
  generateContractPdf: createContractPDF,
  generatePDF
};