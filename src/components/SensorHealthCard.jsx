import React from 'react';
import { ShieldCheck, AlertTriangle, Wifi, WifiOff, Activity, Cpu, Sliders } from 'lucide-react';

export function SensorHealthCard({
  floors,
  selectedFloor = 'L1',
  sensorHealth = 'HEALTHY', // 'HEALTHY', 'FAULT', 'OFFLINE'
  distance = 18.0,
  isSimFault = false,
  onToggleSimFault
}) {
  const currentFloorSlots = floors[selectedFloor]?.slots || {};
  
  // Extract Bay 01, Bay 02, and Bay 03
  const bayKeys = [`${selectedFloor}-01`, `${selectedFloor}-02`, `${selectedFloor}-03`];
  
  const bays = bayKeys.map((key, idx) => {
    const slot = currentFloorSlots[key] || {
      id: key,
      name: `Bay 0${idx + 1}`,
      floor: selectedFloor,
      status: 'VACANT',
      threshold: 10.0,
      sensorHealth: 'HEALTHY'
    };

    // Bay 01 is the active IoT sensor bay linked to live telemetry / hardware
    const isBay01 = idx === 0;
    const isFaulty = isBay01 
      ? (isSimFault || sensorHealth === 'FAULT' || slot.sensorHealth === 'FAULT' || slot.status === 'SENSOR_ERROR')
      : (slot.sensorHealth === 'FAULT' || slot.status === 'SENSOR_ERROR');

    let sensorStatus = 'ONLINE';
    if (isFaulty) {
      sensorStatus = 'ERROR';
    } else if (slot.sensorHealth === 'OFFLINE') {
      sensorStatus = 'OFFLINE';
    }

    // Distance display
    let liveDistance = '—';
    if (isBay01) {
      liveDistance = isFaulty ? 'ERR (Timeout)' : `${typeof distance === 'number' ? distance.toFixed(1) : distance} cm`;
    } else {
      liveDistance = isFaulty ? 'ERR (No Echo)' : (slot.status === 'OCCUPIED' ? '6.8 cm' : '24.5 cm');
    }

    const bayThreshold = slot.threshold || 10.0;
    const lastUpdate = isFaulty ? 'Fault detected' : 'Just now';

    return {
      id: slot.id,
      name: slot.name || `Bay 0${idx + 1}`,
      floor: selectedFloor,
      sensorStatus,
      isFaulty,
      distance: liveDistance,
      threshold: `${bayThreshold.toFixed(1)} cm`,
      lastUpdate,
      isHardware: isBay01,
      occupancyStatus: slot.status
    };
  });

  return (
    <div className="card-panel p-5 bg-slate-900/90 text-slate-100 border border-slate-800 shadow-xl rounded-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Sensor Health & Fault Detection</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                Research Diagnostics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live status for Bay 01, Bay 02 & Bay 03. Abnormal, timeout, or disconnected readings enter safe SENSOR ERROR state.
            </p>
          </div>
        </div>

        {onToggleSimFault && (
          <button
            type="button"
            onClick={onToggleSimFault}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isSimFault
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimFault ? 'Clear Simulated Sensor Fault' : 'Simulate Sensor Fault'}</span>
          </button>
        )}
      </div>

      {/* Bay Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bays.map((bay) => {
          const isError = bay.sensorStatus === 'ERROR';
          const isOffline = bay.sensorStatus === 'OFFLINE';
          const isOnline = bay.sensorStatus === 'ONLINE';

          return (
            <div
              key={bay.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                isError
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20'
                  : isOffline
                  ? 'bg-slate-950/50 border-slate-800'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Bay Title & Sensor Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{bay.name}</span>
                  <span className="text-[10px] text-slate-400">({bay.id})</span>
                  {bay.isHardware && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      IoT Sensor
                    </span>
                  )}
                </div>

                {/* Sensor Badge */}
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isError
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                      : isOffline
                      ? 'bg-slate-700/50 text-slate-400 border-slate-600'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {isError && <AlertTriangle className="w-3 h-3 text-red-400" />}
                  {isOnline && <Wifi className="w-3 h-3 text-emerald-400" />}
                  {isOffline && <WifiOff className="w-3 h-3 text-slate-400" />}
                  <span>SENSOR: {bay.sensorStatus}</span>
                </span>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[11px] block">Distance:</span>
                  <span className={`font-mono font-bold ${isError ? 'text-amber-400' : 'text-slate-200'}`}>
                    {bay.distance}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Threshold:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {bay.threshold}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Last Update:</span>
                  <span className="text-slate-300 text-[11px]">{bay.lastUpdate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Parking State:</span>
                  {bay.isFaulty ? (
                    <span className="text-amber-400 font-black text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 inline-block">
                      ⚠️ SENSOR ERROR/OFFLINE
                    </span>
                  ) : (
                    <span
                      className={`font-black text-[11px] px-1.5 py-0.5 rounded border inline-block ${
                        bay.occupancyStatus === 'OCCUPIED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {bay.occupancyStatus === 'OCCUPIED' ? 'OCCUPIED' : 'FREE / VACANT'}
                    </span>
                  )}
                </div>
              </div>

              {/* Safety Notice Footer */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Echo Cycle: 100ms</span>
                {bay.isFaulty ? (
                  <span className="text-amber-400 font-semibold">Protected: Not showing Free</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Signal nominal</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
