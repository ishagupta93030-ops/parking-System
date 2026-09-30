import React from 'react';
import { 
  Car, 
  Usb, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  BookOpen, 
  Terminal,
  Activity,
  MapPin,
  LayoutGrid,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

export function Header({
  activeView = 'bays',
  onSelectView,
  isConnected,
  isSimulating,
  onConnect,
  onDisconnect,
  onToggleSim,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  voiceLanguage,
  onChangeVoiceLanguage,
  isSpeaking,
  onOpenGuide,
  showTerminal,
  onToggleTerminal
}) {
  return (
    <header className="card-panel p-4 md:px-6 flex flex-col gap-4">
      {/* Top Row: Brand & Connection Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Car className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">ParkSense IoT</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wider">
                Full Ecosystem
              </span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-500">
              Web Admin • Driver Mobile App • Supabase DB • Arduino C++
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Indicator */}
          <div className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : isSimulating 
              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500' : isSimulating ? 'bg-amber-500' : 'bg-slate-400'
            }`} />
            <span>
              {isConnected ? 'Arduino Connected' : isSimulating ? 'Demo Active' : 'Sensor Disconnected'}
            </span>
          </div>

          {/* Connect Sensor Button */}
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold tracking-wide text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95 ${
              isConnected 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>{isConnected ? 'Disconnect' : 'Connect Arduino'}</span>
          </button>

          {/* Test Demo Mode Button */}
          <button
            onClick={onToggleSim}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              isSimulating
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
          >
            {isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? 'Exit Demo' : 'Test Demo Mode'}</span>
          </button>

          {/* Voice Assistant Pill */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={onToggleVoice}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceEnabled 
                  ? `bg-white text-slate-800 shadow-xs ${isSpeaking ? 'voice-speaking-pulse ring-2 ring-blue-500' : ''}` 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle AI Voice Announcements"
            >
              {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-blue-600" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>Voice {voiceEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <select
              value={voiceLanguage}
              onChange={(e) => onChangeVoiceLanguage(e.target.value)}
              disabled={!voiceEnabled}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1 disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title="Toggle Chime Sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Live Serial Terminal Drawer Toggle */}
          <button
            onClick={onToggleTerminal}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showTerminal 
                ? 'bg-slate-900 border-slate-900 text-emerald-400' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Serial Stream Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* C++ Sketch & Wiring Guide */}
          <button
            onClick={onOpenGuide}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Arduino C++ Code & Wiring Pinout"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">C++ Guide</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: 4 Portal Views Switcher */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          {/* View 1: 2D Simulator */}
          <button
            type="button"
            onClick={() => onSelectView('bays')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'bays'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>🚗 Live Bays & IoT Simulator</span>
          </button>

          {/* View 2: City Map */}
          <button
            type="button"
            onClick={() => onSelectView('map')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>🗺️ City Map & 1-Hr Rates</span>
          </button>

          {/* View 3: Driver Mobile App */}
          <button
            type="button"
            onClick={() => onSelectView('mobile')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Driver Mobile App</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-200 text-indigo-950 uppercase">
              React Native
            </span>
          </button>

          {/* View 4: Admin Web Portal */}
          <button
            type="button"
            onClick={() => onSelectView('admin')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'admin'
                ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>👑 Admin Web Portal</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 uppercase">
              Supabase
            </span>
          </button>
        </div>

        {/* 1-Hour Fixed Tariff Indicator */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <span>Standard 1-Hr Parking:</span>
          <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ₹30.00 / hr
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">(First 15m Free)</span>
        </div>
      </div>
    </header>
  );
}
