import { exportToCsv } from "../../utilities/exportCsv";
import { exportToPdf } from "../../utilities/exportPdf";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { Tooltip } from "bootstrap";

export default function ExportButtons({
  csvData,
  csvFilename,
  pdfRef,
  pdfFilename,
  pdfTitle,
}) {
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const tooltipElements = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );

    const tooltips = [...tooltipElements].map(
      (element) => new Tooltip(element)
    );

    return () => {
      tooltips.forEach((tooltip) => tooltip.dispose());
    };
  }, [exportingPdf]);

  const handleCsv = () => {
    if (!csvData || csvData.length === 0) return;

    exportToCsv(csvData, csvFilename);
  };

  const handlePdf = async () => {
    if (!pdfRef?.current) return;

    setExportingPdf(true);

    try {
      await exportToPdf(
        pdfRef.current,
        pdfFilename,
        pdfTitle
      );
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="d-flex gap-2 mb-3">

      {/* CSV */}
      <button
        type="button"
        className="btn-action"
        onClick={handleCsv}
        disabled={!csvData || csvData.length === 0}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="Download data as CSV"
      >
        <FaDownload size={13} />
        <span>CSV</span>
      </button>

      {/* PDF */}
      <button
        type="button"
        className="btn-action"
        onClick={handlePdf}
        disabled={exportingPdf}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title={
          exportingPdf
            ? "Generating PDF..."
            : "Download report as PDF"
        }
      >
        {exportingPdf ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            <span>Generating…</span>
          </>
        ) : (
          <>
            <FaDownload size={13} />
            <span>PDF</span>
          </>
        )}
      </button>

    </div>
  );
}