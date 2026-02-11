import jsPDF from 'jspdf';
import { Stretch } from '@/types/recovery';

interface SessionPDFData {
  date: Date;
  stretches: Stretch[];
  totalActiveTime: number; // in seconds
  stretchTimes?: Record<string, number>; // stretch id -> time spent in seconds
}

export function generateSessionPDF(data: SessionPDFData): void {
  const { date, stretches, totalActiveTime, stretchTimes } = data;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Color palette (matching app theme - obsidian dark with blue accent)
  const colors = {
    background: [23, 25, 30] as [number, number, number],      // Dark background
    cardBg: [30, 33, 39] as [number, number, number],          // Card background
    primary: [66, 153, 225] as [number, number, number],       // Blue accent
    primaryLight: [99, 179, 237] as [number, number, number],  // Lighter blue
    text: [180, 185, 195] as [number, number, number],         // Muted text
    textBright: [220, 225, 235] as [number, number, number],   // Bright text
    border: [50, 55, 65] as [number, number, number],          // Border color
  };

  // Fill background
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  let yPos = margin;

  // Header with gradient-like effect (two overlapping rectangles)
  const headerHeight = 45;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, yPos, contentWidth, headerHeight, 4, 4, 'F');
  
  // App name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RecoverFlow', margin + 10, yPos + 18);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Recovery Session Summary', margin + 10, yPos + 28);

  // Date on the right
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dateWidth = doc.getTextWidth(formattedDate);
  doc.text(formattedDate, pageWidth - margin - 10 - dateWidth, yPos + 18);
  
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const timeWidth = doc.getTextWidth(formattedTime);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedTime, pageWidth - margin - 10 - timeWidth, yPos + 28);

  yPos += headerHeight + 15;

  // Stats card
  const statsHeight = 30;
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(margin, yPos, contentWidth, statsHeight, 3, 3, 'F');
  
  // Total time
  const totalMinutes = Math.floor(totalActiveTime / 60);
  const totalSeconds = totalActiveTime % 60;
  const timeStr = totalMinutes > 0 
    ? `${totalMinutes}m ${totalSeconds}s` 
    : `${totalSeconds}s`;
  
  const statWidth = contentWidth / 2;
  
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.text('Total Time', margin + statWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...colors.primaryLight);
  doc.setFont('helvetica', 'bold');
  doc.text(timeStr, margin + statWidth / 2, yPos + 22, { align: 'center' });

  // Total stretches
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  doc.text('Stretches Completed', margin + statWidth + statWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...colors.primaryLight);
  doc.setFont('helvetica', 'bold');
  doc.text(stretches.length.toString(), margin + statWidth + statWidth / 2, yPos + 22, { align: 'center' });

  yPos += statsHeight + 15;

  // Section header
  doc.setFontSize(14);
  doc.setTextColor(...colors.textBright);
  doc.setFont('helvetica', 'bold');
  doc.text('Stretch Details', margin, yPos);
  yPos += 10;

  // Stretches table
  const tableHeaderHeight = 10;
  const rowHeight = 14;
  
  // Table header
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(margin, yPos, contentWidth, tableHeaderHeight, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 5, yPos + 7);
  doc.text('Stretch Name', margin + 15, yPos + 7);
  doc.text('Target Areas', margin + 95, yPos + 7);
  doc.text('Duration', pageWidth - margin - 25, yPos + 7);
  
  yPos += tableHeaderHeight + 2;

  // Table rows
  doc.setFont('helvetica', 'normal');
  stretches.forEach((stretch, index) => {
    // Check for page break
    if (yPos + rowHeight > pageHeight - margin) {
      doc.addPage();
      doc.setFillColor(...colors.background);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      yPos = margin;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(35, 38, 45);
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
    }

    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text((index + 1).toString(), margin + 5, yPos + 9);
    
    doc.setTextColor(...colors.textBright);
    doc.text(stretch.name, margin + 15, yPos + 9);
    
    doc.setTextColor(...colors.text);
    const targetAreas = stretch.targetAreas.slice(0, 3).join(', ');
    doc.text(targetAreas, margin + 95, yPos + 9);
    
    // Time for this stretch
    const stretchTime = stretchTimes?.[stretch.id] || stretch.duration;
    const mins = Math.floor(stretchTime / 60);
    const secs = stretchTime % 60;
    const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    doc.setTextColor(...colors.primaryLight);
    doc.text(durationStr, pageWidth - margin - 25, yPos + 9);

    yPos += rowHeight;
  });

  // Footer
  yPos = pageHeight - margin - 10;
  doc.setDrawColor(...colors.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  doc.text('Generated by RecoverFlow • Train hard. Recover harder.', pageWidth / 2, yPos, { align: 'center' });

  // Download the PDF
  const fileName = `recovery-session-${date.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
