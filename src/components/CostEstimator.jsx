import React, { useState } from 'react';
import { 
  Calculator, 
  Clock, 
  Zap, 
  Car, 
  Bike, 
  ShieldCheck, 
  Sparkles, 
  Info,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { VEHICLE_RATES } from '../data/facilitiesData';

export function CostEstimator({
  facility,
  onReserveDuration
}) {
  const [hours, setHours] = useState(1);
  const [vehicleType, setVehicleType] = useState('car');
  const [includeValet, setIncludeValet] = useState(false);
  const [includeEvCharging, setIncludeEvCharging] = useState(false);
  const [reservedSuccess, setReservedSuccess] = useState(false);

  // Compute pricing
  const baseRatePerHour = facility ? facility.ratePerHour : 30.0;
  const vehicleMultiplier = VEHICLE_RATES[vehicleType]?.multiplier || 1.0;
  const hourlyRateForVehicle = Math.round(baseRatePerHour * vehicleMultiplier);

  // Specific 1-Hour cost
  const oneHourBase = hourlyRateForVehicle;
  const oneHourTax = oneHourBase * 0.05;
  const oneHourTotal = oneHourBase + oneHourTax;

  // Selected duration cost
  let totalBaseFare = hourlyRateForVehicle * hours;

  // Daily cap discount if parking >= 8 hours
  let discount = 0;
  if (hours >= 12) {
    discount = totalBaseFare * 0.25; // 25% long-stay discount
  } else if (hours >= 8) {
    discount = totalBaseFare * 0.15; // 15% workday discount
  }

  // Add-ons
  const valetFee = includeValet ? 50.0 : 0.0;
  const evChargingFee = (includeEvCharging || vehicleType === 'ev') ? 80.0 : 0.0;

  const netBase = Math.max(0, totalBaseFare - discount) + valetFee + evChargingFee;
  const gstTax = netBase * 0.05;
  const grandTotal = netBase + gstTax;

  const handleBook = () => {
    setReservedSuccess(true);
    if (onReserveDuration) {
      onReserveDuration({
        facilityName: facility?.name || 'ParkSense Hub',
        hours,
        vehicleType,
        total: grandTotal.toFixed(2)
      });
    }
    setTimeout(() => setReservedSuccess(false), 4000);
  };

  return (
    <div className="card-panel p-5 md:p-6 bg-gradient-to-br from-white to-blue-50/40 border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
            TRANSPARENT TARIFF CALCULATOR
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Parking Cost Estimator for {facility?.name || 'Selected Facility'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Clear upfront pricing with no hidden charges. First 15 minutes grace period is 100% free!
          </p>
        </div>

        {/* 1-HOUR PROMINENT BADGE */}
        <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-md shadow-blue-600/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 block">
            1-HOUR FIXED PARKING
          </span>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-2xl md:text-3xl font-black font-mono">₹ {oneHourTotal.toFixed(2)}</span>
            <span className="text-xs text-blue-200 font-bold">/ hr (incl. tax)</span>
          </div>
          <span className="text-[10px] text-blue-100 block">₹{oneHourBase.toFixed(2)} base + ₹{oneHourTax.toFixed(2)} GST</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
        {/* Controls Column 1 & 2 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Vehicle Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-2">
              Select Vehicle Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  vehicleType === 'car'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Car className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-black block">Standard Car</span>
                <span className={`text-[10px] font-bold ${vehicleType === 'car' ? 'text-blue-100' : 'text-slate-500'}`}>
                  ₹{Math.round(baseRatePerHour * 1.0)}/hr
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('suv')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  vehicleType === 'suv'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Car className="w-5 h-5 mb-1.5 stroke-[2.5]" />
                <span className="text-xs font-black block">Large SUV</span>
                <span className={`text-[10px] font-bold ${vehicleType === 'suv' ? 'text-blue-100' : 'text-slate-500'}`}>
                  ₹{Math.round(baseRatePerHour * 1.33)}/hr
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('bike')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  vehicleType === 'bike'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-black block">Two-Wheeler</span>
                <span className={`text-[10px] font-bold ${vehicleType === 'bike' ? 'text-blue-100' : 'text-slate-500'}`}>
                  ₹{Math.round(baseRatePerHour * 0.5)}/hr
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('ev')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  vehicleType === 'ev'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-5 h-5 mb-1.5 text-amber-300" />
                <span className="text-xs font-black block">EV + Fast Charge</span>
                <span className={`text-[10px] font-bold ${vehicleType === 'ev' ? 'text-blue-100' : 'text-slate-500'}`}>
                  ₹{Math.round(baseRatePerHour * 1.66)}/hr
                </span>
              </button>
            </div>
          </div>

          {/* 2. Duration Interactive Slider */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="duration-slider" className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Parking Duration:
              </label>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-black text-blue-700">{hours}</span>
                <span className="text-sm font-extrabold text-slate-700">{hours === 1 ? 'Hour' : 'Hours'}</span>
              </div>
            </div>

            <input
              id="duration-slider"
              type="range"
              min="1"
              max="24"
              step="1"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 font-mono">
              <button onClick={() => setHours(1)} className={`hover:text-blue-600 cursor-pointer ${hours === 1 ? 'text-blue-600 font-extrabold underline' : ''}`}>1 hr (Standard)</button>
              <button onClick={() => setHours(2)} className={`hover:text-blue-600 cursor-pointer ${hours === 2 ? 'text-blue-600 font-extrabold underline' : ''}`}>2 hrs</button>
              <button onClick={() => setHours(4)} className={`hover:text-blue-600 cursor-pointer ${hours === 4 ? 'text-blue-600 font-extrabold underline' : ''}`}>4 hrs</button>
              <button onClick={() => setHours(8)} className={`hover:text-blue-600 cursor-pointer ${hours === 8 ? 'text-blue-600 font-extrabold underline' : ''}`}>8 hrs (Workday -15%)</button>
              <button onClick={() => setHours(24)} className={`hover:text-blue-600 cursor-pointer ${hours === 24 ? 'text-blue-600 font-extrabold underline' : ''}`}>24 hrs (Full Day -25%)</button>
            </div>
          </div>

          {/* 3. Optional Add-ons */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 select-none">
              <input
                type="checkbox"
                checked={includeValet}
                onChange={(e) => setIncludeValet(e.target.checked)}
                className="accent-blue-600 cursor-pointer w-4 h-4"
              />
              <span>Include Valet Parking (+₹50)</span>
            </label>

            {vehicleType !== 'ev' && (
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 select-none">
                <input
                  type="checkbox"
                  checked={includeEvCharging}
                  onChange={(e) => setIncludeEvCharging(e.target.checked)}
                  className="accent-blue-600 cursor-pointer w-4 h-4"
                />
                <span>Include EV Level-2 Charger (+₹80)</span>
              </label>
            )}
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-black uppercase text-slate-900">Estimated Cost Summary</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                GST Included
              </span>
            </div>

            <div className="py-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Vehicle:</span>
                <strong className="text-slate-900">{VEHICLE_RATES[vehicleType]?.label.split('(')[0]}</strong>
              </div>
              <div className="flex justify-between">
                <span>Hourly Rate:</span>
                <span className="font-mono font-bold text-slate-900">₹ {hourlyRateForVehicle}.00 / hr</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-mono font-bold text-slate-900">{hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Long-Stay Discount:</span>
                  <span className="font-mono">- ₹ {discount.toFixed(2)}</span>
                </div>
              )}

              {includeValet && (
                <div className="flex justify-between">
                  <span>Valet Convenience:</span>
                  <span className="font-mono">₹ 50.00</span>
                </div>
              )}

              {(includeEvCharging || vehicleType === 'ev') && (
                <div className="flex justify-between text-blue-700">
                  <span>EV Rapid Charge:</span>
                  <span className="font-mono">₹ 80.00</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                <span>Taxes (CGST + SGST 5%):</span>
                <span className="font-mono">₹ {gstTax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-slate-200">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs font-black uppercase text-slate-900">Total Payable:</span>
              <span className="font-mono text-3xl font-black text-emerald-700">
                ₹ {grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleBook}
              disabled={reservedSuccess}
              className={`w-full py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                reservedSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {reservedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Spot Reserved for {hours} Hour{hours > 1 ? 's' : ''}!</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Reserve {hours} Hour{hours > 1 ? 's' : ''} at ₹{grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
