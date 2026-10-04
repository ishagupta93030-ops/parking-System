# 🚗 ParkSense IoT - React Native Android Mobile Application

The official cross-platform mobile driver and passholder application for the **ParkSense IoT Commercial Smart Parking System**, built with **React Native & Expo**.

---

## 📱 Core Features & Capabilities

1. **⚡ 1-Tap Auto Park**: Instant reservation of the nearest available vacant bay across all multi-floor decks.
2. **🗺️ City Radar & GPS Explorer**: Live interactive facility finder with category filters (Hubs, Commercial Garages, Metro Transit, Retail Malls, Hospitals) and distance calculations.
3. **🏗️ 2D Multi-Floor Visual Bay Selector**: Interactive 2D parking layouts for Level 1 (Ground & EV), Level 2 (Covered Deck), and Level 3 (Rooftop Canopy) with color-coded live bay occupancy.
4. **🎫 Digital Gate Pass & QR Scanner**: Verifiable entrance ticket with active countdown timer, vehicle plate number, barcode, and automated boom barrier signal.
5. **💰 1-Hour Fixed Tariff Engine**: Automatic calculation of 1-hour parking charges (`₹30.00 base + 5% GST = ₹31.50`) with vehicle category multipliers (Standard Sedan, SUV, Two-Wheeler, EV Fast Charging).
6. **🚘 Vehicle Garage Manager**: Add, switch, and manage multiple license plate profiles directly within the mobile app.
7. **☁️ Supabase Real-Time Sync & Offline Storage**: Instant synchronization with `parking_slots`, `vehicle_records`, and `system_logs` in Supabase Cloud, with offline local persistence fallback.
8. **📡 Arduino HC-SR04 Hardware Sensor Integration**: Real-time sync with physical ultrasonic distance sensor wired to Level 1, Bay 01.

---

## 🚀 Getting Started & Running the App

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Expo Go** app installed on your Android smartphone (from Google Play Store), OR **Android Studio Emulator**.

---

### 2. Run the App

Open your terminal and navigate to the `mobile` folder:

```bash
cd mobile
npx expo start
```

Before starting, copy `.env.example` to `.env` and set your Supabase project URL and publishable key. Without these values, the app runs in offline mode.

#### Running on Android:
- **Physical Android Phone**: Open the **Expo Go** app on your phone and scan the QR code displayed in the terminal.
- **Android Emulator**: Press `a` in the terminal to launch on your connected Android Virtual Device (AVD).
- **Web Preview**: Press `w` to preview the responsive mobile interface in your desktop browser.

---

## 🏗️ Project Architecture

```
mobile/
├── assets/                    # App icons, splash screens, and adaptive assets
├── src/
│   ├── components/            # Reusable styled UI components
│   │   ├── BookingModal.js    # Multi-step duration, vehicle & tariff checkout sheet
│   │   ├── DigitalPassModal.js# Official scannable gate pass with live countdown
│   │   ├── FacilityCard.js    # Live parking facility card with vacancy meter
│   │   ├── Header.js          # App header with plate badge & realtime sync pill
│   │   ├── QrCodeView.js      # Visual QR code and barcode scanner matrix
│   │   ├── RateCalculator.js  # Transparent 1-hour tariff and GST calculator
│   │   ├── SlotPicker.js      # 2D visual multi-floor bay selector
│   │   └── VehicleManagerModal.js # User vehicle garage manager
│   ├── data/
│   │   ├── facilitiesData.js  # City parking facilities, GPS, rates, & amenities
│   │   └── slotsData.js       # Multi-floor bay layout & IoT hardware mappings
│   ├── screens/
│   │   ├── ExploreMapScreen.js# City facility finder & category search
│   │   ├── HomeScreen.js      # Main driver dashboard & 1-tap quick park
│   │   ├── MyPassScreen.js    # Active gate pass and past receipt slips
│   │   ├── ProfileScreen.js   # Driver vehicle profile & cloud diagnostics
│   │   ├── RatesScreen.js     # Tariff calculator screen
│   │   └── SlotsScreen.js     # 2D multi-floor visual parking screen
│   ├── services/
│   │   ├── bookingService.js  # Tariff calculations & ticket generation
│   │   └── supabaseService.js # Supabase Cloud & Realtime database sync
│   └── theme/
│       └── colors.js          # Curated color tokens & dark-mode styling
├── App.js                     # Root component with navigation & global state
├── app.json                   # Android package permissions & Expo configuration
└── package.json               # Mobile app dependencies
```

---

## 🔧 Building an Android APK / Production Bundle

To build a standalone installable Android APK file using Expo Application Services (EAS):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
