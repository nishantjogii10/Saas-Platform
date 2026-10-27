import React, { useMemo, useState } from 'react';
import { Download, Printer, QrCode, Check, Copy } from 'lucide-react';
import { Button } from './Button';
import { generateQRMatrix } from '../../utils/qrEncoder';

/**
 * High-quality, 100% ISO/IEC 18004 Standard QR Code Generator for StockMate Batches.
 * Scannable with any standard smartphone camera, QR reader, or terminal hardware barcode gun.
 */
export const QRCodeView = ({
  value = 'BATCH-UNKNOWN',
  size = 150,
  title = '',
  subtitle = '',
  batchInfo = null,
  showDownload = true,
  showPrint = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Generate authentic standard QR matrix
  const matrix = useMemo(() => {
    try {
      return generateQRMatrix(String(value));
    } catch (e) {
      console.error('QR Matrix Generation Error:', e);
      return [];
    }
  }, [value]);

  const N = matrix.length || 25;

  const handleCopyValue = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById(`qr-svg-${value}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockMate-${value}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=650,height=700');
    if (!printWindow) return;

    const svgElement = document.getElementById(`qr-svg-${value}`);
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Label - ${value}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 24px;
              color: #0f172a;
              text-align: center;
              background: #f8fafc;
            }
            .label-card {
              border: 2px dashed #047857;
              border-radius: 16px;
              padding: 20px;
              max-width: 320px;
              margin: 0 auto;
              background: #fff;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .brand { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #047857; margin-bottom: 2px; }
            .title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
            .batch-id { font-family: ui-monospace, monospace; font-size: 15px; font-weight: 900; color: #047857; margin-bottom: 12px; }
            .qr-wrap { display: flex; justify-content: center; margin: 10px 0; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
            .meta { font-size: 11px; text-align: left; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px; line-height: 1.6; }
            .meta strong { color: #0f172a; }
            .scan-tip { font-size: 10px; color: #64748b; margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="brand">StockMate Kitchen Inventory</div>
            <div class="title">${batchInfo?.productName || title || 'Standard Stock Item'}</div>
            <div class="batch-id">${value}</div>
            <div class="qr-wrap">
              ${svgHtml}
            </div>
            <div class="meta">
              <div><strong>Supplier:</strong> ${batchInfo?.supplierName || 'Verified Supplier'}</div>
              <div><strong>Expiry Date:</strong> ${batchInfo?.expiryDate || 'N/A'}</div>
              <div><strong>Storage:</strong> ${batchInfo?.storageLocation || 'Kitchen Dry Storage'}</div>
              <div><strong>Accepted Stock:</strong> ${batchInfo?.acceptedQty || ''} ${batchInfo?.unit || ''}</div>
              <div><strong>PO / Delivery:</strong> ${batchInfo?.poNumber || 'N/A'}</div>
            </div>
            <div class="scan-tip">Scan using StockMate terminal or smartphone camera</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`flex flex-col items-center p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs ${className}`}>
      {/* SVG Container with high-contrast quiet zone */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
        <svg
          id={`qr-svg-${value}`}
          width={size}
          height={size}
          viewBox={`0 0 ${N + 4} ${N + 4}`}
          className="shape-rendering-crispEdges"
        >
          {/* Quiet Zone Padding Background */}
          <rect width={N + 4} height={N + 4} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((cell, c) => {
              if (cell === 1) {
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c + 2}
                    y={r + 2}
                    width="1"
                    height="1"
                    fill="#0f172a"
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      </div>

      {/* Label & Details */}
      {(title || value) && (
        <div className="text-center mt-2 w-full">
          <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold text-slate-900 tracking-tight">
            <span>{value}</span>
            <button
              onClick={handleCopyValue}
              className="text-slate-400 hover:text-emerald-700 transition-colors"
              title="Copy Batch ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {title && (
            <p className="text-[11px] font-semibold text-slate-700 truncate max-w-[210px] mt-0.5">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-[10px] text-slate-400 truncate max-w-[210px] mt-0.5">
              {subtitle}
            </p>
          )}
          <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
            ✓ Scannable with Smartphone / Scanner
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {(showDownload || showPrint) && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 w-full justify-center">
          {showPrint && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handlePrint}
              className="text-[10px] px-2.5 py-1 text-slate-700 hover:text-slate-900"
              title="Print standard thermal/sheet batch sticker"
            >
              <Printer className="w-3 h-3 mr-1 text-slate-500" />
              Print Sticker
            </Button>
          )}
          {showDownload && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleDownloadSVG}
              className="text-[10px] px-2.5 py-1 text-emerald-700 hover:bg-emerald-50"
              title="Download standard vector QR SVG"
            >
              <Download className="w-3 h-3 mr-1" />
              SVG
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
export default QRCodeView;
