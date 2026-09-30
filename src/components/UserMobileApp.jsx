import React, { useState } from 'react';
import { 
  Smartphone, 
  MapPin, 
  Clock, 
  CreditCard, 
  Car, 
  Navigation, 
  QrCode, 
  Sparkles, 
  Check, 
  X,
  ChevronRight,
  ShieldCheck,
  Search,
  Bell
} from 'lucide-react';
import { FacilityMap } from './FacilityMap';
import { CostEstimator } from './CostEstimator';
import { PARKING_FACILITIES } from '../data/facilitiesData';

export function UserMobileApp({
  userBooking,
  userDuration,
  userCost,
  onCancelBooking,
  onQuickPark,
  currentPlate,
  onViewReceipt,
  latestRecord,
  liveLotVacantCount,
  liveLotTotalCount
}) {
  const [mobileTab, setMobileTab] = useState('home'); // 'home', 'map', 'ticket', 'rates'
  const [selectedFacility, setSelectedFacility] = useState(PARKING_FACILITIES[0]);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone Shell Toggle */}
      <div className="flex items-center justify-between w-full max-w-xl px-2 text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Driver / Operator View</span>
        </span>

        <button
          type="button"
          onClick={() => setIsPhoneFrame(v => !v)}
          className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors shadow-2xs"
        >
          {isPhoneFrame ? 'Expand Full Screen' : '📱 Show Smartphone Frame'}
        </button>
      </div>

      {/* Main Container / Smartphone Viewport */}
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-sm rounded-[42px] border-[10px] border-slate-900 bg-slate-950 p-2 shadow-2xl relative overflow-hidden' 
          : 'max-w-4xl'
      }`}>
        {/* If Phone Frame, show top notch / speaker */}
        {isPhoneFrame && (
          <div className="h-6 w-full flex items-center justify-center relative mb-1">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-800 mr-2"></span>
              <span className="w-8 h-1 bg-slate-800 rounded-full"></span>
            </div>
          </div>
        )}

        {/* Mobile App Shell */}
        <div className="bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[580px]">
          {/* Mobile App Top Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight">ParkSense Mobile</h3>
                  <p className="text-[10px] text-blue-200 font-semibold">Smart Driver Pass & Navigator</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  {currentPlate}
                </span>
              </div>
            </div>

            {/* Quick 1-Hour Fixed Rate Banner */}
            <div className="mt-3 bg-black/25 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between text-xs border border-white/10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-bold">Standard Parking Rate:</span>
              </div>
              <strong className="font-mono text-emerald-300 text-sm font-black">₹ 30.00 / 1 hr</strong>
            </div>
          </div>

          {/* Active Parking HUD for Mobile Driver */}
          {userBooking.active && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3.5 flex items-center justify-between gap-3 shadow-inner">
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider text-blue-200 block">YOU ARE PARKED IN</span>
                <strong className="text-sm font-black">{userBooking.slotId}</strong>
                <span className="text-xs text-blue-100 ml-2 font-mono">({userDuration} • ₹{userCost.toFixed(2)})</span>
              </div>

              <button
                type="button"
                onClick={onCancelBooking}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer"
              >
                Leave Bay
              </button>
            </div>
          )}

          {/* Mobile Screen Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* TAB 1: HOME */}
            {mobileTab === 'home' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Quick Action Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onQuickPark}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-left shadow-md shadow-emerald-500/20 cursor-pointer transition-transform active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-xs font-black block">1-Tap Park</span>
                    <span className="text-[10px] text-emerald-100 font-semibold">Reserve nearest free bay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('map')}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-left shadow-md shadow-blue-500/20 cursor-pointer transition-transform active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black block">Find on Map</span>
                    <span className="text-[10px] text-blue-100 font-semibold">Live GPS vacancy finder</span>
                  </button>
                </div>

                {/* Nearby Lots Snapshot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Nearby Facilities</span>
                    <button 
                      type="button" 
                      onClick={() => setMobileTab('map')}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      View Map &gt;
                    </button>
                  </div>

                  {PARKING_FACILITIES.slice(0, 3).map(f => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedFacility(f);
                        setMobileTab('rates');
                      }}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-xs">
                          P
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{f.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {f.distanceKm === 0 ? 'Current IoT Hub' : `${f.distanceKm} km away`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-emerald-700 block">₹{f.ratePerHour}/hr</span>
                        <span className="text-[10px] font-bold text-slate-400">Tap for Tariff</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Last Digital Ticket Preview */}
                {latestRecord && (
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Recent Verified Pass</span>
                        <strong className="text-xs font-mono text-slate-900">{latestRecord.ticketId}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewReceipt(latestRecord)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Slip
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MAP */}
            {mobileTab === 'map' && (
              <div className="space-y-3 animate-in fade-in">
                <FacilityMap
                  activeFacilityId={selectedFacility.id}
                  onSelectFacility={(fac) => {
                    setSelectedFacility(fac);
                    setMobileTab('rates');
                  }}
                  liveLotVacantCount={liveLotVacantCount}
                  liveLotTotalCount={liveLotTotalCount}
                />
              </div>
            )}

            {/* TAB 3: TARIFF CALCULATOR */}
            {mobileTab === 'rates' && (
              <div className="space-y-3 animate-in fade-in">
                <CostEstimator
                  facility={selectedFacility}
                  onReserveDuration={() => setMobileTab('home')}
                />
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="bg-white border-t border-slate-200 p-2 flex items-center justify-around text-xs">
            <button
              type="button"
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
                mobileTab === 'home' ? 'text-blue-600 font-black' : 'text-slate-500'
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="text-[10px]">Driver Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
                mobileTab === 'map' ? 'text-blue-600 font-black' : 'text-slate-500'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-[10px]">Find Bays</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('rates')}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
                mobileTab === 'rates' ? 'text-blue-600 font-black' : 'text-slate-500'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px]">1-Hr Rates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
