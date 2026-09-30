/**
 * ParkSense IoT - Commercial Smart Parking System Web Application
 * Web Serial API Stream Reader, Line-buffered Parser, Canvas Telemetry Chart,
 * Dynamic 2.5D Bay Visualizer, Proximity Radar, Multi-Bay Grid, Live Billing &
 * Fare Calculator, AI Voice Assistant, Digital QR Receipt Generator, and CSV Exporter.
 */

// ============================================================================
// Global Application State
// ============================================================================
const state = {
  isConnected: false,
  isSimulating: false,
  soundEnabled: true,
  voiceEnabled: true,
  voiceLanguage: 'en', // 'en' or 'hi'
  lastVoiceSpoken: { type: null, timestamp: 0 },
  currentDistance: null,
  currentStatus: 'VACANT',
  lastStatus: null,
  totalParkings: 0,
  minDistance: null,
  maxDistance: null,
  packetCount: 0,
  statusSince: Date.now(),
  history: [], // { time: Date, distance: number }
  maxHistory: 35,
  simInterval: null,
  simAutoInterval: null,
  serialPort: null,
  serialReader: null,
  serialKeepReading: false,

  // Smart Billing & Tariff
  billing: {
    ratePerHour: 30.0, // ₹30/hour
    fastDemoRate: true, // ₹0.50/sec in demo mode for instant visual excitement
    activeParkStart: null,
    currentPlate: 'DL 01 AB 4589',
    currentRunningFee: 0.0,
    totalSessionRevenue: 0.0,
    ticketSequence: 1
  },

  // Commercial Multi-Bay Status (4 Bays)
  slots: {
    A01: { id: 'A01', name: 'Bay A-01', plate: 'DL 01 AB 4589', status: 'VACANT', start: null, isHardware: true },
    A02: { id: 'A02', name: 'Bay A-02', plate: 'HR 26 DQ 7810', status: 'VACANT', start: null, isHardware: false },
    A03: { id: 'A03', name: 'Bay A-03', plate: 'UP 16 BZ 9022', status: 'VACANT', start: null, isHardware: false },
    A04: { id: 'A04', name: 'Bay A-04', plate: 'MH 02 CK 3341', status: 'VACANT', start: null, isHardware: false }
  },

  // Session Parking Audit Records
  auditRecords: [],

  // Multi-Floor 2D Top-View Facility Simulator
  simulator: {
    selectedFloor: 'L1', // 'B1', 'L1', 'L2'
    pendingBookingSlot: null,
    userBooking: {
      active: false,
      floor: null,
      slotId: null,
      plate: null,
      start: null,
      carColor: 'cyan'
    },
    floors: {
      B1: {
        id: 'B1',
        name: 'Basement Level (B1)',
        slots: {
          'B1-01': { id: 'B1-01', name: 'Bay B1-01', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'emerald' },
          'B1-02': { id: 'B1-02', name: 'Bay B1-02', floor: 'B1', status: 'OCCUPIED', plate: 'MH 12 PK 3410', start: Date.now() - 154000, carColor: 'ruby' },
          'B1-03': { id: 'B1-03', name: 'Bay B1-03', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'amber' },
          'B1-04': { id: 'B1-04', name: 'Bay B1-04', floor: 'B1', status: 'OCCUPIED', plate: 'KA 03 MX 9081', start: Date.now() - 340000, carColor: 'blue' },
          'B1-05': { id: 'B1-05', name: 'Bay B1-05', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'violet' },
          'B1-06': { id: 'B1-06', name: 'Bay B1-06', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'cyan' },
          'B1-07': { id: 'B1-07', name: 'Bay B1-07', floor: 'B1', status: 'OCCUPIED', plate: 'RJ 14 CC 8820', start: Date.now() - 95000, carColor: 'amber' },
          'B1-08': { id: 'B1-08', name: 'Bay B1-08', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'ruby' }
        }
      },
      L1: {
        id: 'L1',
        name: 'Level 1 (Ground & IoT)',
        slots: {
          'L1-01': { id: 'L1-01', name: 'Bay L1-01', floor: 'L1', status: 'VACANT', plate: 'DL 01 AB 4589', start: null, isHardware: true, carColor: 'cyan' },
          'L1-02': { id: 'L1-02', name: 'Bay L1-02', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'blue' },
          'L1-03': { id: 'L1-03', name: 'Bay L1-03', floor: 'L1', status: 'OCCUPIED', plate: 'UP 16 BZ 9022', start: Date.now() - 210000, carColor: 'ruby' },
          'L1-04': { id: 'L1-04', name: 'Bay L1-04', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'violet' },
          'L1-05': { id: 'L1-05', name: 'Bay L1-05', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'emerald' },
          'L1-06': { id: 'L1-06', name: 'Bay L1-06', floor: 'L1', status: 'OCCUPIED', plate: 'HR 26 DQ 7810', start: Date.now() - 430000, carColor: 'amber' },
          'L1-07': { id: 'L1-07', name: 'Bay L1-07', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'ruby' },
          'L1-08': { id: 'L1-08', name: 'Bay L1-08', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'cyan' }
        }
      },
      L2: {
        id: 'L2',
        name: 'Level 2 (Rooftop Deck)',
        slots: {
          'L2-01': { id: 'L2-01', name: 'Bay L2-01', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'amber' },
          'L2-02': { id: 'L2-02', name: 'Bay L2-02', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'ruby' },
          'L2-03': { id: 'L2-03', name: 'Bay L2-03', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'cyan' },
          'L2-04': { id: 'L2-04', name: 'Bay L2-04', floor: 'L2', status: 'OCCUPIED', plate: 'CH 01 BG 5543', start: Date.now() - 580000, carColor: 'violet' },
          'L2-05': { id: 'L2-05', name: 'Bay L2-05', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'emerald' },
          'L2-06': { id: 'L2-06', name: 'Bay L2-06', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'ruby' },
          'L2-07': { id: 'L2-07', name: 'Bay L2-07', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'blue' },
          'L2-08': { id: 'L2-08', name: 'Bay L2-08', floor: 'L2', status: 'OCCUPIED', plate: 'DL 08 AX 7219', start: Date.now() - 190000, carColor: 'amber' }
        }
      }
    }
  }
};

// Realistic License Plates Generator
const samplePlates = [
  'DL 01 AB 4589', 'MH 12 PK 3410', 'KA 03 MX 9081', 'HR 26 DQ 7810',
  'UP 16 BZ 9022', 'DL 08 AX 7219', 'CH 01 BG 5543', 'RJ 14 CC 8820'
];

function getRandomPlate() {
  return samplePlates[Math.floor(Math.random() * samplePlates.length)];
}

// ============================================================================
// Web Audio API Chimes
// ============================================================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChime(type) {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'occupied') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(587, now + 0.09);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'vacant') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    console.warn('Audio feedback failed:', err);
  }
}

