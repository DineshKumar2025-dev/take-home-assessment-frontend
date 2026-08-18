import { exportToCsv } from "../utilities/exportCsv";
import { exportToPdf } from "../utilities/exportPdf";
import { useState } from "react";

export default function ExportButtons({ csvData, csvFilename, pdfRef, pdfFilename, pdfTitle }) {
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleCsv = () => {
    if (!csvData || csvData.length === 0) return;
    exportToCsv(csvData, csvFilename);
  };

  const handlePdf = async () => {
    if (!pdfRef?.current) return;
    setExportingPdf(true);
    try {
      await exportToPdf(pdfRef.current, pdfFilename, pdfTitle);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="d-flex gap-2 mb-3">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={handleCsv}
        disabled={!csvData || csvData.length === 0}
      >
        ⬇ CSV
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={handlePdf}
        disabled={exportingPdf}
      >
        {exportingPdf ? "Generating…" : "⬇ PDF"}
      </button>
    </div>
  );
}