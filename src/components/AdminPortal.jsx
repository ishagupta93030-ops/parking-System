import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Database, 
  DollarSign, 
  Car, 
  Cpu, 
  Settings, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Layers, 
  DoorOpen, 
  Lock, 
  Volume2, 
  Sparkles,
  Key,
  Copy,
  ExternalLink,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured,
  clearAllVehicleRecords,
  deleteVehicleRecord
} from '../services/supabaseClient';
import { SensorSettingsSection } from './SensorSettingsSection';
import { SensorHealthCard } from './SensorHealthCard';
import { ResponseTimeSection } from './ResponseTimeSection';

export function AdminPortal({
  records,
  onRefreshRecords,
  onViewReceipt,
  onExportCsv,
  totalRevenue,
  floors,
  onUpdateFloorSlot,
  isConnected,
  onSendCommand,
  billingRate,
  onChangeBillingRate,
  sensorHealth = 'HEALTHY',
  responseTimeMetrics = [],
  onClearResponseMetrics,
  activeHardwareThreshold = 10.0
}) {
  const [activeTab, setActiveTab] = useState('database'); // 'database', 'modeling', 'hardware', 'supabase'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [metricSourceFilter, setMetricSourceFilter] = useState('ALL'); // 'ALL', 'HARDWARE', 'SIMULATION'

  // Supabase Settings Form
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Export Latency Benchmarks to CSV
  const handleExportBenchmarksCsv = () => {
    if (!responseTimeMetrics || responseTimeMetrics.length === 0) return;
    const headers = ['Metric ID', 'Source', 'Event Type', 'Sensor to UI (ms)', 'UI to DB (ms)', 'Total Response Time (ms)', 'Timestamp'];
    const rows = responseTimeMetrics.map(m => [
      m.id,
      m.source,
      m.eventType,
      m.detectionToUiMs,
      m.uiToDbMs,
      m.totalMs,
      m.timestamp
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ParkSense_Latency_Benchmarks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);
  }, []);

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
    if (res.success && onRefreshRecords) {
      onRefreshRecords();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
  };

  const handleDeleteRecord = async (ticketId) => {
    if (window.confirm(`Delete record ${ticketId} from the database?`)) {
      await deleteVehicleRecord(ticketId);
      if (onRefreshRecords) onRefreshRecords();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL parking records from the database?')) {
      await clearAllVehicleRecords();
      if (onRefreshRecords) onRefreshRecords();
    }
  };

  // Filter records
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bay.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  // Calculate live statistics
  const totalBays = Object.values(floors).reduce((acc, f) => acc + Object.keys(f.slots).length, 0);
  const occupiedBays = Object.values(floors).reduce(
    (acc, f) => acc + Object.values(f.slots).filter(s => s.status === 'OCCUPIED').length, 0
  );
  const utilizationPct = Math.round((occupiedBays / totalBays) * 100);

  return (
    <div className="card-panel p-5 md:p-6 bg-slate-900 text-slate-100 border-slate-800 shadow-xl flex flex-col gap-6">
      {/* Top Banner: Admin Brand & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white">Admin Master Control Hub</h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Enterprise
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSupabaseConfigured() 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isSupabaseConfigured() ? '☁️ Supabase Connected' : '📁 Local Storage Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Manage database records, floor models, tariff policies, and IoT microcontroller bus.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'database' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Vehicle Database ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modeling')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'modeling' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Slot & Tariff Modeling</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sensor_settings')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sensor_settings' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sensor Settings (Bays 1-3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hardware' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics & Benchmarks ({responseTimeMetrics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-300" />
            <span>Supabase Cloud Config</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black font-mono text-emerald-400">₹ {totalRevenue.toFixed(2)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicles Audited</span>
            <span className="text-2xl font-black font-mono text-blue-400">{records.length} Cars</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facility Utilization</span>
            <span className="text-2xl font-black font-mono text-amber-400">{utilizationPct}%</span>
            <span className="text-[10px] text-slate-500 ml-1">({occupiedBays}/{totalBays})</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IoT Sensor Health</span>
            <span className={`text-base font-black ${
              sensorHealth === 'FAULT' ? 'text-amber-400' : isConnected ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {sensorHealth === 'FAULT' ? '⚠️ SENSOR FAULT' : isConnected ? 'ONLINE (9600)' : 'STANDBY'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            sensorHealth === 'FAULT' 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' 
              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: VEHICLE DATABASE MANAGER */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search plate, ticket ID, or bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs font-mono text-white rounded-xl outline-none w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onExportCsv}
                disabled={records.length === 0}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleClearAll}
                disabled={records.length === 0}
                className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 disabled:opacity-40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Records</span>
              </button>
            </div>
          </div>

          {/* Database Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900 uppercase text-[10px] text-slate-400 border-b border-slate-800 font-sans">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Vehicle Plate</th>
                  <th className="px-4 py-3">Bay #</th>
                  <th className="px-4 py-3">Entry Time</th>
                  <th className="px-4 py-3">Exit Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Base (₹)</th>
                  <th className="px-4 py-3">GST 5% (₹)</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500 font-sans">
                      No matching vehicle records found in the database.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.ticketId} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-indigo-400">{r.ticketId}</td>
                      <td className="px-4 py-2.5 text-white font-extrabold bg-slate-900 px-2 rounded">
                        {r.plate}
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 font-sans">{r.bay}</td>
                      <td className="px-4 py-2.5 text-slate-400">{r.entryTime}</td>
                      <td className="px-4 py-2.5 text-slate-400">{r.exitTime}</td>
                      <td className="px-4 py-2.5 text-slate-200">{r.duration}</td>
                      <td className="px-4 py-2.5">₹ {r.baseFare}</td>
                      <td className="px-4 py-2.5 text-slate-400">₹ {r.tax}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-400">₹ {r.totalAmount}</td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-sans flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(r)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer"
                          title="View Official Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.ticketId)}
                          className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 cursor-pointer"
                          title="Delete from DB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SLOT & TARIFF MODELING */}
      {activeTab === 'modeling' && (
        <div className="space-y-5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Facility-Wide Standard Tariff Policy</h4>
              <p className="text-xs text-slate-400">Update default 1-hour parking rate applied across slots.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">1-Hour Rate:</span>
              <input
                type="number"
                min="10"
                max="500"
                value={billingRate}
                onChange={(e) => onChangeBillingRate(parseFloat(e.target.value) || 30)}
                className="w-24 bg-slate-900 border border-slate-700 font-mono text-emerald-400 font-bold text-sm px-3 py-1.5 rounded-lg outline-none"
              />
              <span className="text-xs text-slate-400 font-mono">₹/hr (+ 5% GST)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(floors).map(floorId => {
              const floor = floors[floorId];
              const slots = Object.values(floor.slots);
              return (
                <div key={floorId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-black text-indigo-400 uppercase">{floor.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{slots.length} Bays</span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {slots.map(s => (
                      <div key={s.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-mono">{s.name}</strong>
                              {s.isHardware && (
                                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800 flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5 text-cyan-400" />
                                  IOT BAY
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold block mt-0.5 ${
                              s.status === 'SENSOR_ERROR' 
                                ? 'text-amber-400' 
                                : s.status === 'OCCUPIED' 
                                ? 'text-rose-400' 
                                : 'text-emerald-400'
                            }`}>
                              {s.status === 'SENSOR_ERROR' ? '⚠️ SENSOR ERROR' : s.status} {s.plate ? `(${s.plate})` : ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = s.status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED';
                              onUpdateFloorSlot(floorId, s.id, { status: nextStatus, plate: nextStatus === 'OCCUPIED' ? 'ADMIN-OVERRIDE' : null });
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                          >
                            Toggle State
                          </button>
                        </div>

                        {/* Configurable Bay Detection Threshold */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-cyan-400" />
                            Bay Detection Threshold:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="2"
                              max="150"
                              step="0.5"
                              value={s.threshold !== undefined ? s.threshold : 10.0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  onUpdateFloorSlot(floorId, s.id, { threshold: val });
                                }
                              }}
                              className="w-16 bg-slate-950 border border-slate-700 font-mono text-cyan-400 font-bold px-2 py-0.5 rounded outline-none text-right"
                            />
                            <span className="text-slate-500 font-mono text-[10px]">cm</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SENSOR THRESHOLD SETTINGS (BAYS 1, 2, 3) */}
      {activeTab === 'sensor_settings' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <SensorSettingsSection
            floors={floors}
            onUpdateFloorSlot={onUpdateFloorSlot}
            selectedFloor="L1"
            isConnected={isConnected}
          />
        </div>
      )}

      {/* TAB 3: HARDWARE DIAGNOSTICS & RESEARCH RESPONSE-TIME BENCHMARKS */}
      {activeTab === 'hardware' && (
        <div className="space-y-5">
          {/* Live Sensor Health & Diagnostic Status */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Sensor Health & Diagnostic Status
                </h4>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                  sensorHealth === 'FAULT'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {sensorHealth === 'FAULT' ? '⚠️ SENSOR FAULT DETECTED' : 'HEALTHY (ACTIVE READINGS)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ultrasonic HC-SR04 continuous ping verification. Fault detection triggers if echo pulse times out or drops below physical threshold.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Active Threshold</span>
                <span className="text-cyan-400 font-bold">{parseFloat(activeHardwareThreshold).toFixed(1)} cm</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Serial Connection</span>
                <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {isConnected ? '9600 Baud USB' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Microcontroller Commands */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Arduino Microcontroller Bus Actuation (Pin Controls)
            </h4>
            <p className="text-xs text-slate-400">
              Trigger instant serial packets to physical hardware pins over Web Serial (Baud 9600 8-N-1).
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSendCommand('O')}
                disabled={!isConnected}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Open Barrier (90° Servo)</span>
              </button>

              <button
                type="button"
                onClick={() => onSendCommand('C')}
                disabled={!isConnected}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Close Barrier (0° Servo)</span>
              </button>

              <button
                type="button"
                onClick={() => onSendCommand('B')}
                disabled={!isConnected}
                className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 disabled:opacity-40 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Beep Buzzer Test</span>
              </button>

              <button
                type="button"
                onClick={() => onSendCommand('T')}
                disabled={!isConnected}
                className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 disabled:opacity-40 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Flash Diagnostic LEDs</span>
              </button>
            </div>
          </div>

          {/* Research Response-Time Benchmark Analytics */}
          <div className="bg-slate-950 p-4 md:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Research Response-Time Benchmark Analytics
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    Actual Latency
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual execution latency measured using <code className="text-cyan-300">performance.now()</code> from sensor detection trigger to database confirmation. No fabricated values.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBenchmarksCsv}
                  disabled={responseTimeMetrics.length === 0}
                  className="px-3 py-1.5 bg-emerald-700/30 hover:bg-emerald-700/50 disabled:opacity-30 disabled:pointer-events-none text-emerald-300 border border-emerald-600/40 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Benchmark CSV</span>
                </button>

                {onClearResponseMetrics && (
                  <button
                    type="button"
                    onClick={onClearResponseMetrics}
                    disabled={responseTimeMetrics.length === 0}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Metrics</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Statistics KPI Cards */}
            {(() => {
              const filtered = (responseTimeMetrics || []).filter(m => {
                if (metricSourceFilter === 'ALL') return true;
                return m.source === metricSourceFilter;
              });
              const count = filtered.length;
              const minVal = count > 0 ? Math.min(...filtered.map(m => m.totalMs)).toFixed(1) : '--';
              const maxVal = count > 0 ? Math.max(...filtered.map(m => m.totalMs)).toFixed(1) : '--';
              const avgVal = count > 0 ? (filtered.reduce((sum, m) => sum + m.totalMs, 0) / count).toFixed(1) : '--';

              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Samples</span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">{count}</span>
                      <span className="text-[9px] text-slate-500 font-semibold">Events Recorded</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Min Response Time</span>
                      <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                        {minVal !== '--' ? `${minVal} ms` : '--'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">Fastest Execution</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Average Response Time</span>
                      <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">
                        {avgVal !== '--' ? `${avgVal} ms` : '--'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">Mean Sensor-to-DB</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Max Response Time</span>
                      <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                        {maxVal !== '--' ? `${maxVal} ms` : '--'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">Peak Network / Render</span>
                    </div>
                  </div>

                  {/* Source Filter Switcher */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setMetricSourceFilter('ALL')}
                        className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                          metricSourceFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All ({responseTimeMetrics.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricSourceFilter('HARDWARE')}
                        className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                          metricSourceFilter === 'HARDWARE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Hardware Only ({responseTimeMetrics.filter(m => m.source === 'HARDWARE').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricSourceFilter('SIMULATION')}
                        className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                          metricSourceFilter === 'SIMULATION' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Simulation Only ({responseTimeMetrics.filter(m => m.source === 'SIMULATION').length})
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Showing {filtered.length} sample(s)
                    </span>
                  </div>

                  {/* Latency Log Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-300 font-mono">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2">Timestamp</th>
                          <th className="px-3 py-2">Data Source</th>
                          <th className="px-3 py-2">Event</th>
                          <th className="px-3 py-2">Sensor &rarr; UI</th>
                          <th className="px-3 py-2">UI &rarr; Database</th>
                          <th className="px-3 py-2 text-right">Total Response</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-6 text-center text-slate-500 font-sans">
                              No latency telemetry captured yet. Trigger a vehicle arrival/departure or hardware serial packet to record live timing.
                            </td>
                          </tr>
                        ) : (
                          filtered.map(m => (
                            <tr key={m.id} className="hover:bg-slate-900/60">
                              <td className="px-3 py-2 text-slate-400 text-[11px]">
                                {new Date(m.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide border ${
                                  m.source === 'HARDWARE'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                }`}>
                                  {m.source}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-sans font-semibold text-white">
                                {m.eventType === 'VEHICLE_ARRIVED' ? '🚗 Vehicle Arrived' : '🏁 Vehicle Departed'}
                              </td>
                              <td className="px-3 py-2 text-cyan-300">
                                {m.detectionToUiMs} ms
                              </td>
                              <td className="px-3 py-2 text-slate-300">
                                {m.uiToDbMs} ms
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-emerald-400">
                                {m.totalMs} ms
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: SUPABASE CLOUD CONFIG */}
      {activeTab === 'supabase' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase Real-Time Cloud Database Integration
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your free Supabase project to synchronize all vehicle records, parking models, and audits to the cloud!
              </p>
            </div>

            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Free Supabase DB</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Supabase Project URL</label>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white font-mono px-3.5 py-2.5 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white font-mono px-3.5 py-2.5 rounded-xl outline-none"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' 
                  : 'bg-rose-950/60 border-rose-600 text-rose-300'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isTesting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors shadow-sm"
              >
                {isTesting ? 'Connecting...' : 'Save & Connect to Supabase'}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !supabaseUrl}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                Test Connection
              </button>
            </div>
          </form>

          {/* SQL Schema Notice */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Database Setup (1-Minute Quick Start):</span>
              <span className="text-[11px] text-indigo-400 font-mono">supabase_schema.sql</span>
            </div>
            <p>
              Paste the contents of <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">supabase_schema.sql</code> into your <strong>Supabase SQL Editor</strong> to create all tables (<code className="text-indigo-300">vehicle_records</code>, <code className="text-indigo-300">parking_slots</code>, <code className="text-indigo-300">facilities</code>).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
