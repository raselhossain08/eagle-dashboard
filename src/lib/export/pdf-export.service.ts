import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AuditLog, AuditQueryParams } from '@/types/audit';

export class PDFExportService {
  async exportAuditLogsToPDF(logs: AuditLog[], filters: AuditQueryParams, title: string = 'Audit Report'): Promise<Blob> {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text(title, 20, 30);
    
    // Add filters information
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    
    if (filters.startDate && filters.endDate) {
      doc.text(`Date Range: ${filters.startDate.toLocaleDateString()} - ${filters.endDate.toLocaleDateString()}`, 20, 55);
    }
    
    if (filters.adminUserId) {
      doc.text(`Admin: ${filters.adminUserId}`, 20, 65);
    }
    
    if (filters.action) {
      doc.text(`Action: ${filters.action}`, 20, 75);
    }

    let yPosition = 90;

    // Add table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Timestamp', 20, yPosition);
    doc.text('Admin', 60, yPosition);
    doc.text('Action', 100, yPosition);
    doc.text('Resource', 140, yPosition);
    doc.text('Status', 180, yPosition);
    
    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    // Add log entries
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    logs.forEach((log, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(new Date(log.timestamp).toLocaleDateString(), 20, yPosition);
      doc.text(log.adminUserEmail, 60, yPosition);
      doc.text(log.action, 100, yPosition);
      doc.text(log.resourceType || '-', 140, yPosition);
      doc.text(log.status, 180, yPosition);
      
      yPosition += 8;
    });

    // Add summary
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`Total Records: ${logs.length}`, 20, yPosition);

    return doc.output('blob');
  }

  async exportDashboardToPDF(elementId: string, filename: string = 'audit-dashboard.pdf'): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF('landscape');
    
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    return doc.output('blob');
  }

  async generateComplianceReport(
    logs: AuditLog[], 
    standard: 'SOX' | 'GDPR' | 'HIPAA'
  ): Promise<Blob> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text(`${standard} Compliance Audit Report`, 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Total Records: ${logs.length}`, 20, 55);
    
    // Compliance Summary
    let yPosition = 75;
    doc.setFontSize(14);
    doc.text('Compliance Summary', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    
    const complianceMetrics = this.calculateComplianceMetrics(logs, standard);
    
    Object.entries(complianceMetrics).forEach(([key, value]) => {
      doc.text(`${key}: ${value}%`, 20, yPosition);
      yPosition += 8;
    });

    // Detailed Findings
    yPosition += 15;
    doc.setFontSize(14);
    doc.text('Key Findings', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    
    const findings = this.generateComplianceFindings(logs, standard);
    findings.forEach((finding, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. ${finding}`, 20, yPosition);
      yPosition += 8;
    });

    return doc.output('blob');
  }

  private calculateComplianceMetrics(logs: AuditLog[], standard: string): Record<string, number> {
    // Mock compliance calculation - replace with actual logic
    return {
      'Access Control': 95,
      'Data Integrity': 88,
      'Audit Trail': 92,
      'Security Events': 85,
      'Policy Compliance': 90
    };
  }

  private generateComplianceFindings(logs: AuditLog[], standard: string): string[] {
    // Mock findings - replace with actual analysis
    return [
      'All critical actions properly logged and traced',
      'Access control events show proper authorization',
      'Data modification events include before/after states',
      'Security events properly categorized and documented',
      'Audit trail completeness meets compliance requirements'
    ];
  }
}

export const pdfExportService = new PDFExportService();