// ============================================================================
// Web Speech Synthesis (AI Voice Assistant)
// ============================================================================
function speakAlert(type) {
  if (!state.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  const now = Date.now();
  // Prevent repeating same voice alert within 3 seconds
  if (state.lastVoiceSpoken.type === type && (now - state.lastVoiceSpoken.timestamp < 3000)) {
    return;
  }
  state.lastVoiceSpoken = { type, timestamp: now };

  let text = '';
  const lang = state.voiceLanguage;

  if (lang === 'hi') {
    if (type === 'arrival') {
      text = 'नमस्ते! बे नंबर एक में गाड़ी डिटेक्ट हुई है।';
    } else if (type === 'danger') {
      text = 'सावधान! गाड़ी बहुत पास है, कृपया रुकें।';
    } else if (type === 'departure') {
      text = 'स्लॉट ए 1 अब खाली है। धन्यवाद!';
    }
  } else {
    if (type === 'arrival') {
      text = 'Welcome! Vehicle detected in Bay 01.';
    } else if (type === 'danger') {
      text = 'Warning: Obstacle within 10 centimeters. Please stop.';
    } else if (type === 'departure') {
      text = 'Slot A-01 is now vacant. Thank you!';
    }
  }

  if (!text) return;

  try {
    window.speechSynthesis.cancel(); // cancel any active queue
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    // Visual button glow effect during speech
    if (elements.voiceToggleBtn) {
      elements.voiceToggleBtn.classList.add('voice-speaking-pulse');
      utterance.onend = () => elements.voiceToggleBtn.classList.remove('voice-speaking-pulse');
      utterance.onerror = () => elements.voiceToggleBtn.classList.remove('voice-speaking-pulse');
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
}

// ============================================================================
// DOM Elements Map
// ============================================================================
const elements = {
  // Top Navbar
  connectionBadge: document.getElementById('connectionBadge'),
  connectionStatusText: document.getElementById('connectionStatusText'),
  connectBtn: document.getElementById('connectBtn'),
  connectBtnText: document.getElementById('connectBtnText'),
  baudRateSelect: document.getElementById('baudRateSelect'),
  simToggleBtn: document.getElementById('simToggleBtn'),
  simBtnText: document.getElementById('simBtnText'),
  voiceToggleBtn: document.getElementById('voiceToggleBtn'),
  voiceBtnText: document.getElementById('voiceBtnText'),
  voiceLangSelect: document.getElementById('voiceLangSelect'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  soundIconOn: document.getElementById('soundIconOn'),
  soundIconOff: document.getElementById('soundIconOff'),
  guideModalBtn: document.getElementById('guideModalBtn'),
  guideModal: document.getElementById('guideModal'),
  closeGuideModalBtn: document.getElementById('closeGuideModalBtn'),
  guideOkBtn: document.getElementById('guideOkBtn'),

  // Simulation Controls
  simPanel: document.getElementById('simPanel'),
  simDistanceSlider: document.getElementById('simDistanceSlider'),
  simSliderValue: document.getElementById('simSliderValue'),
  simCarArrivesBtn: document.getElementById('simCarArrivesBtn'),
  simCarLeavesBtn: document.getElementById('simCarLeavesBtn'),
  simAutoCycleBtn: document.getElementById('simAutoCycleBtn'),

  // Key Metrics Cards
  bayStatusCard: document.getElementById('bayStatusCard'),
  statusDisplay: document.getElementById('statusDisplay'),
  statusHint: document.getElementById('statusHint'),
  statusSymbol: document.getElementById('statusSymbol'),
  stateDurationTimer: document.getElementById('stateDurationTimer'),
  distanceNumber: document.getElementById('distanceNumber'),
  proximityPill: document.getElementById('proximityPill'),
  proximityText: document.getElementById('proximityText'),
  distanceProgressFill: document.getElementById('distanceProgressFill'),

  // Smart Billing Card
  liveBillingCard: document.getElementById('liveBillingCard'),
  liveFareDisplay: document.getElementById('liveFareDisplay'),
  livePlateDisplay: document.getElementById('livePlateDisplay'),
  totalRevenueDisplay: document.getElementById('totalRevenueDisplay'),
  fastDemoRateCheck: document.getElementById('fastDemoRateCheck'),
  billingRateBadge: document.getElementById('billingRateBadge'),

  // Analytics Card
  lastPacketTime: document.getElementById('lastPacketTime'),
  totalParkingsCount: document.getElementById('totalParkingsCount'),
  minDistanceObserved: document.getElementById('minDistanceObserved'),
  maxDistanceObserved: document.getElementById('maxDistanceObserved'),
  packetCount: document.getElementById('packetCount'),

  // 2.5D Bay Visualizer
  bayStateTag: document.getElementById('bayStateTag'),
  carVisual: document.getElementById('carVisual'),
  distanceLaserLine: document.getElementById('distanceLaserLine'),
  laserTagText: document.getElementById('laserTagText'),
  bayWatermark: document.getElementById('bayWatermark'),
  sonarBeams: document.getElementById('sonarBeams'),

  // Radial Gauge
  gaugeActiveArc: document.getElementById('gaugeActiveArc'),
  gaugeNum: document.getElementById('gaugeNum'),
  zoneBadge: document.getElementById('zoneBadge'),

  // Multi-Bay Lot Section
  lotVacantCount: document.getElementById('lotVacantCount'),
  lotOccupiedCount: document.getElementById('lotOccupiedCount'),
  lotUtilizationFill: document.getElementById('lotUtilizationFill'),
  lotUtilizationText: document.getElementById('lotUtilizationText'),
  toggleBayBtnA02: document.getElementById('toggleBayBtn-A02'),
  toggleBayBtnA03: document.getElementById('toggleBayBtn-A03'),
  toggleBayBtnA04: document.getElementById('toggleBayBtn-A04'),

  // Telemetry Chart
  telemetryChart: document.getElementById('telemetryChart'),

  // Terminal Console
  terminalWindow: document.getElementById('terminalWindow'),
  autoScrollCheck: document.getElementById('autoScrollCheck'),
  clearConsoleBtn: document.getElementById('clearConsoleBtn'),
  serialPortInfo: document.getElementById('serialPortInfo'),

  // Audit Table & CSV
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  clearAuditBtn: document.getElementById('clearAuditBtn'),
  auditTableBody: document.getElementById('auditTableBody'),
  emptyAuditRow: document.getElementById('emptyAuditRow'),

  // Digital Ticket Modal
  receiptModal: document.getElementById('receiptModal'),
  receiptPrintArea: document.getElementById('receiptPrintArea'),
  receiptTicketId: document.getElementById('receiptTicketId'),
  receiptPlate: document.getElementById('receiptPlate'),
  receiptBay: document.getElementById('receiptBay'),
  receiptEntryTime: document.getElementById('receiptEntryTime'),
  receiptExitTime: document.getElementById('receiptExitTime'),
  receiptDuration: document.getElementById('receiptDuration'),
  receiptBaseFare: document.getElementById('receiptBaseFare'),
  receiptTax: document.getElementById('receiptTax'),
  receiptTotalAmount: document.getElementById('receiptTotalAmount'),
  receiptQrContainer: document.getElementById('receiptQrContainer'),
  printReceiptBtn: document.getElementById('printReceiptBtn'),
  closeReceiptModalBtn: document.getElementById('closeReceiptModalBtn'),

  // Top-View Virtual Simulator DOM Elements
  topViewSimulatorSection: document.getElementById('topViewSimulatorSection'),
  floorSelectorGroup: document.getElementById('floorSelectorGroup'),
  floorBtnB1: document.getElementById('floorBtn-B1'),
  floorBtnL1: document.getElementById('floorBtn-L1'),
  floorBtnL2: document.getElementById('floorBtn-L2'),
  userBookingHud: document.getElementById('userBookingHud'),
  floorVacantCount: document.getElementById('floorVacantCount'),
  floorOccupiedCount: document.getElementById('floorOccupiedCount'),
  topViewUpperRow: document.getElementById('topViewUpperRow'),
  topViewLowerRow: document.getElementById('topViewLowerRow'),
  bookingModal: document.getElementById('bookingModal'),
  modalTargetSlotName: document.getElementById('modalTargetSlotName'),
  modalTargetFloorName: document.getElementById('modalTargetFloorName'),
  bookingPlateInput: document.getElementById('bookingPlateInput'),
  closeBookingModalBtn: document.getElementById('closeBookingModalBtn'),
  cancelBookingModalBtn: document.getElementById('cancelBookingModalBtn'),
  confirmBookBtn: document.getElementById('confirmBookBtn')
};

/* ==========================================================================
   Canvas Real-Time Telemetry Chart
   ========================================================================== */
class TelemetryChart {
  constructor(canvas) {
    this.canvas = canvas;
    if (this.canvas) {
      try {
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
      } catch (e) {}
    }
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) this.ctx.resetTransform();
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.draw();
  }

  draw() {
    const { ctx, width, height } = this;
    if (!ctx || width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    const padLeft = 42;
    const padRight = 16;
    const padTop = 18;
    const padBottom = 26;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const maxVal = 40; // cm
    const minVal = 0;

    // Grid lines
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yTicks = [0, 10, 20, 30, 40];
    yTicks.forEach(tick => {
      const y = padTop + plotHeight - ((tick - minVal) / (maxVal - minVal)) * plotHeight;
      ctx.beginPath();
      ctx.strokeStyle = tick === 10 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      if (tick === 10) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = tick === 10 ? '#f87171' : '#64748b';
      ctx.fillText(`${tick}cm`, padLeft - 6, y);
    });

    ctx.setLineDash([]);

    // 10cm Occupied Line Label
    const limitY = padTop + plotHeight - ((10 - minVal) / (maxVal - minVal)) * plotHeight;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('OCCUPIED THRESHOLD (10cm)', padLeft + 6, limitY - 8);

    const data = state.history;
    if (data.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live data stream...', padLeft + plotWidth / 2, padTop + plotHeight / 2);
      return;
    }

    const stepX = plotWidth / (state.maxHistory - 1);
    const startIdx = state.maxHistory - data.length;

    // Gradient fill under waveform
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotHeight);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    grad.addColorStop(0.7, 'rgba(147, 51, 234, 0.15)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = padLeft + (startIdx + i) * stepX;
      const clamped = Math.max(minVal, Math.min(maxVal, pt.distance));
      const y = padTop + plotHeight - ((clamped - minVal) / (maxVal - minVal)) * plotHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const lastX = padLeft + (startIdx + data.length - 1) * stepX;
    const firstX = padLeft + startIdx * stepX;
    ctx.lineTo(lastX, padTop + plotHeight);
    ctx.lineTo(firstX, padTop + plotHeight);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Waveform Stroke
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = padLeft + (startIdx + i) * stepX;
      const clamped = Math.max(minVal, Math.min(maxVal, pt.distance));
      const y = padTop + plotHeight - ((clamped - minVal) / (maxVal - minVal)) * plotHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Pulse head dot
    const latestPt = data[data.length - 1];
    const latestClamped = Math.max(minVal, Math.min(maxVal, latestPt.distance));
    const headX = lastX;
    const headY = padTop + plotHeight - ((latestClamped - minVal) / (maxVal - minVal)) * plotHeight;

    ctx.beginPath();
    ctx.arc(headX, headY, 5, 0, Math.PI * 2);
    ctx.fillStyle = latestPt.distance < 10 ? '#ef4444' : '#22d3ee';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
}

const chart = new TelemetryChart(elements.telemetryChart);

/* ==========================================================================
   Data Processing & Visual Updates
   ========================================================================== */
function handleDistanceUpdate(dist) {
  state.currentDistance = dist;
  state.packetCount++;
  elements.packetCount.textContent = state.packetCount;

  const now = new Date();
  elements.lastPacketTime.textContent = now.toLocaleTimeString();

  // Min / Max telemetry
  if (state.minDistance === null || dist < state.minDistance) {
    state.minDistance = dist;
    elements.minDistanceObserved.textContent = `${dist.toFixed(1)} cm`;
  }
  if (state.maxDistance === null || dist > state.maxDistance) {
    state.maxDistance = dist;
    elements.maxDistanceObserved.textContent = `${dist.toFixed(1)} cm`;
  }

  // Large numeric display
  elements.distanceNumber.textContent = dist.toFixed(1);

  // Proximity pill & progress bar
  elements.proximityPill.className = 'proximity-pill';
  if (dist < 10) {
    elements.proximityPill.classList.add('danger');
    elements.proximityText.textContent = 'DANGER / STOP';
    // Voice alert on dangerous proximity
    speakAlert('danger');
  } else if (dist < 20) {
    elements.proximityPill.classList.add('warning');
    elements.proximityText.textContent = 'APPROACHING';
  } else {
    elements.proximityPill.classList.add('safe');
    elements.proximityText.textContent = 'CLEAR';
  }

  // Progress fill percentage (clamped at 35 cm)
  const pct = Math.min(100, Math.max(0, (dist / 35) * 100));
  elements.distanceProgressFill.style.width = `${pct}%`;

  // History buffer
  state.history.push({ time: now, distance: dist });
  if (state.history.length > state.maxHistory) {
    state.history.shift();
  }

  // Safe update calls
  updateRadialGauge(dist);
  updateBayVisualizer(dist);
  if (chart && chart.draw) chart.draw();
}

function updateRadialGauge(distance) {
  if (!elements.gaugeNum) return;
  elements.gaugeNum.textContent = distance.toFixed(1);
}

function updateBayVisualizer(distance) {
  if (!elements.distanceLaserLine || !elements.laserTagText || !elements.carVisual) return;
}

function handleStatusUpdate(rawStatus) {
  let normalizedStatus = 'UNKNOWN';
  if (rawStatus.includes('OCCUPIED')) {
    normalizedStatus = 'OCCUPIED';
  } else if (rawStatus.includes('VACANT')) {
    normalizedStatus = 'VACANT';
  } else if (rawStatus.includes('No Reading')) {
    normalizedStatus = 'NO_READING';
  }

  // State Transition Check
  if (state.currentStatus !== normalizedStatus) {
    state.lastStatus = state.currentStatus;
    state.currentStatus = normalizedStatus;
    state.statusSince = Date.now();

    if (normalizedStatus === 'OCCUPIED') {
      state.totalParkings++;
      elements.totalParkingsCount.textContent = state.totalParkings;
      playChime('occupied');
      speakAlert('arrival');

      // Start live billing ticker for Bay A-01
      state.billing.activeParkStart = Date.now();
      state.slots.A01.status = 'OCCUPIED';
      state.slots.A01.start = Date.now();
      updateSlotCardUI('A01', true);
      updateLotOverview();

      // Synchronize with Simulator Level 1 Slot L1-01
      if (state.simulator.floors.L1.slots['L1-01']) {
        state.simulator.floors.L1.slots['L1-01'].status = 'OCCUPIED';
        state.simulator.floors.L1.slots['L1-01'].plate = state.billing.currentPlate;
        state.simulator.floors.L1.slots['L1-01'].start = Date.now();
        if (state.simulator.selectedFloor === 'L1') {
          renderTopViewFloor('L1');
        }
      }

    } else if (normalizedStatus === 'VACANT') {
      playChime('vacant');
      speakAlert('departure');

      // Complete billing for Bay A-01 and generate receipt
      if (state.billing.activeParkStart) {
        completeParkingSession('A01');
      }
      state.slots.A01.status = 'VACANT';
      state.slots.A01.start = null;
      updateSlotCardUI('A01', false);
      updateLotOverview();

      // Synchronize with Simulator Level 1 Slot L1-01
      if (state.simulator.floors.L1.slots['L1-01']) {
        state.simulator.floors.L1.slots['L1-01'].status = 'VACANT';
        state.simulator.floors.L1.slots['L1-01'].start = null;
        if (state.simulator.selectedFloor === 'L1') {
          renderTopViewFloor('L1');
        }
      }
    }
  }

  applyStatusTheme(normalizedStatus);
}

function applyStatusTheme(status) {
  if (elements.bayStatusCard) {
    elements.bayStatusCard.className = 'card status-card p-6 flex items-center gap-5 relative overflow-hidden';
  }

  if (status === 'OCCUPIED') {
    if (elements.bayStatusCard) elements.bayStatusCard.classList.add('occupied');
    if (elements.statusDisplay) elements.statusDisplay.textContent = 'CAR PARKED';
    if (elements.statusHint) elements.statusHint.textContent = 'Vehicle in bay (< 10 cm) - Please Stop';
    if (elements.statusSymbol) {
      elements.statusSymbol.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      `;
    }
  } else if (status === 'VACANT') {
    if (elements.bayStatusCard) elements.bayStatusCard.classList.add('vacant');
    if (elements.statusDisplay) elements.statusDisplay.textContent = 'FREE TO PARK';
    if (elements.statusHint) elements.statusHint.textContent = 'Slot is open and clear for parking';
    if (elements.statusSymbol) {
      elements.statusSymbol.innerHTML = `
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 12l2.5 2.5L16 9.5"></path>
      `;
    }
  } else {
    if (elements.statusDisplay) elements.statusDisplay.textContent = 'AWAITING SENSOR';
    if (elements.statusHint) elements.statusHint.textContent = 'Awaiting valid sensor reading';
  }
}

function updateRadialGauge(distance) {
  elements.gaugeNum.textContent = distance.toFixed(1);

  const circumference = 502.65;
  const maxRange = 35;
  const fraction = Math.min(1, Math.max(0, distance / maxRange));
  const offset = circumference - (fraction * circumference * 0.75);
  elements.gaugeActiveArc.style.strokeDashoffset = offset;

  elements.zoneBadge.className = 'zone-badge';
  if (distance < 10) {
    elements.gaugeActiveArc.style.stroke = '#ef4444';
    elements.zoneBadge.classList.add('danger');
    elements.zoneBadge.textContent = 'PARKED / ALERT';
  } else if (distance < 20) {
    elements.gaugeActiveArc.style.stroke = '#f59e0b';
    elements.zoneBadge.classList.add('warning');
    elements.zoneBadge.textContent = 'APPROACHING';
  } else {
    elements.gaugeActiveArc.style.stroke = '#10b981';
    elements.zoneBadge.classList.add('safe');
    elements.zoneBadge.textContent = 'SAFE DISTANCE';
  }
}

function updateBayVisualizer(distance) {
  const minHeight = 40;
  const maxHeight = 220;
  const scaledHeight = minHeight + Math.min(1, distance / 30) * (maxHeight - minHeight);
  elements.distanceLaserLine.style.height = `${scaledHeight}px`;
  elements.laserTagText.textContent = `${distance.toFixed(1)} cm`;

  if (distance < 10) {
    elements.carVisual.className = 'car-container parked';
  } else if (distance < 20) {
    elements.carVisual.className = 'car-container approaching';
  } else {
    elements.carVisual.className = 'car-container vacant';
  }
}

/* ==========================================================================
   Terminal Console & Log Stream
   ========================================================================== */
function appendTerminalLine(text, type = 'normal') {
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  const now = new Date();
  timeSpan.textContent = `[${now.toTimeString().split(' ')[0]}]`;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'msg';
  msgSpan.textContent = text;

  line.appendChild(timeSpan);
  line.appendChild(msgSpan);
  elements.terminalWindow.appendChild(line);

  while (elements.terminalWindow.children.length > 150) {
    elements.terminalWindow.removeChild(elements.terminalWindow.firstChild);
  }

  if (elements.autoScrollCheck.checked) {
    elements.terminalWindow.scrollTop = elements.terminalWindow.scrollHeight;
  }
}

/* ==========================================================================
   Parser for Arduino Serial Output
   ========================================================================== */
function parseArduinoSerialLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return;

  let lineType = 'normal';
  if (line.includes('OCCUPIED')) lineType = 'occupied-msg';
  else if (line.includes('VACANT')) lineType = 'vacant-msg';
  else if (line.includes('ParkSense') || line.includes('Ultrasonic')) lineType = 'system-msg';

  appendTerminalLine(line, lineType);

  // Match "Distance: X cm"
  const distMatch = line.match(/^Distance:\s*([\d.]+)\s*cm/i);
  if (distMatch) {
    const dist = parseFloat(distMatch[1]);
    handleDistanceUpdate(dist);
    return;
  }

  // Match "Parking Status: ..."
  const statusMatch = line.match(/^Parking Status:\s*(.*)/i);
  if (statusMatch) {
    const status = statusMatch[1].trim();
    handleStatusUpdate(status);
  }
}

/* ==========================================================================
   Web Serial API Communication
   ========================================================================== */
async function connectWebSerial() {
  if (!('serial' in navigator)) {
    alert('Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera on desktop.');
    return;
  }

  try {
    const baudRate = parseInt(elements.baudRateSelect.value, 10);
    appendTerminalLine(`Requesting serial port at ${baudRate} baud...`, 'system-msg');

    state.serialPort = await navigator.serial.requestPort();
    await state.serialPort.open({ baudRate });

    state.isConnected = true;
    state.serialKeepReading = true;

    updateConnectionUI('connected');
    appendTerminalLine(`Connected successfully to port at ${baudRate} baud 8-N-1.`, 'system-msg');

    readSerialLoop();
  } catch (err) {
    console.error('Serial connection error:', err);
    appendTerminalLine(`Connection Error: ${err.message}`, 'occupied-msg');
    updateConnectionUI('disconnected');
  }
}

async function readSerialLoop() {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = state.serialPort.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();
  state.serialReader = reader;

  let buffer = '';

  try {
    while (state.serialKeepReading) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line in buffer

        for (const line of lines) {
          parseArduinoSerialLine(line);
        }
      }
    }
  } catch (err) {
    console.error('Error reading serial stream:', err);
    appendTerminalLine(`Serial read error: ${err.message}`, 'occupied-msg');
  } finally {
    reader.releaseLock();
  }
}

async function disconnectWebSerial() {
  state.serialKeepReading = false;
  if (state.serialReader) {
    try {
      await state.serialReader.cancel();
    } catch (e) {
      console.warn('Error cancelling reader:', e);
    }
  }

  if (state.serialPort) {
    try {
      await state.serialPort.close();
    } catch (e) {
      console.warn('Error closing port:', e);
    }
    state.serialPort = null;
  }

  state.isConnected = false;
  updateConnectionUI('disconnected');
  appendTerminalLine('Disconnected from Arduino serial port.', 'system-msg');
}

function updateConnectionUI(status) {
  if (elements.connectionBadge) {
    elements.connectionBadge.className = `connection-status ${status} px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2`;
  }

  if (status === 'connected') {
    if (elements.connectionStatusText) elements.connectionStatusText.textContent = '🟢 Sensor Connected';
    if (elements.connectBtnText) elements.connectBtnText.textContent = 'Disconnect';
    if (elements.connectBtn) elements.connectBtn.className = 'px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer flex items-center gap-2';
    if (elements.baudRateSelect) elements.baudRateSelect.disabled = true;
  } else if (status === 'simulating') {
    if (elements.connectionStatusText) elements.connectionStatusText.textContent = 'Demo Mode Running';
    if (elements.connectBtnText) elements.connectBtnText.textContent = 'Connect Sensor';
    if (elements.connectBtn) elements.connectBtn.className = 'px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2';
    if (elements.baudRateSelect) elements.baudRateSelect.disabled = false;
  } else {
    if (elements.connectionStatusText) elements.connectionStatusText.textContent = 'Sensor Not Connected';
    if (elements.connectBtnText) elements.connectBtnText.textContent = 'Connect Sensor';
    if (elements.connectBtn) elements.connectBtn.className = 'px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2';
    if (elements.baudRateSelect) elements.baudRateSelect.disabled = false;
  }
}

/* ==========================================================================
   Simulation Engine
   ========================================================================== */
function toggleSimulation() {
  if (state.isSimulating) {
    stopSimulation();
  } else {
    if (state.isConnected) {
      disconnectWebSerial();
    }
    startSimulation();
  }
}

function startSimulation() {
  state.isSimulating = true;
  elements.simPanel.classList.remove('hidden');
  elements.simBtnText.textContent = 'Exit Demo';
  elements.simToggleBtn.classList.replace('text-amber-300', 'text-rose-300');
  elements.simToggleBtn.classList.replace('border-amber-500/30', 'border-rose-500/40');
  updateConnectionUI('simulating');
  appendTerminalLine('[Simulator] Demo mode started. Slide distance or click preset buttons.', 'system-msg');

  // Trigger initial packet
  const initialDist = parseFloat(elements.simDistanceSlider.value) || 18.0;
  simulateEmit(initialDist);
}

function stopSimulation() {
  state.isSimulating = false;
  elements.simPanel.classList.add('hidden');
  elements.simBtnText.textContent = 'Demo Mode';
  elements.simToggleBtn.classList.replace('text-rose-300', 'text-amber-300');
  elements.simToggleBtn.classList.replace('border-rose-500/40', 'border-amber-500/30');

  if (state.simAutoInterval) {
    clearInterval(state.simAutoInterval);
    state.simAutoInterval = null;
    elements.simAutoCycleBtn.classList.remove('active');
  }

  updateConnectionUI('disconnected');
  appendTerminalLine('[Simulator] Demo mode stopped.', 'system-msg');
}

function simulateEmit(dist) {
  // Add subtle jitter (±0.2cm) for authentic ultrasonic sensor realism
  const jitter = (Math.random() - 0.5) * 0.4;
  const actualDist = Math.max(2.0, Math.min(35.0, dist + jitter));

  parseArduinoSerialLine(`Distance: ${actualDist.toFixed(1)} cm`);

  if (actualDist < 10) {
    parseArduinoSerialLine('Parking Status: OCCUPIED');
  } else {
    parseArduinoSerialLine('Parking Status: VACANT');
  }
  parseArduinoSerialLine('--------------------');
}

function toggleSimAutoCycle() {
  if (state.simAutoInterval) {
    clearInterval(state.simAutoInterval);
    state.simAutoInterval = null;
    elements.simAutoCycleBtn.classList.remove('active', 'bg-rose-500/20');
    elements.simAutoCycleBtn.textContent = '🔁 Auto Cycle';
    appendTerminalLine('[Simulator] Auto cycle stopped', 'system-msg');
    return;
  }

  elements.simAutoCycleBtn.classList.add('active', 'bg-rose-500/20');
  elements.simAutoCycleBtn.textContent = '⏹ Stop Cycle';
  appendTerminalLine('[Simulator] Auto cycle started (Simulating vehicle traffic flow)', 'system-msg');

  const scenarioDistances = [
    26.0, 22.5, 18.0, 14.2, 9.5, 6.2, 5.0, 4.8, 5.2, 7.8, 12.0, 19.5, 26.0
  ];
  let step = 0;

  state.simAutoInterval = setInterval(() => {
    if (!state.isSimulating) {
      clearInterval(state.simAutoInterval);
      return;
    }
    const dist = scenarioDistances[step];
    elements.simDistanceSlider.value = dist;
    elements.simSliderValue.textContent = `${dist.toFixed(1)} cm`;
    simulateEmit(dist);

    step = (step + 1) % scenarioDistances.length;
  }, 1400);
}

/* ==========================================================================
   Multi-Bay Management (4 Slots)
   ========================================================================== */
function toggleSimSlot(slotId) {
  const slot = state.slots[slotId];
  if (!slot || slot.isHardware) return;

  if (slot.status === 'VACANT') {
    slot.status = 'OCCUPIED';
    slot.start = Date.now();
    updateSlotCardUI(slotId, true);
    playChime('occupied');
  } else {
    completeParkingSession(slotId);
    slot.status = 'VACANT';
    slot.start = null;
    updateSlotCardUI(slotId, false);
    playChime('vacant');
  }

  updateLotOverview();
}

function updateSlotCardUI(slotId, isOccupied) {
  const card = document.getElementById(`slotCard-${slotId}`);
  const badge = document.getElementById(`slotBadge-${slotId}`);
  const distText = document.getElementById(`slotDistText-${slotId}`);
  const toggleBtn = document.getElementById(`toggleBayBtn-${slotId}`);

  if (!card || !badge) return;

  if (isOccupied) {
    card.classList.remove('vacant');
    card.classList.add('occupied');
    badge.className = 'slot-indicator-badge occupied px-2 py-0.5 rounded text-[10px] font-black tracking-wider';
    badge.textContent = 'OCCUPIED';
    if (distText) distText.textContent = 'State: Vehicle Parked';
    if (toggleBtn) {
      toggleBtn.textContent = 'Free Bay';
      toggleBtn.className = 'px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-colors cursor-pointer';
    }
  } else {
    card.classList.remove('occupied');
    card.classList.add('vacant');
    badge.className = 'slot-indicator-badge vacant px-2 py-0.5 rounded text-[10px] font-black tracking-wider';
    badge.textContent = 'VACANT';
    if (distText) distText.textContent = 'State: Available';
    if (toggleBtn) {
      toggleBtn.textContent = 'Park Vehicle';
      toggleBtn.className = 'px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer';
    }
  }
}

function updateLotOverview() {
  let occupiedCount = 0;
  Object.values(state.slots).forEach(slot => {
    if (slot.status === 'OCCUPIED') occupiedCount++;
  });
  const vacantCount = 4 - occupiedCount;
  const pct = Math.round((occupiedCount / 4) * 100);

  elements.lotVacantCount.textContent = vacantCount;
  elements.lotOccupiedCount.textContent = occupiedCount;
  elements.lotUtilizationFill.style.width = `${pct}%`;
  elements.lotUtilizationText.textContent = `${pct}%`;

  if (pct >= 75) {
    elements.lotUtilizationFill.className = 'h-full bg-rose-500 rounded-full transition-all duration-300';
  } else if (pct >= 50) {
    elements.lotUtilizationFill.className = 'h-full bg-amber-400 rounded-full transition-all duration-300';
  } else {
    elements.lotUtilizationFill.className = 'h-full bg-emerald-400 rounded-full transition-all duration-300';
  }
}

/* ==========================================================================
   Smart Billing & Checkout Receipt Modal
   ========================================================================== */
function completeParkingSession(slotId) {
  const slot = state.slots[slotId];
  if (!slot || !slot.start) return;

  const entryDate = new Date(slot.start);
  const exitDate = new Date();
  const elapsedSeconds = Math.max(1, Math.round((exitDate.getTime() - entryDate.getTime()) / 1000));

  let baseFare = 0;
  if (state.billing.fastDemoRate) {
    baseFare = Math.max(5.0, elapsedSeconds * 0.50);
  } else {
    baseFare = Math.max(15.0, (elapsedSeconds / 3600) * state.billing.ratePerHour);
  }

  const tax = baseFare * 0.05; // 5% GST
  const totalAmount = baseFare + tax;

  state.billing.totalSessionRevenue += totalAmount;
  elements.totalRevenueDisplay.textContent = `₹ ${state.billing.totalSessionRevenue.toFixed(2)}`;

  const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
  const durationStr = `${hrs}:${mins}:${secs}`;

  const ticketId = `#PS-2026-${state.billing.ticketSequence.toString().padStart(3, '0')}`;
  state.billing.ticketSequence++;

  const record = {
    ticketId,
    plate: slot.plate,
    bay: slot.name,
    entryTime: entryDate.toLocaleTimeString(),
    exitTime: exitDate.toLocaleTimeString(),
    duration: durationStr,
    baseFare: baseFare.toFixed(2),
    tax: tax.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    status: 'PAID'
  };

  state.auditRecords.unshift(record);
  renderAuditTable();

  // If this was Bay A-01, auto-display the digital parking ticket popup
  if (slotId === 'A01') {
    elements.liveFareDisplay.textContent = '₹ 0.00';
    showReceiptModal(record);
    // Refresh vehicle plate for next customer
    state.billing.currentPlate = getRandomPlate();
    elements.livePlateDisplay.textContent = state.billing.currentPlate;
    state.slots.A01.plate = state.billing.currentPlate;
    const plateA01 = document.getElementById('slotPlate-A01');
    if (plateA01) plateA01.textContent = state.billing.currentPlate;
  }
}

function showReceiptModal(record) {
  elements.receiptTicketId.textContent = record.ticketId;
  elements.receiptPlate.textContent = record.plate;
  elements.receiptBay.textContent = record.bay;
  elements.receiptEntryTime.textContent = record.entryTime;
  elements.receiptExitTime.textContent = record.exitTime;
  elements.receiptDuration.textContent = record.duration;
  elements.receiptBaseFare.textContent = `₹ ${record.baseFare}`;
  elements.receiptTax.textContent = `₹ ${record.tax}`;
  elements.receiptTotalAmount.textContent = `₹ ${record.totalAmount}`;

  // Render SVG QR Code into container
  renderDynamicSvgQr(record.ticketId, record.plate, record.totalAmount);

  elements.receiptModal.classList.remove('hidden');
}

// Crisp Vector Dynamic QR Code Generator (Zero dependencies)
function renderDynamicSvgQr(ticketId, plate, amount) {
  // 21x21 modules standard QR pattern with finder patterns
  const size = 21;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  // Helper for finder pattern at (r, c)
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          grid[r + i][c + j] = 1;
        }
      }
    }
  }

  drawFinder(0, 0);       // Top-Left
  drawFinder(0, 14);      // Top-Right
  drawFinder(14, 0);      // Bottom-Left

  // Timing lines
  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) {
      grid[6][i] = 1;
      grid[i][6] = 1;
    }
  }

  // Pseudo-random deterministic payload fill based on string hash
  let hash = 0;
  const str = `${ticketId}-${plate}-${amount}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
      const seed = Math.abs(Math.sin((r * 21 + c + hash) * 1.5) * 10000);
      grid[r][c] = (Math.floor(seed) % 2 === 0) ? 1 : 0;
    }
  }

  // Build SVG string
  const cellSize = 6;
  const svgSize = size * cellSize;
  let rects = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 1) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
      }
    }
  }

  elements.receiptQrContainer.innerHTML = `
    <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff" rx="4"/>
      ${rects}
    </svg>
  `;
}

/* ==========================================================================
   Parking Audit Table & CSV Exporter
   ========================================================================== */
function renderAuditTable() {
  if (state.auditRecords.length === 0) {
    elements.auditTableBody.innerHTML = `
      <tr id="emptyAuditRow">
        <td colspan="9" class="px-4 py-6 text-center text-slate-500 font-sans">
          No parking sessions recorded yet. Connect sensor or trigger simulation to start logging.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  state.auditRecords.forEach((rec, idx) => {
    html += `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-2.5 font-bold text-cyan-300">${rec.ticketId}</td>
        <td class="px-4 py-2.5 text-slate-200 font-semibold">${rec.plate}</td>
        <td class="px-4 py-2.5 text-slate-300">${rec.bay}</td>
        <td class="px-4 py-2.5 text-slate-400">${rec.entryTime}</td>
        <td class="px-4 py-2.5 text-slate-400">${rec.exitTime}</td>
        <td class="px-4 py-2.5 text-slate-200">${rec.duration}</td>
        <td class="px-4 py-2.5 text-emerald-400 font-bold">₹ ${rec.totalAmount}</td>
        <td class="px-4 py-2.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PAID</span>
        </td>
        <td class="px-4 py-2.5 text-right">
          <button class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-bold cursor-pointer transition-colors" onclick="viewHistoricReceipt(${idx})">View Slip</button>
        </td>
      </tr>
    `;
  });

  elements.auditTableBody.innerHTML = html;
}

window.viewHistoricReceipt = function(index) {
  const record = state.auditRecords[index];
  if (record) {
    showReceiptModal(record);
  }
};

function exportAuditToCSV() {
  if (state.auditRecords.length === 0) {
    alert('No parking records available to export yet. Perform at least one parking session to generate data.');
    return;
  }

  const headers = ['Ticket ID', 'Vehicle Plate', 'Bay Number', 'Check-In Time', 'Check-Out Time', 'Duration', 'Base Fare (INR)', 'GST (INR)', 'Total Amount (INR)', 'Payment Status'];
  const rows = state.auditRecords.map(r => [
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

  const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ParkSense_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  appendTerminalLine('[Audit] Session parking records exported to CSV successfully.', 'system-msg');
}

/* ==========================================================================
   2D Architectural Top-Down Multi-Floor Virtual Simulator Engine
   ========================================================================== */
function generateTopViewCarSvg(colorScheme = 'cyan', isUserCar = false) {
  const themes = {
    cyan: { primary: '#0284c7', mid: '#0ea5e9', light: '#38bdf8', trim: '#38bdf8' },
    ruby: { primary: '#b91c1c', mid: '#dc2626', light: '#f87171', trim: '#fca5a5' },
    amber: { primary: '#b45309', mid: '#d97706', light: '#fbbf24', trim: '#fde68a' },
    blue: { primary: '#1d4ed8', mid: '#2563eb', light: '#60a5fa', trim: '#93c5fd' },
    emerald: { primary: '#047857', mid: '#059669', light: '#34d399', trim: '#6ee7b7' },
    violet: { primary: '#6d28d9', mid: '#7c3aed', light: '#a78bfa', trim: '#c4b5fd' }
  };
  const t = themes[colorScheme] || themes.cyan;

  const userBeacon = isUserCar ? `
    <circle cx="36" cy="65" r="14" fill="none" stroke="#22d3ee" stroke-width="2" class="user-spot-beacon" opacity="0.8"/>
    <circle cx="36" cy="65" r="5" fill="#22d3ee" filter="drop-shadow(0 0 6px #22d3ee)"/>
  ` : '';

  return `
    <svg class="top-view-car-svg w-16 h-28 mx-auto" viewBox="0 0 72 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyGrad-${colorScheme}-${isUserCar ? 'user' : 'other'}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${t.mid}"/>
          <stop offset="100%" stop-color="${t.primary}"/>
        </linearGradient>
      </defs>
      <!-- Wheels / Tires -->
      <rect x="2" y="16" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" stroke-width="1"/>
      <rect x="63" y="16" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" stroke-width="1"/>
      <rect x="2" y="92" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" stroke-width="1"/>
      <rect x="63" y="92" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" stroke-width="1"/>

      <!-- Shadow -->
      <rect x="6" y="8" width="60" height="114" rx="16" fill="rgba(0,0,0,0.55)" filter="blur(3px)"/>

      <!-- Main Chassis -->
      <rect x="7" y="6" width="58" height="116" rx="16" fill="url(#bodyGrad-${colorScheme}-${isUserCar ? 'user' : 'other'})" stroke="${isUserCar ? '#38bdf8' : t.trim}" stroke-width="${isUserCar ? '2' : '1.2'}"/>

      <!-- Side Mirrors -->
      <path d="M4 42 C1 42 1 48 7 48 Z" fill="${t.mid}"/>
      <path d="M68 42 C71 42 71 48 65 48 Z" fill="${t.mid}"/>

      <!-- Hood Aerodynamic Ridges -->
      <path d="M22 10 L26 34" stroke="${t.light}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <path d="M50 10 L46 34" stroke="${t.light}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>

      <!-- Front Windshield -->
      <path d="M14 36 C14 30 58 30 58 36 L54 52 L18 52 Z" fill="#0f172a" stroke="#64748b" stroke-width="1"/>

      <!-- Panoramic Roof / Cockpit -->
      <rect x="18" y="54" width="36" height="34" rx="5" fill="#020617" stroke="${t.light}" stroke-width="0.8"/>

      <!-- Rear Windshield -->
      <path d="M18 90 L54 90 L58 104 C58 110 14 110 14 104 Z" fill="#0f172a" stroke="#64748b" stroke-width="1"/>

      <!-- Xenon Headlights -->
      <polygon points="10,12 20,10 16,18 10,16" fill="#38bdf8" filter="drop-shadow(0 -3px 6px rgba(56, 189, 248, 0.9))"/>
      <polygon points="62,12 52,10 56,18 62,16" fill="#38bdf8" filter="drop-shadow(0 -3px 6px rgba(56, 189, 248, 0.9))"/>

      <!-- Taillights -->
      <rect x="10" y="116" width="12" height="4" rx="1.5" fill="#ef4444" filter="drop-shadow(0 2px 5px rgba(239, 68, 68, 0.9))"/>
      <rect x="50" y="116" width="12" height="4" rx="1.5" fill="#ef4444" filter="drop-shadow(0 2px 5px rgba(239, 68, 68, 0.9))"/>

      ${userBeacon}
    </svg>
  `;
}

function switchTopViewFloor(floorId) {
  if (!state.simulator.floors[floorId]) return;
  state.simulator.selectedFloor = floorId;

  // Update tabs active state
  [elements.floorBtnB1, elements.floorBtnL1, elements.floorBtnL2].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('active', btn.dataset.floor === floorId);
  });

  renderTopViewFloor(floorId);
  renderUserBookingHud();
  appendTerminalLine(`[Simulator] Switched view to: ${state.simulator.floors[floorId].name}`, 'system-msg');
}

function renderTopViewFloor(floorId = state.simulator.selectedFloor) {
  const floor = state.simulator.floors[floorId];
  if (!floor || !elements.topViewUpperRow || !elements.topViewLowerRow) return;

  const slotEntries = Object.values(floor.slots);
  const upperSlots = slotEntries.slice(0, 4);
  const lowerSlots = slotEntries.slice(4, 8);

  let vacantCount = 0;
  let occupiedCount = 0;

  slotEntries.forEach(slot => {
    if (slot.status === 'OCCUPIED') occupiedCount++;
    else vacantCount++;
  });

  elements.floorVacantCount.textContent = vacantCount;
  elements.floorOccupiedCount.textContent = occupiedCount;

  // Render Upper Row
  elements.topViewUpperRow.innerHTML = upperSlots.map(slot => buildTopViewSlotHtml(slot, floorId)).join('');

  // Render Lower Row
  elements.topViewLowerRow.innerHTML = lowerSlots.map(slot => buildTopViewSlotHtml(slot, floorId)).join('');

  // Attach click listeners to all rendered slots
  attachTopViewSlotListeners();
}

function buildTopViewSlotHtml(slot, floorId) {
  const isOccupied = slot.status === 'OCCUPIED';
  const isUserSpot = state.simulator.userBooking.active &&
                     state.simulator.userBooking.floor === floorId &&
                     state.simulator.userBooking.slotId === slot.id;

  let slotClasses = 'top-view-slot ';
  if (isUserSpot) {
    slotClasses += 'user-registered';
  } else if (isOccupied) {
    slotClasses += 'occupied';
  } else {
    slotClasses += 'vacant';
  }

  const hwBadge = slot.isHardware ? '<span class="text-[10px] font-black text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">⚡ SENSOR</span>' : '';
  
  let statusBadge = '';
  if (isUserSpot) {
    statusBadge = '<span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center gap-1">⭐ YOUR CAR</span>';
  } else if (isOccupied) {
    statusBadge = '<span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">🔴 TAKEN</span>';
  } else {
    statusBadge = '<span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 FREE</span>';
  }

  // Slot Center Content
  let centerContent = '';
  if (isOccupied) {
    const carColor = isUserSpot ? 'blue' : (slot.carColor || 'ruby');
    centerContent = `
      <div class="my-auto py-1 flex flex-col items-center">
        ${generateTopViewCarSvg(carColor, isUserSpot)}
      </div>
    `;
  } else {
    centerContent = `
      <div class="my-auto py-3 flex flex-col items-center justify-center text-center">
        <div class="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 mb-1.5 shadow-sm">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span class="text-xs font-black text-emerald-800 tracking-wide uppercase">CLICK TO PARK</span>
        <span class="text-[11px] font-bold text-slate-500">Available Spot</span>
      </div>
    `;
  }

  // Footer Tag
  let footerHtml = '';
  if (isUserSpot) {
    footerHtml = `
      <div class="pt-2 border-t border-blue-200 flex items-center justify-between text-xs">
        <span class="font-mono font-bold text-blue-900">${slot.plate || state.billing.currentPlate}</span>
        <span class="text-rose-600 font-extrabold hover:underline">Leave Spot</span>
      </div>
    `;
  } else if (isOccupied) {
    footerHtml = `
      <div class="pt-2 border-t border-rose-200 flex items-center justify-between text-xs">
        <span class="font-mono font-bold text-slate-700">${slot.plate || 'PARKED'}</span>
        <span class="text-slate-500 font-mono text-[11px]" id="topViewTimer-${slot.id}">Active</span>
      </div>
    `;
  } else {
    footerHtml = `
      <div class="pt-2 border-t border-emerald-200 flex items-center justify-center text-xs text-emerald-700 font-bold">
        <span>Free Bay</span>
      </div>
    `;
  }

  return `
    <div class="${slotClasses}" data-slot-id="${slot.id}" data-floor="${floorId}" id="topSlotCard-${slot.id}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="font-['JetBrains_Mono'] font-extrabold text-sm text-slate-900">${slot.name}</span>
          ${hwBadge}
        </div>
        ${statusBadge}
      </div>

      ${centerContent}

      ${footerHtml}
    </div>
  `;
}

function attachTopViewSlotListeners() {
  const slotCards = document.querySelectorAll('.top-view-slot');
  slotCards.forEach(card => {
    card.addEventListener('click', () => {
      const slotId = card.dataset.slotId;
      const floorId = card.dataset.floor;
      handleTopViewSlotClick(floorId, slotId);
    });
  });
}

function handleTopViewSlotClick(floorId, slotId) {
  const floor = state.simulator.floors[floorId];
  if (!floor) return;
  const slot = floor.slots[slotId];
  if (!slot) return;

  const isUserSpot = state.simulator.userBooking.active &&
                     state.simulator.userBooking.floor === floorId &&
                     state.simulator.userBooking.slotId === slotId;

  if (isUserSpot) {
    // Prompt to vacate their own spot
    if (confirm(`You are parked in ${slot.name}. Do you want to cancel your reservation and vacate this bay now?`)) {
      cancelUserBooking();
    }
    return;
  }

  if (slot.status === 'VACANT') {
    openBookingModal(floorId, slotId);
  } else {
    // Already occupied by another simulated vehicle
    appendTerminalLine(`[Simulator] ${slot.name} is currently occupied by vehicle ${slot.plate}.`, 'occupied-msg');
    playChime('occupied');
  }
}

function renderUserBookingHud() {
  const hud = elements.userBookingHud;
  if (!hud) return;

  const booking = state.simulator.userBooking;

  if (booking.active) {
    const floorObj = state.simulator.floors[booking.floor];
    const floorTitle = floorObj ? floorObj.name : booking.floor;

    hud.className = 'user-booking-hud bg-blue-50 border-2 border-blue-300 p-4 md:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4';
    hud.innerHTML = `
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>
        <div>
          <span class="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">YOUR PARKED SPOT</span>
          <h3 class="text-lg md:text-xl font-black text-slate-900 mt-0.5">${booking.slotId} <span class="text-sm font-semibold text-slate-600">(${floorTitle})</span></h3>
          <span class="text-xs font-bold text-slate-600">Car Plate: <strong class="text-slate-900 font-mono">${booking.plate}</strong></span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-4 text-sm font-bold shadow-xs">
          <div>
            <span class="text-[11px] text-slate-500 block uppercase font-bold">Parked Time:</span>
            <span class="font-mono text-slate-900 text-base" id="userBookingDuration">00:00:00</span>
          </div>
          <div class="border-l border-slate-200 pl-4">
            <span class="text-[11px] text-slate-500 block uppercase font-bold">Current Bill:</span>
            <span class="font-mono text-blue-700 text-base" id="userBookingCost">₹ 0.00</span>
          </div>
        </div>

        <button id="cancelBookingBtn" class="px-5 py-3 rounded-xl text-sm font-black tracking-wide text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel Parking / Leave Spot
        </button>
      </div>
    `;

    const cancelBtn = document.getElementById('cancelBookingBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelUserBooking);
    }
  } else {
    hud.className = 'user-booking-hud bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sm shadow-xs';
    hud.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>
          </svg>
        </div>
        <div>
          <span class="font-extrabold text-slate-900 block">You have no active parking.</span>
          <span class="text-xs text-slate-600">Click on any <strong class="text-emerald-700">GREEN (Free)</strong> bay below to park your car.</span>
        </div>
      </div>

      <button id="quickReserveBtn" class="px-4 py-2 rounded-xl text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Quick Park in Available Bay
      </button>
    `;

    const quickBtn = document.getElementById('quickReserveBtn');
    if (quickBtn) {
      quickBtn.addEventListener('click', quickReserveBestSpot);
    }
  }
}

function openBookingModal(floorId, slotId) {
  const floor = state.simulator.floors[floorId];
  if (!floor) return;
  const slot = floor.slots[slotId];
  if (!slot) return;

  state.simulator.pendingBookingSlot = { floor: floorId, slotId };

  elements.modalTargetSlotName.textContent = slot.name;
  elements.modalTargetFloorName.textContent = floor.name;
  elements.bookingPlateInput.value = state.billing.currentPlate || getRandomPlate();

  elements.bookingModal.classList.remove('hidden');
  elements.bookingPlateInput.focus();
}

function closeBookingModal() {
  elements.bookingModal.classList.add('hidden');
  state.simulator.pendingBookingSlot = null;
}

function confirmBooking() {
  const pending = state.simulator.pendingBookingSlot;
  if (!pending) return;

  const plate = elements.bookingPlateInput.value.trim().toUpperCase() || state.billing.currentPlate || getRandomPlate();

  // If user already had a registered spot elsewhere, free that previous slot first
  if (state.simulator.userBooking.active) {
    const prevFloor = state.simulator.userBooking.floor;
    const prevSlotId = state.simulator.userBooking.slotId;
    if (state.simulator.floors[prevFloor] && state.simulator.floors[prevFloor].slots[prevSlotId]) {
      const prevSlot = state.simulator.floors[prevFloor].slots[prevSlotId];
      prevSlot.status = 'VACANT';
      prevSlot.plate = null;
      prevSlot.start = null;
    }
  }

  // Set new slot
  const floor = state.simulator.floors[pending.floor];
  const slot = floor.slots[pending.slotId];
  slot.status = 'OCCUPIED';
  slot.plate = plate;
  slot.start = Date.now();

  // Update user booking state
  state.simulator.userBooking = {
    active: true,
    floor: pending.floor,
    slotId: pending.slotId,
    plate: plate,
    start: Date.now(),
    carColor: 'cyan'
  };

  // If registered slot is L1-01, sync with main hardware bay A-01
  if (pending.floor === 'L1' && pending.slotId === 'L1-01') {
    state.slots.A01.status = 'OCCUPIED';
    state.slots.A01.plate = plate;
    state.slots.A01.start = Date.now();
    state.billing.activeParkStart = Date.now();
    updateSlotCardUI('A01', true);
    updateLotOverview();
  }

  closeBookingModal();
  renderTopViewFloor(state.simulator.selectedFloor);
  renderUserBookingHud();

  playChime('occupied');

  const voiceMsg = state.voiceLanguage === 'hi' 
    ? `पार्किंग स्लॉट ${slot.name} आपकी गाड़ी के लिए रजिस्टर हो गया है।`
    : `Confirmed! Spot ${slot.name} on ${floor.name} has been reserved for your vehicle.`;
  
  if (state.voiceEnabled && ('speechSynthesis' in window)) {
    try {
      const u = new SpeechSynthesisUtterance(voiceMsg);
      u.lang = state.voiceLanguage === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    } catch(e) {}
  }

  appendTerminalLine(`[Simulator] Registered Spot ${slot.name} (${floor.name}) for plate ${plate}.`, 'occupied-msg');
}

function cancelUserBooking() {
  const booking = state.simulator.userBooking;
  if (!booking.active) return;

  const floor = state.simulator.floors[booking.floor];
  const slotId = booking.slotId;
  const plate = booking.plate;

  if (floor && floor.slots[slotId]) {
    const slot = floor.slots[slotId];
    slot.status = 'VACANT';
    slot.plate = null;
    slot.start = null;
  }

  // If this was L1-01, sync with main hardware bay A-01
  if (booking.floor === 'L1' && slotId === 'L1-01') {
    if (state.billing.activeParkStart) {
      completeParkingSession('A01');
    }
    state.slots.A01.status = 'VACANT';
    state.slots.A01.start = null;
    updateSlotCardUI('A01', false);
    updateLotOverview();
  }

  // Reset user booking
  state.simulator.userBooking = {
    active: false,
    floor: null,
    slotId: null,
    plate: null,
    start: null,
    carColor: 'cyan'
  };

  renderTopViewFloor(state.simulator.selectedFloor);
  renderUserBookingHud();

  playChime('vacant');

  const cancelVoice = state.voiceLanguage === 'hi'
    ? `स्लॉट ${slotId} की बुकिंग रद्द कर दी गई है। स्लॉट अब खाली है।`
    : `Your reservation for slot ${slotId} has been cancelled. The bay is now vacant.`;

  if (state.voiceEnabled && ('speechSynthesis' in window)) {
    try {
      const u = new SpeechSynthesisUtterance(cancelVoice);
      u.lang = state.voiceLanguage === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    } catch(e) {}
  }

  appendTerminalLine(`[Simulator] Cancelled reservation for slot ${slotId} (${plate}). Slot reset to empty.`, 'vacant-msg');
}

function quickReserveBestSpot() {
  const floor = state.simulator.floors[state.simulator.selectedFloor];
  if (!floor) return;

  // Find first vacant slot
  const vacantSlot = Object.values(floor.slots).find(s => s.status === 'VACANT');
  if (vacantSlot) {
    openBookingModal(state.simulator.selectedFloor, vacantSlot.id);
  } else {
    // Check other floors
    for (const fId of ['L1', 'B1', 'L2']) {
      const f = state.simulator.floors[fId];
      const s = Object.values(f.slots).find(sl => sl.status === 'VACANT');
      if (s) {
        switchTopViewFloor(fId);
        openBookingModal(fId, s.id);
        return;
      }
    }
    alert('Sorry, the parking facility is currently 100% full across all floors!');
  }
}

/* ==========================================================================
   Periodic Ticker (Live Billing, Timers, Clocks)
   ========================================================================== */
function updateDurationTimer() {
  // Main Bay 01 State Duration
  const elapsedMs = Date.now() - state.statusSince;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  elements.stateDurationTimer.textContent = `${hrs}:${mins}:${secs}`;

  // Bay A-01 Live Running Fee Ticker
  if (state.currentStatus === 'OCCUPIED' && state.billing.activeParkStart) {
    const elapsedParkSec = Math.floor((Date.now() - state.billing.activeParkStart) / 1000);
    let fee = 0;
    if (state.billing.fastDemoRate) {
      fee = Math.max(5.0, elapsedParkSec * 0.50);
    } else {
      fee = Math.max(15.0, (elapsedParkSec / 3600) * state.billing.ratePerHour);
    }
    state.billing.currentRunningFee = fee;
    elements.liveFareDisplay.textContent = `₹ ${fee.toFixed(2)}`;
  }

  // Update Individual Slot Timers in 4-Bay Grid
  Object.keys(state.slots).forEach(slotId => {
    const slot = state.slots[slotId];
    const timerEl = document.getElementById(`slotTimer-${slotId}`);
    if (timerEl) {
      if (slot.status === 'OCCUPIED' && slot.start) {
        const s = Math.floor((Date.now() - slot.start) / 1000);
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sc = (s % 60).toString().padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${sc}`;
      } else {
        timerEl.textContent = '00:00:00';
      }
    }
  });

  // Update Top-View Simulator User Booking Ticker & Cost
  if (state.simulator.userBooking.active && state.simulator.userBooking.start) {
    const elapsedSec = Math.floor((Date.now() - state.simulator.userBooking.start) / 1000);
    const hrs = Math.floor(elapsedSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((elapsedSec % 3600) / 60).toString().padStart(2, '0');
    const secs = (elapsedSec % 60).toString().padStart(2, '0');

    const durationEl = document.getElementById('userBookingDuration');
    if (durationEl) durationEl.textContent = `${hrs}:${mins}:${secs}`;

    const costEl = document.getElementById('userBookingCost');
    if (costEl) {
      let cost = 0;
      if (state.billing.fastDemoRate) {
        cost = Math.max(5.0, elapsedSec * 0.50);
      } else {
        cost = Math.max(15.0, (elapsedSec / 3600) * state.billing.ratePerHour);
      }
      costEl.textContent = `₹ ${cost.toFixed(2)}`;
    }
  }

  // Update Top-View Simulator Individual Occupied Slot Timers
  const currentFloor = state.simulator.floors[state.simulator.selectedFloor];
  if (currentFloor) {
    Object.values(currentFloor.slots).forEach(slot => {
      const topTimerEl = document.getElementById(`topViewTimer-${slot.id}`);
      if (topTimerEl && slot.status === 'OCCUPIED' && slot.start) {
        const s = Math.floor((Date.now() - slot.start) / 1000);
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sc = (s % 60).toString().padStart(2, '0');
        topTimerEl.textContent = `${m}:${sc}`;
      }
    });
  }
}

