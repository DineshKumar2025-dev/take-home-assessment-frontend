import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPdf(
  element,
  filename = "export.pdf",
  title = ""
) {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",

    // Capture the complete element, not just the visible viewport
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 dimensions in mm
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  const MARGIN = 10;

  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

  const TITLE_HEIGHT = title ? 12 : 0;

  const usableHeight = CONTENT_HEIGHT - TITLE_HEIGHT;

  // Keep aspect ratio
  const imageRatio = canvas.height / canvas.width;

  let imageWidth = CONTENT_WIDTH;
  let imageHeight = imageWidth * imageRatio;

  // If the content doesn't fit vertically,
  // we will split it across multiple A4 pages.
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --------------------------------------------------
  // CASE 1: Content fits inside one A4 page
  // --------------------------------------------------

  if (imageHeight <= usableHeight) {
    if (title) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");

      pdf.text(
        title,
        MARGIN,
        MARGIN + 6
      );
    }

    pdf.addImage(
      imgData,
      "PNG",
      MARGIN,
      MARGIN + TITLE_HEIGHT,
      imageWidth,
      imageHeight
    );

    pdf.save(filename);
    return;
  }

  // --------------------------------------------------
  // CASE 2: Content is taller than A4
  // Split into multiple A4 pages
  // --------------------------------------------------

  const pxPerMm = canvas.width / CONTENT_WIDTH;

  const pageContentHeightPx =
    usableHeight * pxPerMm;

  let sourceY = 0;
  let pageNumber = 0;

  while (sourceY < canvas.height) {
    if (pageNumber > 0) {
      pdf.addPage("a4", "portrait");
    }

    // Create a temporary canvas for this page
    const pageCanvas = document.createElement("canvas");

    pageCanvas.width = canvas.width;

    const remainingHeight =
      canvas.height - sourceY;

    pageCanvas.height = Math.min(
      pageContentHeightPx,
      remainingHeight
    );

    const ctx = pageCanvas.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      pageCanvas.width,
      pageCanvas.height
    );

    // Copy part of the original canvas
    ctx.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      pageCanvas.height,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height
    );

    const pageImgData =
      pageCanvas.toDataURL("image/png");

    const pageImageHeight =
      pageCanvas.height / pxPerMm;

    // Add title only to first page
    if (pageNumber === 0 && title) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");

      pdf.text(
        title,
        MARGIN,
        MARGIN + 6
      );
    }

    pdf.addImage(
      pageImgData,
      "PNG",
      MARGIN,
      MARGIN + (pageNumber === 0 ? TITLE_HEIGHT : 0),
      CONTENT_WIDTH,
      pageImageHeight
    );

    sourceY += pageCanvas.height;
    pageNumber++;
  }

  pdf.save(filename);
}