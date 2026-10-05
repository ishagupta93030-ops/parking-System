import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  AlertTriangle,
  Car, 
  Receipt, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Shuffle,
  Activity,
  Sliders
} from 'lucide-react';

export function MetricsCards({
  status,
  statusDuration,
  billingRate,
  fastDemoRate,
  onToggleFastRate,
  runningFare,
  currentPlate,
  onRandomizePlate,
  totalSessionRevenue,
  slots = [],
  sensorHealth = 'HEALTHY',
  threshold = 10.0
}) {
  const isFault = status === 'SENSOR_ERROR' || sensorHealth === 'FAULT';
  const isOccupied = !isFault && status === 'OCCUPIED';
  const isVacant = !isFault && status === 'VACANT';

  const vacantCount = slots.filter(s => s.status === 'VACANT').length;
  const occupiedCount = slots.filter(s => s.status === 'OCCUPIED').length;
  const errorCount = slots.filter(s => s.status === 'SENSOR_ERROR').length;
  const totalSlots = slots.length || 3;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. SMART SENSOR BAY STATUS CARD (WITH FAULT & THRESHOLD METRICS) */}
      <div className={`card-panel status-card ${
        isFault ? 'no_reading border-2 border-amber-500 bg-amber-50/50' : isOccupied ? 'occupied' : isVacant ? 'vacant' : 'no_reading'
      } p-6 flex items-center justify-between relative overflow-hidden`}>
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isFault
              ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
              : isOccupied 
              ? 'bg-rose-500 text-white shadow-rose-500/30' 
              : isVacant 
              ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
              : 'bg-slate-300 text-slate-600'
          }`}>
            {isFault ? (
              <AlertTriangle className="w-9 h-9 stroke-[2.5]" />
            ) : isOccupied ? (
              <AlertCircle className="w-9 h-9 stroke-[2.5]" />
            ) : isVacant ? (
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            ) : (
              <HelpCircle className="w-9 h-9 stroke-[2.5]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                SMART BAY 01
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                isFault 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isFault ? 'SENSOR FAULT' : 'SENSOR OK'}
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Thresh: {parseFloat(threshold).toFixed(1)}cm
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-0.5">
              {isFault 
                ? 'SENSOR OFFLINE' 
                : isOccupied 
                ? 'CAR PARKED' 
                : isVacant 
                ? 'FREE TO PARK' 
                : 'AWAITING READ'}
            </h2>

            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {isFault
                ? 'Invalid/timeout reading detected (Safety lock engaged)'
                : isOccupied 
                ? 'Vehicle parked in Bay 01' 
                : isVacant 
                ? 'Slot available for parking' 
                : 'Slot available for parking'}
            </p>
          </div>
        </div>

        {/* State Duration Timer */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {isFault ? 'Status Alert:' : 'Duration:'}
          </span>
          <span className={`font-mono text-sm font-extrabold px-2 py-0.5 rounded border shadow-2xs ${
            isFault ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white/80 text-slate-800 border-slate-200'
          }`}>
            {isFault ? 'OFFLINE' : statusDuration}
          </span>
        </div>
      </div>

      {/* 2. 3-BAY PARKING OCCUPANCY & CAPACITY (Shows Fault if sensor offline) */}
      <div className="card-panel p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-blue-600" />
            3-BAY PARKING STATUS
          </span>
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border tracking-wide uppercase ${
            errorCount > 0 
              ? 'bg-amber-50 text-amber-800 border-amber-300' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            {errorCount > 0 ? `${errorCount} Fault Detected` : `${vacantCount} of ${totalSlots} Free`}
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-slate-900">
            {vacantCount}
          </span>
          <span className="text-slate-500 font-extrabold text-lg">/ {totalSlots}</span>
          <span className="text-xs font-bold text-slate-500 ml-1">
            Free Bays
          </span>
          <span className="text-xs font-bold text-slate-400 ml-auto">
            {occupiedCount} Occupied {errorCount > 0 ? `(${errorCount} Err)` : ''}
          </span>
        </div>

        {/* Live 3-Bay Badges */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          {slots.map(s => {
            const hasErr = s.status === 'SENSOR_ERROR' || s.sensorHealth === 'FAULT';
            const occ = !hasErr && s.status === 'OCCUPIED';
            return (
              <div
                key={s.id}
                className={`py-1.5 px-2 rounded-lg border text-center flex flex-col items-center justify-center transition-all ${
                  hasErr
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : occ
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block">
                  {s.name || s.id}
                </span>
                <span className="font-extrabold text-[11px] block mt-0.5">
                  {hasErr ? '⚠️ FAULT' : occ ? '🔴 TAKEN' : '🟢 FREE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LIVE BILLING & FARE CALCULATOR */}
      <div className="card-panel p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            LIVE BILLING & TARIFF
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              1-Hr: ₹30.00
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {fastDemoRate ? 'Demo: ₹0.50/s' : `₹${billingRate}/hr`}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between my-2">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Current Meter:</span>
            <span className="text-3xl md:text-4xl font-black font-mono text-blue-700">
              ₹ {runningFare.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold block">Vehicle Plate:</span>
            <button
              onClick={onRandomizePlate}
              className="inline-flex items-center gap-1 font-mono text-xs font-black text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer mt-0.5"
              title="Click to randomize plate"
            >
              <span>{currentPlate}</span>
              <Shuffle className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span>
            Total Revenue: <strong className="text-emerald-700 font-bold font-mono">₹ {totalSessionRevenue.toFixed(2)}</strong>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 text-xs font-semibold select-none">
            <input 
              type="checkbox" 
              checked={fastDemoRate} 
              onChange={(e) => onToggleFastRate(e.target.checked)}
              className="accent-blue-600 cursor-pointer"
            />
            <span>Fast Rate for Demo</span>
          </label>
        </div>
      </div>
    </section>
  );
}
