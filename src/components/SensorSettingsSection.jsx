import React, { useState } from 'react';
import { Sliders, CheckCircle2, RotateCcw, Cpu, Zap, ShieldCheck } from 'lucide-react';

export function SensorSettingsSection({
  floors,
  onUpdateFloorSlot,
  selectedFloor = 'L1',
  isConnected = false
}) {
  const [saveFeedback, setSaveFeedback] = useState({});

  const floorData = floors[selectedFloor] || floors.L1;
  const slots = floorData?.slots || {};

  // Bays 1, 2, and 3
  const targetBayKeys = [
    { key: `${selectedFloor}-01`, name: 'Bay 01', isHardware: true },
    { key: `${selectedFloor}-02`, name: 'Bay 02', isHardware: false },
    { key: `${selectedFloor}-03`, name: 'Bay 03', isHardware: false }
  ];

  const handleThresholdChange = (slotId, newThreshold) => {
    const parsed = Math.max(2.0, Math.min(150.0, parseFloat(newThreshold) || 10.0));
    onUpdateFloorSlot(selectedFloor, slotId, { threshold: parsed });
  };

  const handleSaveClick = (slotId) => {
    setSaveFeedback(prev => ({ ...prev, [slotId]: true }));
    setTimeout(() => {
      setSaveFeedback(prev => ({ ...prev, [slotId]: false }));
    }, 2000);
  };

  const handleResetDefault = (slotId) => {
    handleThresholdChange(slotId, 10.0);
    setSaveFeedback(prev => ({ ...prev, [slotId]: true }));
    setTimeout(() => {
      setSaveFeedback(prev => ({ ...prev, [slotId]: false }));
    }, 2000);
  };

  return (
    <div className="card-panel p-5 bg-slate-900/90 text-slate-100 border border-slate-800 shadow-xl rounded-2xl flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Sensor Threshold Settings</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                Per-Bay Calibration
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Default: 10.0 cm
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure ultrasonic & proximity threshold distances for Bay 01, Bay 02, and Bay 03. Used directly in live occupancy logic.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Detection Rule: Distance &lt; Threshold = <strong>OCCUPIED</strong></span>
        </div>
      </div>

      {/* Grid of 3 Bay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {targetBayKeys.map(({ key, name, isHardware }) => {
          const slot = slots[key] || {
            id: key,
            name,
            threshold: 10.0,
            status: 'VACANT'
          };
          const currentThresh = slot.threshold !== undefined ? slot.threshold : 10.0;
          const isSaved = !!saveFeedback[key];

          return (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{name}</span>
                    <span className="text-xs font-mono text-slate-500">({key})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isHardware ? 'Primary IoT Ultrasonic Sensor' : 'Proximity Distance Sensor'}
                  </div>
                </div>

                {isHardware && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    <span>Microcontroller Synced</span>
                  </span>
                )}
              </div>

              {/* Threshold Display and Input */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Detection Threshold:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="2.0"
                      max="150.0"
                      step="0.5"
                      value={currentThresh}
                      onChange={(e) => handleThresholdChange(key, e.target.value)}
                      className="w-20 bg-slate-950 border border-slate-700 font-mono text-cyan-400 font-bold px-2.5 py-1 rounded-lg text-right text-sm focus:border-cyan-400 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400 font-mono">cm</span>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">2cm</span>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="0.5"
                    value={currentThresh}
                    onChange={(e) => handleThresholdChange(key, e.target.value)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-[10px] font-mono text-slate-500">50cm</span>
                </div>

                {/* Occupancy Logic Formula */}
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 font-mono">
                  <div>• &lt; {currentThresh.toFixed(1)} cm ➔ <span className="text-rose-400 font-bold">OCCUPIED</span></div>
                  <div>• ≥ {currentThresh.toFixed(1)} cm ➔ <span className="text-emerald-400 font-bold">FREE / VACANT</span></div>
                </div>
              </div>

              {/* Actions: Save & Reset to Default */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleResetDefault(key)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Reset to 10.0 cm default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Default (10cm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveClick(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSaved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Save Threshold</span>
                    </>
                  )}
                </button>
              </div>

              {isHardware && (
                <div className="text-[10px] text-slate-500">
                  {isConnected ? (
                    <span className="text-emerald-400">✓ Web Serial synced: H:{currentThresh.toFixed(1)} sent to Arduino</span>
                  ) : (
                    <span>Connect hardware via Web Serial to sync threshold live.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
