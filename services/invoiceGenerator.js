import { jsPDF } from "jspdf";

/**
 * Generates and downloads a PDF invoice for a given order.
 * @param {Object} order - The order object containing all details.
 */
export const generateInvoice = (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper for drawing horizontal lines
  const drawLine = (y) => {
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(123, 29, 205); // Primary color
  doc.text("VoltPC", margin, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("ENGINEERING THE APEX", margin, yPos + 6);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin - 40, yPos + 5);
  
  yPos += 25;
  drawLine(yPos);
  yPos += 15;

  // --- Order Info ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER DETAILS", margin, yPos);
  doc.text("CUSTOMER DETAILS", margin + 90, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  const orderId = order.orderId || order.id || "N/A";
  const orderDate = order.date || new Date().toLocaleDateString();
  const orderStatus = order.status || "N/A";

  doc.text(`ID: ${orderId}`, margin, yPos);
  doc.text(`Date: ${orderDate}`, margin, yPos + 6);
  doc.text(`Status: ${orderStatus}`, margin, yPos + 12);

  // Customer info
  doc.text(`Name: ${order.customerName || "N/A"}`, margin + 90, yPos);
  doc.text(`Email: ${order.email || "N/A"}`, margin + 90, yPos + 6);
  doc.text(`Contact: ${order.contact || "N/A"}`, margin + 90, yPos + 12);
  
  // Address can be multi-line
  const addressLines = doc.splitTextToSize(`Address: ${order.address || "N/A"}`, 80);
  doc.text(addressLines, margin + 90, yPos + 18);

  yPos += 35;
  drawLine(yPos);
  yPos += 15;

  // --- Items Table Header ---
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ITEM DESCRIPTION", margin, yPos);
  doc.text("CATEGORY", margin + 100, yPos);
  doc.text("PRICE", pageWidth - margin - 20, yPos, { align: "right" });

  yPos += 8;
  drawLine(yPos);
  yPos += 10;

  // --- Items ---
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  (order.items || []).forEach((item) => {
    // Check if we need a new page
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    const itemName = item.name || "Unknown Item";
    const itemCategory = item.category || "General";
    const itemPrice = typeof item.price === 'number' ? `INR ${item.price.toLocaleString()}` : item.price;

    doc.text(itemName, margin, yPos);
    doc.text(itemCategory, margin + 100, yPos);
    doc.text(itemPrice.toString(), pageWidth - margin - 20, yPos, { align: "right" });
    
    yPos += 10;
  });

  yPos += 5;
  drawLine(yPos);
  yPos += 15;

  // --- Total ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  const total = typeof order.total === 'number' ? `INR ${order.total.toLocaleString()}` : order.total;
  doc.text(`TOTAL AMOUNT: ${total}`, pageWidth - margin - 20, yPos, { align: "right" });

  // --- Footer ---
  yPos = 280;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing VoltPC Engineering. Your high-performance journey begins here.", pageWidth / 2, yPos, { align: "center" });
  doc.text("This is a computer-generated invoice and does not require a physical signature.", pageWidth / 2, yPos + 4, { align: "center" });

  // --- Save File ---
  doc.save(`Invoice-${orderId}.pdf`);
};
