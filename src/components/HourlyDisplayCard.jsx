import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Clock, 
  Hourglass, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  FastForward,
  Cpu
} from 'lucide-react';

export function HourlyDisplayCard({
  status,
  statusSince,
  billingRate = 30.0,
  distance = 18.0,
  availableSpaces = 2,
  totalSpaces = 3,
  onSimulateAdvanceHour
}) {
  const isOccupied = status === 'OCCUPIED';

  // Track elapsed parking time
  const [elapsedSec, setElapsedSec] = useState(0);
  const [simulatedOffsetSec, setSimulatedOffsetSec] = useState(0);
  const [hourlyAlert, setHourlyAlert] = useState(null);
  const [displayToggle, setDisplayToggle] = useState(0);

  // Cycle LCD secondary screen every 3.5s when vacant
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayToggle(prev => (prev + 1) % 2);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Reset simulated offset when status becomes vacant
  useEffect(() => {
    if (!isOccupied) {
      setSimulatedOffsetSec(0);
      setHourlyAlert(null);
    }
  }, [isOccupied]);

  // Compute live elapsed seconds
  useEffect(() => {
    if (!isOccupied) {
      setElapsedSec(0);
      return;
    }

    const interval = setInterval(() => {
      const realSec = Math.max(0, Math.floor((Date.now() - statusSince) / 1000));
      const totalSec = realSec + simulatedOffsetSec;
      setElapsedSec(totalSec);

      // Check hour milestone
      const currentHour = Math.floor(totalSec / 3600);
      const minutesIntoHour = Math.floor((totalSec % 3600) / 60);
      const secondsIntoHour = totalSec % 60;

      // Show hourly alert if we just entered a new hour (first 6 seconds of hour >= 1)
      if (currentHour >= 1 && minutesIntoHour === 0 && secondsIntoHour <= 6) {
        setHourlyAlert({
          hour: currentHour,
          fee: (currentHour + 1) * billingRate
        });
      } else if (hourlyAlert && (minutesIntoHour > 0 || secondsIntoHour > 6)) {
        setHourlyAlert(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOccupied, statusSince, simulatedOffsetSec, hourlyAlert, billingRate]);

  // Derived time calculations
  const hours = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);
  const secs = elapsedSec % 60;

  // Minutes into current hour (0-59)
  const currentHourProgressSec = elapsedSec % 3600;
  const progressPercent = Math.min(100, Math.round((currentHourProgressSec / 3600) * 100));
  const remainingSecInHour = 3600 - currentHourProgressSec;
  const remainingMins = Math.floor(remainingSecInHour / 60);
  const remainingSecs = remainingSecInHour % 60;

  // Current billed hours & fee
  const billedHours = isOccupied ? hours + 1 : 0;
  const currentFee = billedHours * billingRate;

  // Quick simulation helper
  const handleAdvanceOneHour = () => {
    const newOffset = simulatedOffsetSec + 3600;
    setSimulatedOffsetSec(newOffset);
    const newTotal = elapsedSec + 3600;
    const newH = Math.floor(newTotal / 3600);
    setHourlyAlert({
      hour: newH,
      fee: (newH + 1) * billingRate
    });
    setTimeout(() => setHourlyAlert(null), 5000);
    if (onSimulateAdvanceHour) onSimulateAdvanceHour(3600);
  };

  // Generate 16-character rows matching Arduino LCD output
  let lcdLine1 = 'PARKSENSE: OPEN ';
  let lcdLine2 = `SPOTS AVAIL: ${availableSpaces}/${totalSpaces} `.slice(0, 16).padEnd(16, ' ');

  if (availableSpaces === 0 && !isOccupied) {
    lcdLine1 = 'PARKSENSE: FULL ';
    lcdLine2 = 'NO SPOTS AVAIL  ';
  } else if (!isOccupied && displayToggle === 1) {
    lcdLine1 = `FREE SPOTS: ${availableSpaces} OF ${totalSpaces}`.slice(0, 16).padEnd(16, ' ');
    lcdLine2 = `BAY 01: Rs.${billingRate.toFixed(0)}/Hr`.slice(0, 16).padEnd(16, ' ');
  }

  if (isOccupied) {
    if (hourlyAlert) {
      lcdLine1 = `** ${hourlyAlert.hour} HR REACHED **`.slice(0, 16).padEnd(16, ' ');
      lcdLine2 = `Fee: Rs.${hourlyAlert.fee.toFixed(0)}/hr  `.slice(0, 16);
    } else {
      const hStr = hours.toString().padStart(2, '0');
      const mStr = mins.toString().padStart(2, '0');
      lcdLine1 = `PARKED: ${hStr}h ${mStr}m `.slice(0, 16).padEnd(16, ' ');
      const distStr = distance ? `${distance.toFixed(1)}cm` : '10.0cm';
      lcdLine2 = `Fee:Rs.${currentFee.toFixed(0)} AVL:${availableSpaces}`.slice(0, 16).padEnd(16, ' ');
    }
  }

  return (
    <div className="card-panel p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border-slate-700 shadow-xl overflow-hidden relative">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                HARDWARE 16x2 I2C LCD SYNC
              </span>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Pin A4 (SDA) • A5 (SCL)
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
              Live Hourly Display & Tariff Counter
            </h3>
          </div>
        </div>

        {/* Quick Simulation Button */}
        {isOccupied && (
          <button
            onClick={handleAdvanceOneHour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:text-white"
            title="Fast forward 1 hour in simulation to see the hourly milestone banner"
          >
            <FastForward className="w-3.5 h-3.5 text-blue-300" />
            <span>Simulate +1 Hour Advance</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 relative z-10">
        {/* LEFT COLUMN: Realistic 16x2 I2C Character LCD Screen */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Physical Arduino LCD Screen Preview
            </span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Address: 0x27 • 16x2
            </span>
          </div>

          {/* LCD Bezel & Screen Chassis */}
          <div className="p-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 shadow-inner">
            <div className="bg-[#1a3826] border-2 border-[#2b593d] rounded-lg p-3 shadow-inner relative overflow-hidden">
              {/* Subtle LCD glass grid overlay effect */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#58d68d 1px, transparent 1px)',
                  backgroundSize: '4px 4px'
                }}
              ></div>

              {/* LCD Dot Matrix Character Output */}
              <div className="font-mono font-bold text-lg md:text-xl tracking-[0.16em] text-[#52f08a] drop-shadow-[0_0_8px_rgba(82,240,138,0.6)] select-none space-y-1">
                <div className="whitespace-pre overflow-hidden h-7 flex items-center">
                  {lcdLine1}
                </div>
                <div className="whitespace-pre overflow-hidden h-7 flex items-center">
                  {lcdLine2}
                </div>
              </div>

              {/* LCD Status Corner Tag */}
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#2b593d]/50 text-[9px] font-mono text-[#52f08a]/70">
                <span>HD44780 + PCF8574</span>
                <span className="uppercase">
                  {hourlyAlert ? '🚨 HOURLY ALERT' : isOccupied ? '● OCCUPIED (LIVE)' : `○ ${availableSpaces}/${totalSpaces} SPOTS FREE`}
                </span>
              </div>
            </div>
          </div>

          {/* Help tip below LCD */}
          <p className="text-[11px] text-slate-400 mt-2">
            {isOccupied
              ? `Every hour completed displays a special milestone banner and sounds a reminder chime for the vehicle.`
              : `${availableSpaces} of ${totalSpaces} parking spaces currently available. LCD displays live vacancy & hourly tariff.`}
          </p>
        </div>

        {/* RIGHT COLUMN: Hourly Breakdown & Next-Hour Progress Bar */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Top Status & Active Tier */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Metric 1: Live Available Spaces */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Available Spaces
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {availableSpaces}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  /{totalSpaces}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-300 truncate">
                {availableSpaces > 0 ? `${availableSpaces} spots free` : 'Lot 100% full'}
              </span>
            </div>

            {/* Metric 2: Current Parked Time */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Parked Time</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-emerald-400">
                  {isOccupied ? `${hours}h ${mins}m` : '00h 00m'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                {isOccupied ? `Hour #${billedHours}` : 'Bay Vacant'}
              </span>
            </div>

            {/* Metric 3: Total Hourly Fee */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fee</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono text-blue-400">
                  ₹{isOccupied ? currentFee.toFixed(0) : '0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                ₹{billingRate.toFixed(0)}/hr rate
              </span>
            </div>
          </div>

          {/* Hour Progress Bar */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                Progression to Next Hour (#{hours + 2})
              </span>
              <span className="font-mono font-bold text-amber-300">
                {isOccupied ? `${progressPercent}%` : '0%'}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent > 85
                    ? 'bg-rose-500'
                    : progressPercent > 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${isOccupied ? progressPercent : 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{isOccupied ? `${mins}m ${secs}s elapsed in current hour` : 'Awaiting vehicle'}</span>
              <span>
                {isOccupied ? `Next +₹${billingRate} in ${remainingMins}m ${remainingSecs}s` : 'Rate: ₹30/hr'}
              </span>
            </div>
          </div>

          {/* Quick Hourly Schedule Milestone Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Milestones:</span>
            {[1, 2, 3, 4].map((h) => {
              const active = isOccupied && hours >= h;
              const current = isOccupied && hours === h - 1;
              return (
                <div
                  key={h}
                  className={`px-2.5 py-1 rounded-md border text-center shrink-0 font-mono transition-all ${
                    active
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : current
                      ? 'bg-blue-900/60 border-blue-400 text-blue-200 font-bold animate-pulse'
                      : 'bg-slate-900/40 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <span>{h}h: ₹{(h * billingRate).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
