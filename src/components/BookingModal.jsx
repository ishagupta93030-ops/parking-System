import React, { useState, useEffect } from 'react';
import { X, Car, Check } from 'lucide-react';

export function BookingModal({
  isOpen,
  targetSlot,
  initialPlate,
  onClose,
  onConfirm
}) {
  const [plate, setPlate] = useState(initialPlate || 'DL 01 AB 4589');

  useEffect(() => {
    if (initialPlate) setPlate(initialPlate);
  }, [initialPlate]);

  if (!isOpen || !targetSlot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(plate.trim().toUpperCase() || 'DL 01 AB 4589');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Park Vehicle in Bay
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-sm text-slate-700">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider block">
                Selected Spot
              </span>
              <strong className="text-lg font-black text-blue-900 font-mono">
                {targetSlot.name}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider block">
                Floor
              </span>
              <span className="text-sm font-bold text-blue-900">
                {targetSlot.floorName}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="modal-plate" className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
              Vehicle License Plate Number
            </label>
            <input
              id="modal-plate"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-600 text-slate-900 font-mono font-extrabold text-base px-3.5 py-2.5 rounded-xl outline-none uppercase"
              placeholder="e.g. DL 01 AB 4589"
              autoFocus
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Yes, Park Here</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
