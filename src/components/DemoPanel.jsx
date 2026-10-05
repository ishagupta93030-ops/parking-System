import React from 'react';
import { Car, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export function DemoPanel({
  onCarArrives,
  onCarLeaves,
  isAutoCycle,
  onToggleAutoCycle,
  isSimFault = false,
  onToggleSimFault
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
            Simulate vehicle arrival, departure, and sensor fault events in real-time:
          </p>
        </div>

        {/* Quick Action Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCarArrives}
            disabled={isSimFault}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Simulate Car Arrival (Parked)</span>
          </button>

          <button
            onClick={onCarLeaves}
            disabled={isSimFault}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Simulate Car Departure (Vacant)</span>
          </button>

          <button
            onClick={onToggleAutoCycle}
            disabled={isSimFault}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 ${
              isAutoCycle
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoCycle ? 'animate-spin' : ''}`} />
            <span>{isAutoCycle ? 'Stop Traffic Cycle' : 'Auto Traffic Cycle'}</span>
          </button>

          {/* SENSOR FAULT SIMULATION TOGGLE */}
          <button
            onClick={onToggleSimFault}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isSimFault
                ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                : 'bg-amber-100/80 hover:bg-amber-200 text-amber-950 border-amber-300'
            }`}
            title="Simulate HC-SR04 ultrasonic sensor timeout / cable disconnection"
          >
            {isSimFault ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Clear Sensor Fault</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                <span>Simulate Sensor Fault</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
