import React from 'react';
import { ClipboardList, Download, Trash2, Eye } from 'lucide-react';

export function AuditTable({ records, onExportCsv, onClearRecords, onViewReceipt }) {
  return (
    <section className="card-panel p-5 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Recent Parking Audit Receipts & Sessions
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Full record of parked vehicles, parking durations, and calculated charges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            disabled={records.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={onClearRecords}
            disabled={records.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear List</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Car Plate</th>
              <th className="px-4 py-3">Bay #</th>
              <th className="px-4 py-3">Entry Time</th>
              <th className="px-4 py-3">Exit Time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Total Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {records.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-sans">
                  No parking sessions recorded yet. Park your car in any green bay to generate an invoice.
                </td>
              </tr>
            ) : (
              records.map((rec, idx) => (
                <tr key={rec.ticketId || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-blue-700">{rec.ticketId}</td>
                  <td className="px-4 py-2.5 font-extrabold text-slate-900 bg-slate-100/60 rounded">
                    {rec.plate}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 font-sans font-semibold">{rec.bay}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{rec.entryTime}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{rec.exitTime}</td>
                  <td className="px-4 py-2.5 text-slate-800 font-bold">{rec.duration}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700">₹ {rec.totalAmount}</td>
                  <td className="px-4 py-2.5 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      PAID
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-sans">
                    <button
                      onClick={() => onViewReceipt(rec)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>View Slip</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
