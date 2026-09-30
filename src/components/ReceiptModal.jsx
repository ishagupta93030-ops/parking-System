import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

export function ReceiptModal({ isOpen, record, onClose }) {
  if (!isOpen || !record) return null;

  // Generate deterministic crisp SVG QR code matrix (21x21)
  const size = 21;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          grid[r + i][c + j] = 1;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) {
      grid[6][i] = 1;
      grid[i][6] = 1;
    }
  }

  let hash = 0;
  const str = `${record.ticketId}-${record.plate}-${record.totalAmount}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
      const seed = Math.abs(Math.sin((r * 21 + c + hash) * 1.5) * 10000);
      grid[r][c] = (Math.floor(seed) % 2 === 0) ? 1 : 0;
    }
  }

  const cellSize = 6;
  const svgSize = size * cellSize;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="printable-receipt-modal"
        className="bg-white border border-slate-300 rounded-2xl max-w-sm w-full shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Receipt Header */}
        <div className="text-center pb-3 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 font-black text-slate-900 text-base">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            PARKSENSE DIGITAL RECEIPT
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-0.5">
            Official Parking Tax Invoice • IoT Gate Pass
          </p>
        </div>

        {/* Invoice Metadata */}
        <div className="py-4 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Ticket ID:</span>
            <strong className="font-mono text-slate-900 font-bold">{record.ticketId}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Car Plate:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-black text-slate-900 border border-slate-300">
              {record.plate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Bay Location:</span>
            <strong className="font-bold text-blue-700">{record.bay}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Entry Time:</span>
            <span className="font-mono text-xs">{record.entryTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Exit Time:</span>
            <span className="font-mono text-xs">{record.exitTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Total Duration:</span>
            <strong className="font-mono text-slate-900">{record.duration}</strong>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="my-2 border-b-2 border-dashed border-slate-300" />

        {/* Pricing Breakdown */}
        <div className="py-2 space-y-1 text-sm text-slate-700">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Parking Base Fare:</span>
            <span className="font-mono font-bold">₹ {record.baseFare}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">CGST + SGST (5%):</span>
            <span className="font-mono text-slate-600">₹ {record.tax}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <span className="font-extrabold text-slate-900 text-sm">TOTAL AMOUNT PAID:</span>
            <span className="font-mono text-xl font-black text-emerald-700">
              ₹ {record.totalAmount}
            </span>
          </div>
        </div>

        {/* SVG Dynamic QR Code Pass */}
        <div className="pt-3 pb-1 flex flex-col items-center justify-center gap-1.5 border-t border-slate-200">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#ffffff" rx="4" />
              {grid.map((row, r) =>
                row.map((cell, c) =>
                  cell === 1 ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="#0f172a"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Verified IoT Gate Pass
          </span>
        </div>

        {/* Actions (Hidden during print) */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
