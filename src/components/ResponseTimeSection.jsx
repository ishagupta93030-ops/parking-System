import React from 'react';
import { Clock, Zap, Activity, Download, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function ResponseTimeSection({
  metrics = [],
  onClearMetrics,
  onExportCsv
}) {
  const hasData = metrics && metrics.length > 0;

  // Compute metrics from actual real measurements
  const totalSamples = metrics.length;
  const currentMetric = hasData ? metrics[0] : null;

  let minMs = null;
  let maxMs = null;
  let avgMs = null;

  if (hasData) {
    const totalTimes = metrics.map(m => m.totalMs);
    minMs = Math.min(...totalTimes).toFixed(2);
    maxMs = Math.max(...totalTimes).toFixed(2);
    const sum = totalTimes.reduce((acc, val) => acc + val, 0);
    avgMs = (sum / totalTimes.length).toFixed(2);
  }

  return (
    <div className="card-panel p-5 bg-slate-900/90 text-slate-100 border border-slate-800 shadow-xl rounded-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Response Time Logging</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                End-to-End Latency
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                ({totalSamples} {totalSamples === 1 ? 'sample' : 'samples'})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-precision measurement from vehicle sensor detection to dashboard state commit and database persistence.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasData && onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>
          )}

          {hasData && onClearMetrics && (
            <button
              type="button"
              onClick={onClearMetrics}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards: Current, Average, Minimum, Maximum */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Current Response Time */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Current Response Time</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </span>
          <div className="mt-2">
            {hasData ? (
              <>
                <div className="text-2xl font-black text-white font-mono">
                  {currentMetric.totalMs.toFixed(1)} <span className="text-sm font-bold text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    {currentMetric.source}
                  </span>
                  <span>{currentMetric.eventType}</span>
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic mt-1">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Average Response Time</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </span>
          <div className="mt-2">
            {hasData ? (
              <>
                <div className="text-2xl font-black text-white font-mono">
                  {avgMs} <span className="text-sm font-bold text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Mean over {totalSamples} real samples
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic mt-1">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Minimum Response Time */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Minimum Response Time</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 rotate-180" />
          </span>
          <div className="mt-2">
            {hasData ? (
              <>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {minMs} <span className="text-sm font-bold text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Fastest hardware/UI pipeline
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic mt-1">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Maximum Response Time */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Maximum Response Time</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="mt-2">
            {hasData ? (
              <>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {maxMs} <span className="text-sm font-bold text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Peak latency with database sync
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic mt-1">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Note & Recent Measured Log Preview */}
      {hasData ? (
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Latest Latency Telemetry Breakdown:</span>
            <span className="font-mono text-[11px]">
              Sensor-to-UI: <span className="text-cyan-300 font-bold">{currentMetric.detectionToUiMs} ms</span> | 
              UI-to-Database: <span className="text-indigo-300 font-bold">{currentMetric.uiToDbMs} ms</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 text-center">
          Trigger vehicle arrival or departure (via Demo Mode or Arduino sensor) to record real latency benchmarks. No artificial or placeholder data is generated.
        </div>
      )}
    </div>
  );
}
