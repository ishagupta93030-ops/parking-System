import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, X } from 'lucide-react';

export function TerminalDrawer({
  isOpen,
  lines,
  onClear,
  onClose,
  autoScroll,
  onToggleAutoScroll
}) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoScroll]);

  if (!isOpen) return null;

  return (
    <div className="card-panel overflow-hidden border-slate-800 bg-slate-950 text-white shadow-xl animate-in slide-in-from-bottom duration-200">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-slate-200">
            Arduino Web Serial Stream Terminal (9600 Baud)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => onToggleAutoScroll(e.target.checked)}
              className="accent-blue-500 cursor-pointer"
            />
            <span>Auto-Scroll</span>
          </label>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Close Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div className="p-4 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto space-y-1">
        {lines.length === 0 ? (
          <div className="text-slate-500 italic py-2">
            No serial packets received yet. Connect Arduino or enable Demo Mode to view real-time data packets.
          </div>
        ) : (
          lines.map((l, i) => {
            let color = 'text-slate-300';
            if (l.text.includes('OCCUPIED')) color = 'text-rose-400 font-bold';
            else if (l.text.includes('VACANT')) color = 'text-emerald-400 font-bold';
            else if (l.text.includes('[CMD]') || l.text.includes('[Serial Sent]')) color = 'text-cyan-300 font-bold';
            else if (l.type === 'error' || l.text.includes('Error')) color = 'text-red-400 font-bold';
            else if (l.text.includes('Distance:')) color = 'text-blue-300';

            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0 select-none">[{l.time}]</span>
                <span className={color}>{l.text}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
