import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { HourlyDisplayCard } from './components/HourlyDisplayCard';
import { DemoPanel } from './components/DemoPanel';
import { FloorSimulator } from './components/FloorSimulator';
import { HardwareControlBar } from './components/HardwareControlBar';
import { FacilityMap } from './components/FacilityMap';
import { CostEstimator } from './components/CostEstimator';
import { AdminPortal } from './components/AdminPortal';
import { UserMobileApp } from './components/UserMobileApp';
import { AuditTable } from './components/AuditTable';
import { BookingModal } from './components/BookingModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ArduinoGuideModal } from './components/ArduinoGuideModal';
import { TerminalDrawer } from './components/TerminalDrawer';
import { useWebSerial } from './hooks/useWebSerial';
import { useAudioVoice } from './hooks/useAudioVoice';
import { INITIAL_FLOORS, getRandomPlate } from './data/constants';
import { PARKING_FACILITIES } from './data/facilitiesData';
import { 
  fetchAllVehicleRecords, 
  insertVehicleRecord, 
  logSystemEvent 
} from './services/supabaseClient';

export default function App() {
  // Navigation View: 'bays' (2D Simulator), 'map' (City Map), 'mobile' (Driver App), 'admin' (Web Admin)
  const [activeView, setActiveView] = useState('bays');
  const [selectedFacility, setSelectedFacility] = useState(PARKING_FACILITIES[0]);

  // Primary Telemetry State
  const [distance, setDistance] = useState(18.0);
  const [status, setStatus] = useState('VACANT');
  const [statusSince, setStatusSince] = useState(Date.now());
  const [statusDuration, setStatusDuration] = useState('00:00:00');

  // Billing & Revenue State
  const [billingRate, setBillingRate] = useState(30.0); // ₹30/hr standard rate
  const [fastDemoRate, setFastDemoRate] = useState(true); // ₹0.50/s for exciting demos
  const [activeParkStart, setActiveParkStart] = useState(null);
  const [runningFare, setRunningFare] = useState(0.0);
  const [totalRevenue, setTotalRevenue] = useState(0.0);
  const [ticketSeq, setTicketSeq] = useState(1);
  const [currentPlate, setCurrentPlate] = useState('DL 01 AB 4589');

  // Multi-Floor Simulator State
  const [floors, setFloors] = useState(INITIAL_FLOORS);
  const [selectedFloor, setSelectedFloor] = useState('L1');
  const [userBooking, setUserBooking] = useState({
    active: false,
    floor: null,
    slotId: null,
    plate: null,
    start: null
  });
  const [userDuration, setUserDuration] = useState('00:00:00');
  const [userCost, setUserCost] = useState(0.0);

  // Simulation Mode State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  const autoCycleRef = useRef(null);

  // Terminal & Database Audit State
  const [terminalLines, setTerminalLines] = useState([
    { time: new Date().toLocaleTimeString(), text: 'ParkSense IoT Full Ecosystem Active.', type: 'system' },
    { time: new Date().toLocaleTimeString(), text: 'Supabase Real-Time Database Client Initialized.', type: 'system' },
    { time: new Date().toLocaleTimeString(), text: 'C++ Arduino Firmware (parking_sensor.ino) compatible at 9600 baud.', type: 'system' }
  ]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [autoScrollTerminal, setAutoScrollTerminal] = useState(true);
  const [auditRecords, setAuditRecords] = useState([]);

  // Modals
  const [bookingModal, setBookingModal] = useState({ isOpen: false, targetSlot: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, record: null });
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Audio & Voice Assistant
  const {
    soundEnabled,
    setSoundEnabled,
    voiceEnabled,
    setVoiceEnabled,
    voiceLanguage,
    setVoiceLanguage,
    isSpeaking,
    playChime,
    speakAlert
  } = useAudioVoice();

  // Terminal logger callback
  const logTerminal = useCallback((text, type = 'normal') => {
    const time = new Date().toLocaleTimeString();
    setTerminalLines(prev => [...prev.slice(-120), { time, text, type }]);
  }, []);

  // Load records from Supabase / LocalStorage on mount
  const refreshRecordsFromDb = useCallback(async () => {
    try {
      const dbRecords = await fetchAllVehicleRecords();
      if (dbRecords && dbRecords.length > 0) {
        setAuditRecords(dbRecords);
        // Calculate cumulative revenue
        const total = dbRecords.reduce((acc, r) => acc + (parseFloat(r.totalAmount) || 0), 0);
        setTotalRevenue(total);
      }
    } catch (e) {
      console.warn('Error loading records from database:', e);
    }
  }, []);

  useEffect(() => {
    refreshRecordsFromDb();
  }, [refreshRecordsFromDb]);

  // Web Serial Hook
  const {
    isConnected,
    connect: connectSerial,
    disconnect: disconnectSerial,
    sendCommand
  } = useWebSerial({
    onLineReceived: (line) => handleSerialLine(line),
    onLog: logTerminal
  });

  // Calculate live vacancies across all 3 floors for facility map synchronization
  const totalSpotsAcrossFloors = Object.values(floors).reduce(
    (acc, f) => acc + Object.keys(f.slots).length, 0
  );
  const vacantSpotsAcrossFloors = Object.values(floors).reduce(
    (acc, f) => acc + Object.values(f.slots).filter(s => s.status === 'VACANT').length, 0
  );

  // Calculate fees helper
  const calculateFee = useCallback((startMs) => {
    if (!startMs) return 0;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startMs) / 1000));
    if (fastDemoRate) {
      return Math.max(5.0, elapsedSeconds * 0.50);
    } else {
      return Math.max(15.0, (elapsedSeconds / 3600) * billingRate);
    }
  }, [fastDemoRate, billingRate]);

  // Complete a parking session and save to Supabase database
  const completeSession = useCallback(async (slotName, plateNumber, startMs) => {
    const entryDate = new Date(startMs || Date.now());
    const exitDate = new Date();
    const elapsedSeconds = Math.max(1, Math.round((exitDate.getTime() - entryDate.getTime()) / 1000));

    const baseFare = calculateFee(startMs);
    const tax = baseFare * 0.05; // 5% GST
    const totalAmount = baseFare + tax;

    const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    const durationStr = `${hrs}:${mins}:${secs}`;

    const ticketId = `#PS-2026-${ticketSeq.toString().padStart(3, '0')}`;
    setTicketSeq(prev => prev + 1);
    setTotalRevenue(prev => prev + totalAmount);

    const record = {
      ticketId,
      plate: plateNumber,
      bay: slotName,
      entryTime: entryDate.toLocaleTimeString(),
      exitTime: exitDate.toLocaleTimeString(),
      duration: durationStr,
      baseFare: baseFare.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      status: 'PAID'
    };

    // Save to Supabase Cloud & Local Storage
    const updatedList = await insertVehicleRecord(record);
    setAuditRecords(updatedList);
    setReceiptModal({ isOpen: true, record });
    logTerminal(`[Supabase DB] Saved vehicle checkout: ${plateNumber} (Total: ₹${record.totalAmount})`, 'system');
    logSystemEvent('CHECKOUT', `Vehicle ${plateNumber} vacated ${slotName}`, { totalAmount, durationStr });

    return record;
  }, [calculateFee, ticketSeq, logTerminal]);

  // Parse incoming line from Arduino C++ serial stream
  const handleSerialLine = useCallback((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    let lineType = 'normal';
    if (line.includes('OCCUPIED')) lineType = 'occupied';
    else if (line.includes('VACANT')) lineType = 'vacant';
    else if (line.includes('[CMD]')) lineType = 'cmd';

    logTerminal(line, lineType);

    // 1. Distance match: "Distance: X.X cm"
    const distMatch = line.match(/^Distance:\s*([\d.]+)\s*cm/i);
    if (distMatch) {
      const dist = parseFloat(distMatch[1]);
      setDistance(dist);
      return;
    }

    // 2. Status match: "Parking Status: ..."
    const statusMatch = line.match(/^Parking Status:\s*(.*)/i);
    if (statusMatch) {
      const newStatus = statusMatch[1].trim().toUpperCase();
      handleStatusChange(newStatus);
    }
  }, [logTerminal]);

  // Handle status transitions
  const handleStatusChange = useCallback((newStatus) => {
    setStatus(prevStatus => {
      if (prevStatus === newStatus) return prevStatus;

      setStatusSince(Date.now());

      if (newStatus === 'OCCUPIED') {
        playChime('occupied');
        speakAlert('arrival');
        setActiveParkStart(Date.now());

        // Sync with Hardware Slot L1-01
        setFloors(prevFloors => {
          const updated = { ...prevFloors };
          if (updated.L1 && updated.L1.slots['L1-01']) {
            updated.L1.slots['L1-01'] = {
              ...updated.L1.slots['L1-01'],
              status: 'OCCUPIED',
              plate: currentPlate,
              start: Date.now()
            };
          }
          return updated;
        });

      } else if (newStatus === 'VACANT') {
        playChime('vacant');
        speakAlert('departure');

        // Complete billing for L1-01 if active
        if (activeParkStart) {
          completeSession('Bay L1-01 (IoT Sensor)', currentPlate, activeParkStart);
          setActiveParkStart(null);
          setRunningFare(0.0);
          setCurrentPlate(getRandomPlate());
        }

        // Sync with Hardware Slot L1-01
        setFloors(prevFloors => {
          const updated = { ...prevFloors };
          if (updated.L1 && updated.L1.slots['L1-01']) {
            updated.L1.slots['L1-01'] = {
              ...updated.L1.slots['L1-01'],
              status: 'VACANT',
              start: null
            };
          }
          return updated;
        });
      }

      return newStatus;
    });
  }, [playChime, speakAlert, currentPlate, activeParkStart, completeSession]);

  // Second Ticker for duration and live fare
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Bay 01 State Duration
      const elapsedTotalSec = Math.floor((Date.now() - statusSince) / 1000);
      const h = Math.floor(elapsedTotalSec / 3600).toString().padStart(2, '0');
      const m = Math.floor((elapsedTotalSec % 3600) / 60).toString().padStart(2, '0');
      const s = (elapsedTotalSec % 60).toString().padStart(2, '0');
      setStatusDuration(`${h}:${m}:${s}`);

      // 2. Running Fare for hardware bay
      if (status === 'OCCUPIED' && activeParkStart) {
        setRunningFare(calculateFee(activeParkStart));
      }

      // 3. User Active Booking Duration & Cost
      if (userBooking.active && userBooking.start) {
        const uSec = Math.floor((Date.now() - userBooking.start) / 1000);
        const uh = Math.floor(uSec / 3600).toString().padStart(2, '0');
        const um = Math.floor((uSec % 3600) / 60).toString().padStart(2, '0');
        const us = (uSec % 60).toString().padStart(2, '0');
        setUserDuration(`${uh}:${um}:${us}`);
        setUserCost(calculateFee(userBooking.start));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [statusSince, status, activeParkStart, calculateFee, userBooking]);

  // Demo Simulation Functions
  const emitSimPacket = useCallback((targetDist) => {
    const jitter = (Math.random() - 0.5) * 0.3;
    const actualDist = Math.max(2.0, Math.min(35.0, targetDist + jitter));

    handleSerialLine(`Distance: ${actualDist.toFixed(1)} cm`);
    if (actualDist < 10.0) {
      handleSerialLine('Parking Status: OCCUPIED');
    } else {
      handleSerialLine('Parking Status: VACANT');
    }
  }, [handleSerialLine]);

  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (autoCycleRef.current) {
        clearInterval(autoCycleRef.current);
        autoCycleRef.current = null;
        setIsAutoCycle(false);
      }
      logTerminal('[Simulator] Demo simulation stopped.', 'system');
    } else {
      if (isConnected) disconnectSerial();
      setIsSimulating(true);
      logTerminal('[Simulator] Demo simulation started. Use distance slider or auto cycle.', 'system');
      emitSimPacket(18.0);
    }
  };

  const toggleAutoCycle = () => {
    if (isAutoCycle) {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
      autoCycleRef.current = null;
      setIsAutoCycle(false);
      logTerminal('[Simulator] Auto traffic cycle stopped.', 'system');
    } else {
      setIsAutoCycle(true);
      logTerminal('[Simulator] Auto traffic cycle running...', 'system');
      const scenario = [25.0, 20.0, 15.0, 9.5, 6.0, 4.8, 5.0, 5.2, 8.0, 14.0, 22.0, 28.0];
      let idx = 0;
      autoCycleRef.current = setInterval(() => {
        const d = scenario[idx];
        emitSimPacket(d);
        idx = (idx + 1) % scenario.length;
      }, 1500);
    }
  };

  // Hardware / Simulation Actuator Commands
  const handleHardwareCommand = (cmd) => {
    if (isConnected) {
      sendCommand(cmd);
    } else if (isSimulating) {
      if (cmd === 'O') {
        logTerminal('[Demo Mode] Barrier Raised -> Servo at 90°', 'cmd');
        playChime('vacant');
        if (voiceEnabled) speakAlert('arrival', 'Barrier Gate Opened.');
      } else if (cmd === 'C') {
        logTerminal('[Demo Mode] Barrier Lowered -> Servo at 0°', 'cmd');
        playChime('occupied');
        if (voiceEnabled) speakAlert('departure', 'Barrier Gate Closed.');
      } else if (cmd === 'B') {
        logTerminal('[Demo Mode] Buzzer Alert -> Piezo Sounded.', 'cmd');
        playChime('occupied');
      } else if (cmd === 'T') {
        logTerminal('[Demo Mode] Diagnostic LED Test Pattern Active.', 'cmd');
        playChime('vacant');
      }
    }
  };

  // Floor Slot Click Handler
  const handleSlotClick = (floorId, slotId) => {
    const floor = floors[floorId];
    if (!floor) return;
    const slot = floor.slots[slotId];
    if (!slot) return;

    if (userBooking.active && userBooking.floor === floorId && userBooking.slotId === slotId) {
      if (window.confirm(`Vacate spot ${slot.name} and generate receipt?`)) {
        handleCancelUserBooking();
      }
      return;
    }

    if (slot.status === 'VACANT') {
      setBookingModal({
        isOpen: true,
        targetSlot: {
          id: slot.id,
          name: slot.name,
          floor: floorId,
          floorName: floor.name
        }
      });
    } else {
      logTerminal(`[Notice] ${slot.name} is occupied by vehicle ${slot.plate}.`, 'occupied');
      playChime('occupied');
    }
  };

  // Confirm booking from modal
  const handleConfirmBooking = (plate) => {
    const target = bookingModal.targetSlot;
    if (!target) return;

    if (userBooking.active) {
      setFloors(prev => {
        const u = { ...prev };
        if (u[userBooking.floor] && u[userBooking.floor].slots[userBooking.slotId]) {
          u[userBooking.floor].slots[userBooking.slotId] = {
            ...u[userBooking.floor].slots[userBooking.slotId],
            status: 'VACANT',
            plate: null,
            start: null
          };
        }
        return u;
      });
    }

    const now = Date.now();
    setFloors(prev => {
      const u = { ...prev };
      if (u[target.floor] && u[target.floor].slots[target.id]) {
        u[target.floor].slots[target.id] = {
          ...u[target.floor].slots[target.id],
          status: 'OCCUPIED',
          plate,
          start: now
        };
      }
      return u;
    });

    setUserBooking({
      active: true,
      floor: target.floor,
      slotId: target.id,
      plate,
      start: now
    });

    setBookingModal({ isOpen: false, targetSlot: null });
    playChime('occupied');

    const msg = voiceLanguage === 'hi' 
      ? `पार्किंग स्लॉट ${target.name} बुक हो गया है।` 
      : `Spot ${target.name} reserved for vehicle ${plate}.`;
    speakAlert('arrival', msg);
    logTerminal(`[Simulator] Parked ${plate} in ${target.name} (${target.floorName}).`, 'system');
  };

  // Cancel User Active Booking
  const handleCancelUserBooking = () => {
    if (!userBooking.active) return;

    const floor = floors[userBooking.floor];
    const slot = floor?.slots[userBooking.slotId];

    if (slot) {
      completeSession(slot.name, userBooking.plate, userBooking.start);
    }

    setFloors(prev => {
      const u = { ...prev };
      if (u[userBooking.floor] && u[userBooking.floor].slots[userBooking.slotId]) {
        u[userBooking.floor].slots[userBooking.slotId] = {
          ...u[userBooking.floor].slots[userBooking.slotId],
          status: 'VACANT',
          plate: null,
          start: null
        };
      }
      return u;
    });

    setUserBooking({
      active: false,
      floor: null,
      slotId: null,
      plate: null,
      start: null
    });

    playChime('vacant');
    const msg = voiceLanguage === 'hi' 
      ? `आपकी पार्किंग समाप्त हो गई है। धन्यवाद!` 
      : 'Your parking session has ended. Thank you!';
    speakAlert('departure', msg);
  };

  // Quick park in nearest free bay
  const handleQuickPark = () => {
    const floor = floors[selectedFloor];
    const vacantSlot = Object.values(floor?.slots || {}).find(s => s.status === 'VACANT');

    if (vacantSlot) {
      setBookingModal({
        isOpen: true,
        targetSlot: {
          id: vacantSlot.id,
          name: vacantSlot.name,
          floor: selectedFloor,
          floorName: floor.name
        }
      });
    } else {
      for (const fId of ['L1', 'B1', 'L2']) {
        const f = floors[fId];
        const s = Object.values(f.slots).find(sl => sl.status === 'VACANT');
        if (s) {
          setSelectedFloor(fId);
          setBookingModal({
            isOpen: true,
            targetSlot: { id: s.id, name: s.name, floor: fId, floorName: f.name }
          });
          return;
        }
      }
      alert('All parking floors are currently 100% full!');
    }
  };

  // Admin slot modeling update
  const handleUpdateFloorSlot = (floorId, slotId, updates) => {
    setFloors(prev => {
      const u = { ...prev };
      if (u[floorId] && u[floorId].slots[slotId]) {
        u[floorId].slots[slotId] = { ...u[floorId].slots[slotId], ...updates };
      }
      return u;
    });
    logTerminal(`[Admin] Updated ${slotId} on ${floorId} to ${updates.status || 'modified'}.`, 'system');
  };

  // Export audit table to CSV
  const handleExportCsv = () => {
    if (auditRecords.length === 0) return;
    const headers = ['Ticket ID', 'Plate', 'Bay', 'Entry Time', 'Exit Time', 'Duration', 'Base Fare (INR)', 'GST 5% (INR)', 'Total Amount (INR)', 'Status'];
    const rows = auditRecords.map(r => [
      r.ticketId,
      r.plate,
      r.bay,
      r.entryTime,
      r.exitTime,
      r.duration,
      r.baseFare,
      r.tax,
      r.totalAmount,
      r.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ParkSense_Audit_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    logTerminal('[Audit] Exported parking records to CSV spreadsheet.', 'system');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5 p-3 md:p-6 pb-16">
      {/* Top Header Navigation with Multi-Portal View Switcher */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        isConnected={isConnected}
        isSimulating={isSimulating}
        onConnect={() => connectSerial(9600)}
        onDisconnect={disconnectSerial}
        onToggleSim={toggleSimulation}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(v => !v)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(v => !v)}
        voiceLanguage={voiceLanguage}
        onChangeVoiceLanguage={setVoiceLanguage}
        isSpeaking={isSpeaking}
        onOpenGuide={() => setGuideModalOpen(true)}
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(v => !v)}
      />

      {/* Simulation Controls Panel (Visible when Demo Mode is On) */}
      {isSimulating && (
        <DemoPanel
          onCarArrives={() => emitSimPacket(5.0)}
          onCarLeaves={() => emitSimPacket(22.0)}
          isAutoCycle={isAutoCycle}
          onToggleAutoCycle={toggleAutoCycle}
        />
      )}

      {/* Primary Metrics Overview Cards */}
      <MetricsCards
        status={status}
        statusDuration={statusDuration}
        billingRate={billingRate}
        fastDemoRate={fastDemoRate}
        onToggleFastRate={setFastDemoRate}
        runningFare={runningFare}
        currentPlate={currentPlate}
        onRandomizePlate={() => setCurrentPlate(getRandomPlate())}
        totalSessionRevenue={totalRevenue}
        slots={Object.values(floors[selectedFloor]?.slots || {})}
      />

      {/* PORTAL VIEW 1: 2D Floor Architecture, Hardware Actuation & IoT Bay Simulator */}
      {activeView === 'bays' && (
        <>
          {/* Real-Time Hardware 16x2 I2C LCD Display & Hourly Meter */}
          <HourlyDisplayCard
            status={status}
            statusSince={statusSince}
            billingRate={billingRate}
            distance={distance}
            availableSpaces={
              Object.values(floors[selectedFloor]?.slots || {}).filter(s => s.status === 'VACANT').length
            }
            totalSpaces={
              Object.values(floors[selectedFloor]?.slots || {}).length
            }
            onSimulateAdvanceHour={(advanceSec) => {
              logTerminal(`[Hourly Display] Advanced parked time by +1 hour. 16x2 LCD screen triggered hourly alert banner.`, 'system');
              playChime('vacant');
              if (voiceEnabled) {
                speakAlert('arrival', 'One hour completed. Hourly parking tariff updated.');
              }
            }}
          />

          <HardwareControlBar
            isConnected={isConnected}
            isSimulating={isSimulating}
            onSendCommand={handleHardwareCommand}
            onConnect={() => connectSerial(9600)}
            onToggleSim={toggleSimulation}
          />

          <FloorSimulator
            floors={floors}
            selectedFloor={selectedFloor}
            onSelectFloor={setSelectedFloor}
            userBooking={userBooking}
            userDuration={userDuration}
            userCost={userCost}
            onCancelUserBooking={handleCancelUserBooking}
            onSlotClick={handleSlotClick}
            onQuickPark={handleQuickPark}
          />
        </>
      )}

      {/* PORTAL VIEW 2: Interactive GPS Parking Facility Map & 1-Hour Tariff Estimator */}
      {activeView === 'map' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          <FacilityMap
            activeFacilityId={selectedFacility.id}
            onSelectFacility={setSelectedFacility}
            liveLotVacantCount={vacantSpotsAcrossFloors}
            liveLotTotalCount={totalSpotsAcrossFloors}
          />

          <CostEstimator
            facility={selectedFacility}
            onReserveDuration={(bookingInfo) => {
              logTerminal(`[Reservation] Booked ${bookingInfo.hours} hr(s) at ${bookingInfo.facilityName}. Total: ₹${bookingInfo.total}`, 'system');
              playChime('vacant');
              if (voiceEnabled) {
                speakAlert('arrival', `Reservation confirmed for ${bookingInfo.hours} hour at ${bookingInfo.facilityName}.`);
              }
            }}
          />
        </div>
      )}

      {/* PORTAL VIEW 3: Driver Mobile Operator App View */}
      {activeView === 'mobile' && (
        <div className="animate-in fade-in duration-200">
          <UserMobileApp
            userBooking={userBooking}
            userDuration={userDuration}
            userCost={userCost}
            onCancelBooking={handleCancelUserBooking}
            onQuickPark={handleQuickPark}
            currentPlate={currentPlate}
            onViewReceipt={(rec) => setReceiptModal({ isOpen: true, record: rec })}
            latestRecord={auditRecords[0] || null}
            liveLotVacantCount={vacantSpotsAcrossFloors}
            liveLotTotalCount={totalSpotsAcrossFloors}
          />
        </div>
      )}

      {/* PORTAL VIEW 4: Admin Master Web Portal */}
      {activeView === 'admin' && (
        <div className="animate-in fade-in duration-200">
          <AdminPortal
            records={auditRecords}
            onRefreshRecords={refreshRecordsFromDb}
            onViewReceipt={(rec) => setReceiptModal({ isOpen: true, record: rec })}
            onExportCsv={handleExportCsv}
            totalRevenue={totalRevenue}
            floors={floors}
            onUpdateFloorSlot={handleUpdateFloorSlot}
            isConnected={isConnected}
            onSendCommand={sendCommand}
            billingRate={billingRate}
            onChangeBillingRate={setBillingRate}
          />
        </div>
      )}

      {/* Collapsible Serial Terminal Drawer */}
      <TerminalDrawer
        isOpen={showTerminal}
        lines={terminalLines}
        onClear={() => setTerminalLines([])}
        onClose={() => setShowTerminal(false)}
        autoScroll={autoScrollTerminal}
        onToggleAutoScroll={setAutoScrollTerminal}
      />

      {/* Parking Audit & Receipts Table */}
      <AuditTable
        records={auditRecords}
        onExportCsv={handleExportCsv}
        onClearRecords={() => setAuditRecords([])}
        onViewReceipt={(rec) => setReceiptModal({ isOpen: true, record: rec })}
      />

      {/* Modals */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        targetSlot={bookingModal.targetSlot}
        initialPlate={currentPlate}
        onClose={() => setBookingModal({ isOpen: false, targetSlot: null })}
        onConfirm={handleConfirmBooking}
      />

      <ReceiptModal
        isOpen={receiptModal.isOpen}
        record={receiptModal.record}
        onClose={() => setReceiptModal({ isOpen: false, record: null })}
      />

      <ArduinoGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}