setInterval(updateDurationTimer, 1000);

/* ==========================================================================
   Event Listeners & User Interactions
   ========================================================================== */
// Web Serial Connect
elements.connectBtn.addEventListener('click', () => {
  if (state.isConnected) disconnectWebSerial();
  else connectWebSerial();
});

// Simulation Controls
elements.simToggleBtn.addEventListener('click', toggleSimulation);

elements.simDistanceSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  elements.simSliderValue.textContent = `${val.toFixed(1)} cm`;
  simulateEmit(val);
});

elements.simCarArrivesBtn.addEventListener('click', () => {
  elements.simDistanceSlider.value = 5.2;
  elements.simSliderValue.textContent = '5.2 cm';
  simulateEmit(5.2);
});

elements.simCarLeavesBtn.addEventListener('click', () => {
  elements.simDistanceSlider.value = 23.5;
  elements.simSliderValue.textContent = '23.5 cm';
  simulateEmit(23.5);
});

elements.simAutoCycleBtn.addEventListener('click', toggleSimAutoCycle);

// Voice Assistant Controls
elements.voiceToggleBtn.addEventListener('click', () => {
  state.voiceEnabled = !state.voiceEnabled;
  elements.voiceBtnText.textContent = state.voiceEnabled ? 'Voice: ON' : 'Voice: OFF';
  elements.voiceToggleBtn.classList.toggle('text-pink-300', state.voiceEnabled);
  elements.voiceToggleBtn.classList.toggle('text-slate-500', !state.voiceEnabled);
  if (state.voiceEnabled) {
    speakAlert('arrival');
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

elements.voiceLangSelect.addEventListener('change', (e) => {
  state.voiceLanguage = e.target.value;
  appendTerminalLine(`Voice language set to: ${state.voiceLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}`, 'system-msg');
});

// Sound Toggle
elements.soundToggleBtn.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  elements.soundIconOn.classList.toggle('hidden', !state.soundEnabled);
  elements.soundIconOff.classList.toggle('hidden', state.soundEnabled);
  if (state.soundEnabled) {
    initAudio();
    playChime('vacant');
  }
});

// Fast Demo Rate Checkbox
elements.fastDemoRateCheck.addEventListener('change', (e) => {
  state.billing.fastDemoRate = e.target.checked;
  elements.billingRateBadge.textContent = state.billing.fastDemoRate ? 'Demo: ₹0.50/s' : '₹30/hr';
});

// Plate ID Click to Regenerate
elements.livePlateDisplay.addEventListener('click', () => {
  state.billing.currentPlate = getRandomPlate();
  elements.livePlateDisplay.textContent = state.billing.currentPlate;
  state.slots.A01.plate = state.billing.currentPlate;
  const pA01 = document.getElementById('slotPlate-A01');
  if (pA01) pA01.textContent = state.billing.currentPlate;
});

// Multi-Slot Interactive Buttons
elements.toggleBayBtnA02.addEventListener('click', () => toggleSimSlot('A02'));
elements.toggleBayBtnA03.addEventListener('click', () => toggleSimSlot('A03'));
elements.toggleBayBtnA04.addEventListener('click', () => toggleSimSlot('A04'));

// Audit Table Actions
elements.exportCsvBtn.addEventListener('click', exportAuditToCSV);
elements.clearAuditBtn.addEventListener('click', () => {
  state.auditRecords = [];
  renderAuditTable();
  appendTerminalLine('[Audit] Session log cleared.', 'system-msg');
});

// Receipt Modal Actions
elements.printReceiptBtn.addEventListener('click', () => {
  window.print();
});

elements.closeReceiptModalBtn.addEventListener('click', () => {
  elements.receiptModal.classList.add('hidden');
});

elements.receiptModal.addEventListener('click', (e) => {
  if (e.target === elements.receiptModal) {
    elements.receiptModal.classList.add('hidden');
  }
});

// Wiring & Help Modal Actions
elements.guideModalBtn.addEventListener('click', () => elements.guideModal.classList.remove('hidden'));
elements.closeGuideModalBtn.addEventListener('click', () => elements.guideModal.classList.add('hidden'));
elements.guideOkBtn.addEventListener('click', () => elements.guideModal.classList.add('hidden'));
elements.guideModal.addEventListener('click', (e) => {
  if (e.target === elements.guideModal) elements.guideModal.classList.add('hidden');
});

// Clear Console
elements.clearConsoleBtn.addEventListener('click', () => {
  elements.terminalWindow.innerHTML = '';
  appendTerminalLine('Console buffer cleared.', 'system-msg');
});

// Top-View Simulator Floor Selector Tab Listeners
if (elements.floorBtnB1) elements.floorBtnB1.addEventListener('click', () => switchTopViewFloor('B1'));
if (elements.floorBtnL1) elements.floorBtnL1.addEventListener('click', () => switchTopViewFloor('L1'));
if (elements.floorBtnL2) elements.floorBtnL2.addEventListener('click', () => switchTopViewFloor('L2'));

// Booking Modal Actions
if (elements.closeBookingModalBtn) elements.closeBookingModalBtn.addEventListener('click', closeBookingModal);
if (elements.cancelBookingModalBtn) elements.cancelBookingModalBtn.addEventListener('click', closeBookingModal);
if (elements.confirmBookBtn) elements.confirmBookBtn.addEventListener('click', confirmBooking);
if (elements.bookingModal) {
  elements.bookingModal.addEventListener('click', (e) => {
    if (e.target === elements.bookingModal) closeBookingModal();
  });
}

// Initial Boot Rendering
updateLotOverview();
renderAuditTable();
renderTopViewFloor('L1');
renderUserBookingHud();
appendTerminalLine('ParkSense IoT Commercial Dashboard Ready.', 'system-msg');
appendTerminalLine('2D Architectural Top-Down Facility Simulator initialized on Level 1.', 'system-msg');
appendTerminalLine('Web Serial API active. Click "Connect Arduino" or "Demo Mode" to test.', 'system-msg');

