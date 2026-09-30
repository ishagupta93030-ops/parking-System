import React from 'react';
import { Cpu, DoorOpen, Lock, Volume2, Sparkles, Send } from 'lucide-react';

export function HardwareControlBar({ isConnected, isSimulating, onSendCommand, onConnect, onToggleSim }) {
  const isEnabled = isConnected || isSimulating;

  return (
    <div className="card-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black flex items-center gap-2">
            Arduino C++ Microcontroller Controls
            {isConnected ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ACTIVE BUS (USB)
              </span>
            ) : isSimulating ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                SIMULATED BUS (DEMO)
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                OFFLINE
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400">
            {isConnected 
              ? 'Send real-time serial commands directly to the Arduino servo, buzzer, and LED pins.' 
              : isSimulating 
              ? 'Demo mode active: Test barrier servos, buzzer beeps, and diagnostic LEDs without hardware.'
              : 'Connect an Arduino board via USB or turn on "Test Demo Mode" to control barrier and buzzer.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSendCommand('O')}
          disabled={!isEnabled}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Send 'O' to open servo barrier (90°)"
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>Open Barrier (90°)</span>
        </button>

        <button
          onClick={() => onSendCommand('C')}
          disabled={!isEnabled}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Send 'C' to lower servo barrier (0°)"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Close Barrier (0°)</span>
        </button>

        <button
          onClick={() => onSendCommand('B')}
          disabled={!isEnabled}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 disabled:opacity-30 disabled:pointer-events-none text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Send 'B' to trigger buzzer beep"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Beep Buzzer</span>
        </button>

        <button
          onClick={() => onSendCommand('T')}
          disabled={!isEnabled}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 disabled:opacity-30 disabled:pointer-events-none text-purple-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Send 'T' for diagnostic LED cycle"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flash LEDs</span>
        </button>
      </div>
    </div>
  );
}
