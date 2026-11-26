# 🚗 ParkSense IoT: Arduino-Based Full-Stack Smart Parking System

ParkSense IoT is a full-stack smart parking system that connects a physical Arduino ultrasonic sensor to a real-time web dashboard, a mobile driver app, and a cloud database. The Arduino detects whether a vehicle is parked, and the software handles live monitoring, hourly billing, receipts, bookings, and analytics.

## 🏗️ Architecture

| Layer | Technology | Location |
|---|---|---|
| Hardware / Firmware | Arduino C++, HC-SR04 ultrasonic sensor | `parking_sensor.ino` |
| Web Dashboard + Admin | React 18, Vite, Leaflet, lucide-react | `src/` |
| Mobile Driver App | React Native, Expo | `mobile/` |
| Backend / Database | Supabase (PostgreSQL, Realtime) | `supabase_schema.sql` |

**Data flow:**

```
HC-SR04 → Arduino (debounce, LCD, servo, LEDs)
        → USB Serial (9600 baud) → Web Serial API (Chrome/Edge)
        → React Dashboard (parsing, billing, voice alerts, receipts)
        → Supabase (records, slots, logs, benchmarks)
        ↔ Mobile App (bookings, digital passes)
```

## 🔌 Arduino Firmware (v3.0)

- **Sensor:** HC-SR04 on pins 9 (TRIG) and 10 (ECHO).
- **Optional peripherals:** 16×2 I2C LCD, SG90 servo (barrier gate), buzzer, red/green LEDs. Each is toggled with `#define USE_*` flags.
- **Detection:** a vehicle is "parked" when the distance is below a configurable threshold (default 10 cm). Two consecutive readings are required to change state (debounce).
- **Fault detection:** 4 consecutive failed echoes mark the sensor as faulty. Billing state is preserved and the LEDs flash.
- **Billing:** ₹30 per hour, with partial hours rounded up. The LCD shows live time and fee, hourly milestone alerts, and a departure summary.
- **Barrier gate:** opens on arrival and closes on departure, with manual override.
- **Telemetry (every 350 ms):** `Distance`, `Threshold`, `Sensor Health`, `Parking Status`, `Parked Time`, `Hourly Fee`.
- **Serial commands:**
  - `O` / `C`: open / close gate
  - `B`: buzzer test
  - `T`: LED test
  - `H`: set threshold
  - `S`: request instant telemetry

## 💻 Web Dashboard (React + Vite)

The browser connects to the Arduino through the **Web Serial API** (Chrome, Edge, or Opera).

**Views**
- **Bays view:** a 3-floor parking simulator (L1–L3). Bay L1-01 is the real hardware bay, and the rest are simulated.
- **City map:** a Leaflet map of facilities with live vacancy, rates, and features.
- **Driver app preview:** an in-browser view of the mobile experience.
- **Admin portal:** database and audit records, response-time modeling, sensor settings, hardware controls, and Supabase configuration.

**Features**
- Live distance and status with an animated car visual
- Running fare calculation, QR receipts, and booking modal
- Voice and sound alerts in English and Hindi
- Sensor health monitoring and fault alerts
- Raw serial terminal drawer
- Cost estimator
- Arduino wiring guide
- Demo / simulation mode (works without hardware)
- Latency benchmarking (sensor → UI → DB) with CSV export

## 📱 Mobile App (React Native + Expo)

- One-tap auto-park, which reserves the nearest vacant bay
- City radar and GPS explorer with category filters
- Visual multi-floor slot picker
- Digital gate pass with QR code and countdown timer
- Tariff engine: ₹30 + 5% GST = ₹31.50 per hour, with vehicle-type multipliers (Sedan, SUV, Two-wheeler, EV)
- Multi-vehicle garage manager
- Supabase real-time sync with offline fallback

## 🗄️ Database Schema (Supabase)

- `vehicle_records`: tickets, plate, entry/exit time, fare, tax, total
- `parking_facilities`: location, rates, total and vacant spots
- `parking_slots`: per-bay status
- `admin_settings`: tariff and barrier configuration
- `system_logs`: event log
- `sensor_benchmarks`: response-time measurements

Realtime is enabled on `vehicle_records`, `parking_slots`, and `parking_facilities`.

## 🚀 Setup

**1. Database:** create a Supabase project and run `supabase_schema.sql` in the SQL Editor.

**2. Environment:** copy `.env.example` to `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
```

**3. Web app:**
```bash
npm install
npm run dev        # runs on http://localhost:3000
```

**4. Arduino:** open `parking_sensor.ino` in the Arduino IDE, install the `LiquidCrystal_I2C` library, upload to your board, then click **Connect** in the dashboard (9600 baud).

**5. Mobile app:**
```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

## ⚠️ Known Limitations

- The Supabase RLS policies are fully open (`USING (true)`) and the admin portal has no login. This is suitable for demos only. Add authentication and restrictive policies before production use.
- Only one bay (L1-01) uses real hardware. The other bays and the facility data are simulated or seeded.
- The Arduino must be connected by USB to the computer running the browser. There is no wireless (ESP32 / MQTT / HTTP) link yet.
- The firmware uses blocking `delay()` calls in several places.
