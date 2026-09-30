import React from 'react';
import { Car, ArrowRight, RefreshCw } from 'lucide-react';

export function DemoPanel({
  onCarArrives,
  onCarLeaves,
  isAutoCycle,
  onToggleAutoCycle
}) {
  return (
    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-sm animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider">
              Demo Simulation Active
            </span>
            <span className="text-xs font-bold text-amber-800">
              (No physical hardware required)
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium mt-1">
            Simulate vehicle arrival and departure events in real-time without physical hardware:
          </p>
        </div>

        {/* Quick Action Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCarArrives}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Simulate Car Arrival (Parked)</span>
          </button>

          <button
            onClick={onCarLeaves}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Simulate Car Departure (Vacant)</span>
          </button>

          <button
            onClick={onToggleAutoCycle}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isAutoCycle
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoCycle ? 'animate-spin' : ''}`} />
            <span>{isAutoCycle ? 'Stop Traffic Cycle' : 'Auto Traffic Cycle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
