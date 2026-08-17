import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPdf(element, filename = "export.pdf", title = "") {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  const pageWidthMm = 210; // fixed A4 width so it prints/shares predictably
  const marginMm = 10;
  const titleHeightMm = title ? 14 : 0;
  const contentWidthMm = pageWidthMm - marginMm * 2;

  const pxToMm = contentWidthMm / canvas.width;
  const contentHeightMm = canvas.height * pxToMm;

  // Page height grows with content — no fixed A4 height, no pagination logic needed
  const pageHeightMm = contentHeightMm + marginMm * 2 + titleHeightMm;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pageWidthMm, pageHeightMm],
  });

  if (title) {
    pdf.setFontSize(16);
    pdf.text(title, marginMm, marginMm + 6);
  }

  pdf.addImage(
    imgData,
    "PNG",
    marginMm,
    marginMm + titleHeightMm,
    contentWidthMm,
    contentHeightMm
  );

  pdf.save(filename);
}