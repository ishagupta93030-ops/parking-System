# 📱 ParkSense IoT - React Native Mobile Application

The official cross-platform mobile driver and operator application for the ParkSense IoT Smart Parking ecosystem, ready for **iOS** and **Android**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Supabase Cloud (Optional)
Open `supabase.js` and set your Supabase Project URL and Anon Key:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. Run with Expo
```bash
# Start the Expo development server
npx expo start
```

- **Run on Physical Phone**: Scan the QR code using the **Expo Go** app (available on Apple App Store & Google Play Store).
- **Run on Android Emulator**: Press `a` in the terminal.
- **Run on iOS Simulator**: Press `i` in the terminal.
- **Run in Mobile Web Browser**: Press `w` in the terminal.

---

## 🌟 Mobile Features
- **Live Vacancy Telemetry**: Real-time free bay counts synchronized directly with the Arduino HC-SR04 IoT sensor and Supabase.
- **1-Hour Fixed Tariff Engine**: Automatic calculation of 1-hour parking charges (`₹30.00 base + 5% GST = ₹31.50`).
- **1-Tap Quick Booking**: Reserve nearest vacant slot with instant verification.
- **Digital Gate Pass**: Generates verifiable digital ticket and QR pass.
