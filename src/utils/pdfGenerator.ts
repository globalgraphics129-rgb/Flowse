import { jsPDF } from 'jspdf';
import { Transaction, UserProfile, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';

export function generateStatementPDF(
  profile: UserProfile,
  transactions: Transaction[],
  currencySymbol: string
) {
  // Create a new A4 sized document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 15;
  let y = 18;

  // Aesthetic color scheme definitions (Sage emerald brand identity)
  const primaryColor = [16, 157, 100]; // #109D64 (Emerald/Sage)
  const textColor = [11, 25, 21];      // Dark Charcoal text
  const mutedColor = [100, 116, 110];  // Muted gray-green
  const lightBgColor = [246, 251, 249]; // Soft cream background

  // Helper: Draw brand header banner block
  function drawLogo(x: number, currentY: number) {
    // Elegant circular brand graphic logo
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(x, currentY, 10, 10, 2.5, 2.5, 'F');
    
    // Draw white center lines
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.circle(x + 5, currentY + 5, 2.5);
    
    // Brand Name block
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Flowse', x + 13, currentY + 7);
    
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('SECURE LOCAL LEDGER', x + 13, currentY + 10);
  }

  // Draw Logo and Brand marks on Page 1
  drawLogo(margin, y);

  // If the user uploaded a custom profile picture, embed it as a custom-resizer avatar!
  if (profile.profilePicture) {
    try {
      // jsPDF supports native addImage with base64 data URLs
      doc.addImage(profile.profilePicture, 'JPEG', pageWidth - margin - 18, y - 2, 16, 16, 'avatar', 'FAST');
    } catch (e) {
      console.error("PDF Image embed fallback:", e);
      // Fallback: draw initials badge
      doc.setFillColor(230, 245, 238);
      doc.circle(pageWidth - margin - 9, y + 6, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      doc.text(initials, pageWidth - margin - 12.5, y + 8.5);
    }
  } else {
    // Normal fallback: draw initials avatar circle
    doc.setFillColor(230, 245, 238);
    doc.circle(pageWidth - margin - 9, y + 6, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    doc.text(initials, pageWidth - margin - 12.5, y + 8.5);
  }

  y += 20;

  // Add line separator
  doc.setDrawColor(223, 237, 232);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // Title and dates
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Statement of Account Ledger', margin, y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(`Generated on: ${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y + 4.5);

  y += 12;

  // Customer Vault Metadata box
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.setDrawColor(223, 237, 232);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 3, 3, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ACCOUNT HOLDER DETAILS', margin + 5, y + 5.5);

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(profile.name, margin + 5, y + 11.5);

  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Email Address: ${profile.email}`, margin + 5, y + 16.5);

  // Storage node count
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Audited Logs: ${transactions.length} items`, pageWidth - margin - 45, y + 11.5);
  doc.text(`Vault Status: Encrypted / Local`, pageWidth - margin - 45, y + 16.5);

  y += 28;

  // Mathematical variables calculations
  const totalInflow = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCombined = totalInflow - totalOutflow;

  // Summaries Panels segment (3 boxes)
  const boxW = (pageWidth - (margin * 2) - 8) / 3;
  
  // Box 1: Inflows
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(margin, y, boxW, 16, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CUMULATIVE INFLOWS', margin + 4, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`${currencySymbol}${totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, margin + 4, y + 11);

  // Box 2: Outflows
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(margin + boxW + 4, y, boxW, 16, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(223, 93, 66); // Clay red
  doc.text('CUMULATIVE OUTFLOWS', margin + boxW + 8, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`${currencySymbol}${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, margin + boxW + 8, y + 11);

  // Box 3: Net Ledger Balance
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(margin + (boxW * 2) + 8, y, boxW, 16, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('NET LEDGER BALANCE', margin + (boxW * 2) + 12, y + 5);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  const isNegative = netCombined < 0;
  doc.setTextColor(isNegative ? 223 : 16, isNegative ? 93 : 157, isNegative ? 66 : 100);
  doc.text(`${currencySymbol}${netCombined.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, margin + (boxW * 2) + 12, y + 11);

  y += 24;

  // Logs Table header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('DETAILED AUDIT ENTRY HISTORIES', margin, y);

  y += 5;

  // Draw table header columns
  doc.setFillColor(textColor[0], textColor[1], textColor[2]);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 7, 1.5, 1.5, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('RECORD DATE', margin + 4, y + 4.5);
  doc.text('IDENTIFIER / MEMO DETAILS', margin + 35, y + 4.5);
  doc.text('CATEGORY', margin + 110, y + 4.5);
  doc.text('SUM MAGNITUDE', pageWidth - margin - 4, y + 4.5, { align: 'right' });

  y += 7;

  // Sorting transactions descending by date
  const sortedTrans = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render Table row-by-row with support for A4 pagination split!
  if (sortedTrans.length === 0) {
    doc.setFont('Helvetica', 'oblique');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('No ledger transaction entries recorded on this terminal.', margin + 4, y + 10);
  } else {
    let altRow = false;
    sortedTrans.forEach((t) => {
      // Prevent overflow - trigger new page
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 18;
        
        // Redraw small brand tag at top of new page
        drawLogo(margin, y);
        y += 15;
        
        // Redraw light line separator
        doc.setDrawColor(223, 237, 232);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Re-draw table headers on new page
        doc.setFillColor(textColor[0], textColor[1], textColor[2]);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 7, 1.5, 1.5, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text('RECORD DATE', margin + 4, y + 4.5);
        doc.text('IDENTIFIER / MEMO DETAILS', margin + 35, y + 4.5);
        doc.text('CATEGORY', margin + 110, y + 4.5);
        doc.text('SUM MAGNITUDE', pageWidth - margin - 4, y + 4.5, { align: 'right' });
        y += 7;
      }

      // Draw light gray background on zebra rows
      if (altRow) {
        doc.setFillColor(249, 252, 251);
        doc.rect(margin, y, pageWidth - (margin * 2), 9.5, 'F');
      }

      // Format human-friendly date
      const dateStr = new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(dateStr, margin + 4, y + 6);

      // Description + optional Notes
      const descText = t.description;
      const notesSuffix = t.notes ? ` (${t.notes})` : "";
      const displayDesc = descText + notesSuffix;
      const truncatedDesc = displayDesc.length > 40 ? displayDesc.substring(0, 37) + "..." : displayDesc;
      
      doc.setFont('Helvetica', 'bold');
      doc.text(truncatedDesc, margin + 35, y + 6);

      // Find category pretty label
      const catObj = EXPENSE_CATEGORIES.find(c => c.value === t.category) || INCOME_CATEGORIES.find(c => c.value === t.category);
      const catLabel = catObj ? catObj.label : t.category;
      doc.setFont('Helvetica', 'normal');
      doc.text(catLabel, margin + 110, y + 6);

      // Format transactions
      const isExpense = t.type === 'expense';
      const amountVal = (isExpense ? '-' : '+') + currencySymbol + t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
      
      doc.setFont('Helvetica', 'bold');
      if (isExpense) {
        doc.setTextColor(223, 93, 66); // Clay red
      } else {
        doc.setTextColor(16, 157, 100); // Emerald/Sage
      }
      doc.text(amountVal, pageWidth - margin - 4, y + 6, { align: 'right' });

      // Add border outline line
      doc.setDrawColor(235, 243, 240);
      doc.setLineWidth(0.15);
      doc.line(margin, y + 9.5, pageWidth - margin, y + 9.5);

      y += 9.5;
      altRow = !altRow;
    });
  }

  // Draw Page Count footers on all pages
  const totalPageCount = doc.getNumberOfPages();
  for (let i = 1; i <= totalPageCount; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    
    // Bottom border split
    doc.setDrawColor(223, 237, 232);
    doc.setLineWidth(0.35);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.text('Flowse Local Treasury Ledger · Offline Crypt Privacy guaranteed', margin, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  }

  // Save the PDF locally
  const cleanName = profile.name.toLowerCase().replace(/\s+/g, '_');
  doc.save(`flowse_${cleanName}_statement_${Date.now().toString().slice(-6)}.pdf`);
}
