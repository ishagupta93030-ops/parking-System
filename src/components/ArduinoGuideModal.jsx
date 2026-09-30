import React, { useState } from 'react';
import { X, Copy, Check, Cpu, Terminal, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { ARDUINO_CPP_CODE } from '../data/constants';

export function ArduinoGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cpp'); // 'cpp', 'wiring', 'quickstart'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(ARDUINO_CPP_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 md:px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Arduino C++ Firmware & Hardware Guide
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Ultrasonic HC-SR04 • SG90 Servo • Buzzer • Web Serial API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('cpp')}
            className={`px-4 py-2 border-b-2 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cpp'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>parking_sensor.ino (C++ Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-4 py-2 border-b-2 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wiring'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Hardware Wiring Pinout</span>
          </button>

          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-4 py-2 border-b-2 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quickstart'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3-Step Quick Start</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {activeTab === 'cpp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Target Sketch: <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">parking_sensor.ino</code>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire C++ Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
                <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-96">
                  {ARDUINO_CPP_CODE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <strong>💡 Modular Plug & Play Design:</strong> Only the <strong>HC-SR04 Ultrasonic Sensor</strong> is required to run the full dashboard! The Servo, Buzzer, and LEDs are optional upgrades supported natively in the C++ firmware.
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Component</th>
                      <th className="px-4 py-2.5">Component Pin</th>
                      <th className="px-4 py-2.5">Arduino Pin</th>
                      <th className="px-4 py-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-emerald-50/50 font-medium">
                      <td className="px-4 py-2 font-bold text-emerald-900">HC-SR04 [Required]</td>
                      <td className="px-4 py-2 font-mono">VCC</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">5V</td>
                      <td className="px-4 py-2 text-slate-500">Power (+5V DC)</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-medium">
                      <td className="px-4 py-2 font-bold text-emerald-900">HC-SR04 [Required]</td>
                      <td className="px-4 py-2 font-mono">GND</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">GND</td>
                      <td className="px-4 py-2 text-slate-500">Ground</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-medium">
                      <td className="px-4 py-2 font-bold text-emerald-900">HC-SR04 [Required]</td>
                      <td className="px-4 py-2 font-mono">TRIG</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Digital Pin 9</td>
                      <td className="px-4 py-2 text-slate-500">Ultrasonic Trigger Pulse</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-medium">
                      <td className="px-4 py-2 font-bold text-emerald-900">HC-SR04 [Required]</td>
                      <td className="px-4 py-2 font-mono">ECHO</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Digital Pin 10</td>
                      <td className="px-4 py-2 text-slate-500">Ultrasonic Echo Receiver</td>
                    </tr>
                    <tr className="bg-cyan-50/60 font-medium">
                      <td className="px-4 py-2 font-bold text-cyan-950">16x2 I2C LCD [Hourly Display]</td>
                      <td className="px-4 py-2 font-mono">SDA</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin A4</td>
                      <td className="px-4 py-2 text-slate-600">I2C Data line (Uno/Nano A4)</td>
                    </tr>
                    <tr className="bg-cyan-50/60 font-medium">
                      <td className="px-4 py-2 font-bold text-cyan-950">16x2 I2C LCD [Hourly Display]</td>
                      <td className="px-4 py-2 font-mono">SCL</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin A5</td>
                      <td className="px-4 py-2 text-slate-600">I2C Clock line (Uno/Nano A5)</td>
                    </tr>
                    <tr className="bg-cyan-50/60 font-medium">
                      <td className="px-4 py-2 font-bold text-cyan-950">16x2 I2C LCD [Hourly Display]</td>
                      <td className="px-4 py-2 font-mono">VCC / GND</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">5V & GND</td>
                      <td className="px-4 py-2 text-slate-600">Requires LiquidCrystal_I2C library</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-bold">SG90 Servo Motor</td>
                      <td className="px-4 py-2 font-mono">Orange (Signal)</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin 11 (PWM)</td>
                      <td className="px-4 py-2 text-slate-500">Automated 90° Boom Barrier</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-bold">Active Buzzer</td>
                      <td className="px-4 py-2 font-mono">Positive (+)</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin 6</td>
                      <td className="px-4 py-2 text-slate-500">Hourly Chime & Proximity Alert</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-bold">Red LED</td>
                      <td className="px-4 py-2 font-mono">Anode (+) via 220Ω</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin 7</td>
                      <td className="px-4 py-2 text-slate-500">Occupied Bay Light</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-bold">Green LED</td>
                      <td className="px-4 py-2 font-mono">Anode (+) via 220Ω</td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-700">Pin 8</td>
                      <td className="px-4 py-2 text-slate-500">Vacant Bay Light</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Upload C++ Firmware to Arduino</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Open <code className="font-mono bg-white px-1.5 py-0.5 rounded border">parking_sensor.ino</code> in Arduino IDE. Choose your board and COM port, then click <strong>Upload</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Close Arduino IDE Serial Monitor</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong className="text-amber-800">CRITICAL:</strong> Only one program can use a USB COM port at a time. If the Arduino IDE Serial Monitor is open, close it so the browser can connect.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Connect in Browser</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Click <strong>"Connect Arduino"</strong> at the top right of this web dashboard, pick your Arduino port, and watch telemetry stream in real time!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">
            Baud Rate: <strong>9600 bps</strong> • Data bits: <strong>8</strong> • Parity: <strong>None</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
          >
            Got it, Let's Test!
          </button>
        </div>
      </div>
    </div>
  );
}
