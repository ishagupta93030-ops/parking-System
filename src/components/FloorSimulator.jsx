import React from 'react';
import { 
  Car, 
  Plus, 
  X, 
  Zap, 
  MapPin, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CarSvg } from './CarSvg';

export function FloorSimulator({
  floors,
  selectedFloor,
  onSelectFloor,
  userBooking,
  userDuration,
  userCost,
  onCancelUserBooking,
  onSlotClick,
  onQuickPark
}) {
  const currentFloor = floors[selectedFloor] || floors.L1;
  const slotList = Object.values(currentFloor.slots || {});

  const vacantCount = slotList.filter(s => s.status === 'VACANT').length;
  const occupiedCount = slotList.filter(s => s.status === 'OCCUPIED').length;

  return (
    <section className="card-panel p-5 md:p-6 relative overflow-hidden">
      {/* Floor Switcher Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Parking Lot Architecture & Real-Time Bays
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mt-0.5">
            Select floor level, view live occupancy, and click any green spot to park.
          </p>
        </div>

        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onSelectFloor('B1')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              selectedFloor === 'B1' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Basement (B1)
          </button>
          <button
            onClick={() => onSelectFloor('L1')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              selectedFloor === 'L1' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Ground (Main & IoT)
          </button>
          <button
            onClick={() => onSelectFloor('L2')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all cursor-pointer ${
              selectedFloor === 'L2' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Level 2 (Rooftop)
          </button>
        </div>
      </div>

      {/* User Active Parking Notice Card (HUD) */}
      <div className="mb-5">
        {userBooking?.active ? (
          <div className="bg-blue-50/90 border-2 border-blue-300 p-4 md:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Car className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  YOUR ACTIVE SPOT
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-900 mt-0.5">
                  {userBooking.slotId}{' '}
                  <span className="text-xs md:text-sm font-bold text-slate-600">
                    ({floors[userBooking.floor]?.name || userBooking.floor})
                  </span>
                </h3>
                <span className="text-xs font-semibold text-slate-600">
                  Car Plate: <strong className="text-slate-900 font-mono">{userBooking.plate}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-4 text-sm font-bold shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Parked Time:</span>
                  <span className="font-mono text-slate-900 text-base">{userDuration}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Bill:</span>
                  <span className="font-mono text-blue-700 text-base">₹ {userCost.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onCancelUserBooking}
                className="px-5 py-3 rounded-xl text-xs md:text-sm font-black tracking-wide text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Cancel Parking / Leave Spot</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sm shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block">You currently have no active parking.</span>
                <span className="text-xs text-slate-500 font-semibold">
                  Click on any <strong className="text-emerald-700 font-bold">GREEN (Free)</strong> bay below to park your car with 1-click.
                </span>
              </div>
            </div>

            <button
              onClick={onQuickPark}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Quick Park in Nearest Bay</span>
            </button>
          </div>
        )}
      </div>

      {/* Floor Status Bar & Visual Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-bold">
        <div className="flex items-center gap-4">
          <span className="text-emerald-700 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <strong>{vacantCount}</strong> Free Spots
          </span>
          <span className="text-rose-700 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <strong>{occupiedCount}</strong> Taken
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold">
          <span className="flex items-center gap-1.5 text-emerald-800">
            <span className="w-3.5 h-3.5 rounded border-2 border-emerald-500 bg-emerald-100" />
            🟢 GREEN = Free to Park
          </span>
          <span className="flex items-center gap-1.5 text-rose-800">
            <span className="w-3.5 h-3.5 rounded border-2 border-rose-500 bg-rose-100" />
            🔴 RED = Occupied
          </span>
          <span className="flex items-center gap-1.5 text-amber-800">
            <span className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-100" />
            ⚠️ AMBER = Sensor Fault
          </span>
          <span className="flex items-center gap-1.5 text-blue-800">
            <span className="w-3.5 h-3.5 rounded border-2 border-blue-600 bg-blue-100" />
            🔵 BLUE = Your Car
          </span>
        </div>
      </div>

      {/* 2D Top-Down Architectural Layout Grid */}
      <div className="bg-slate-900 rounded-2xl p-5 md:p-6 shadow-inner overflow-x-auto">
        <div className="min-w-[620px] max-w-4xl mx-auto flex flex-col gap-5">
          {/* Driveway with Lane Markings and Entry / Exit Gates */}
          <div className="h-16 rounded-xl bg-slate-800/90 border-2 border-dashed border-slate-700 flex items-center justify-between px-6 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-black text-emerald-400 font-mono tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-emerald-500/40">
                ENTRY GATE
              </span>
            </div>

            <div className="flex items-center gap-2 text-amber-400 font-black text-[11px] tracking-widest font-mono">
              <span>&gt;&gt;&gt;</span>
              <span>ONE-WAY COMMERCIAL DRIVEWAY</span>
              <span>&gt;&gt;&gt;</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-rose-400 font-mono tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-rose-500/40">
                EXIT GATE
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
          </div>

          {/* 3 Parking Bays Grid */}
          <div className="grid grid-cols-3 gap-5">
            {slotList.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                floorId={selectedFloor}
                userBooking={userBooking}
                onClick={() => onSlotClick(selectedFloor, slot.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SlotCard({ slot, floorId, userBooking, onClick }) {
  const isFault = slot.status === 'SENSOR_ERROR' || slot.sensorHealth === 'FAULT';
  const isOccupied = !isFault && slot.status === 'OCCUPIED';
  const isUserSpot = userBooking?.active && userBooking.floor === floorId && userBooking.slotId === slot.id;

  let cardClasses = 'top-slot-card ';
  if (isFault) cardClasses += 'no_reading border-2 border-amber-500/80 bg-amber-950/30 ';
  else if (isUserSpot) cardClasses += 'user-spot';
  else if (isOccupied) cardClasses += 'occupied';
  else cardClasses += 'vacant';

  const carColor = isUserSpot ? 'blue' : (slot.carColor || 'ruby');

  return (
    <div className={cardClasses} onClick={isFault ? undefined : onClick}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-extrabold text-sm text-slate-100">{slot.name}</span>
          {slot.isHardware && (
            <span className="text-[9px] font-black text-blue-300 bg-blue-950/80 border border-blue-500/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-blue-400" />
              IOT BAY
            </span>
          )}
        </div>

        {isFault ? (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-500/60 animate-pulse">
            ⚠️ SENSOR FAULT
          </span>
        ) : isUserSpot ? (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
            ⭐ YOUR CAR
          </span>
        ) : isOccupied ? (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
            🔴 TAKEN
          </span>
        ) : (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            🟢 FREE
          </span>
        )}
      </div>

      {/* Center Body Visual */}
      <div className="my-auto py-2">
        {isFault ? (
          <div className="flex flex-col items-center justify-center text-center py-4 text-amber-400">
            <div className="w-10 h-10 rounded-full bg-amber-950/80 border-2 border-amber-500 flex items-center justify-center text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
              SENSOR OFFLINE
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Readings Paused</span>
          </div>
        ) : isOccupied ? (
          <CarSvg colorScheme={carColor} isUserCar={isUserSpot} />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="text-xs font-black text-emerald-400 tracking-wide uppercase">
              CLICK TO PARK
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Available Bay</span>
          </div>
        )}
      </div>

      {/* Footer Tag */}
      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
        {isFault ? (
          <>
            <span className="font-mono text-amber-400 font-bold text-[10px]">CHECK SENSOR</span>
            <span className="text-slate-400 font-mono text-[10px]">
              Thresh: {slot.threshold ? `${slot.threshold.toFixed(0)}cm` : '10cm'}
            </span>
          </>
        ) : isUserSpot ? (
          <>
            <span className="font-mono font-bold text-blue-300">{slot.plate}</span>
            <span className="text-rose-400 font-extrabold hover:underline">Leave Spot</span>
          </>
        ) : isOccupied ? (
          <>
            <span className="font-mono font-bold text-slate-300">{slot.plate || 'PARKED'}</span>
            <span className="text-slate-400 font-mono text-[10px]">Active</span>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-emerald-400/80 font-bold text-[11px]">
            <span>Ready to Reserve</span>
            <span className="text-slate-500 font-mono text-[10px]">
              Thresh: {slot.threshold ? `${slot.threshold.toFixed(0)}cm` : '10cm'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
