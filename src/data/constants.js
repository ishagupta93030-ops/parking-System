export const SAMPLE_PLATES = [
  'DL 01 AB 4589',
  'MH 12 PK 3410',
  'KA 03 MX 9081',
  'HR 26 DQ 7810',
  'UP 16 BZ 9022',
  'DL 08 AX 7219',
  'CH 01 BG 5543',
  'RJ 14 CC 8820'
];

export function getRandomPlate() {
  return SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];
}

export const CAR_THEMES = {
  cyan: { primary: '#0284c7', mid: '#0ea5e9', light: '#38bdf8', trim: '#38bdf8' },
  ruby: { primary: '#b91c1c', mid: '#dc2626', light: '#f87171', trim: '#fca5a5' },
  amber: { primary: '#b45309', mid: '#d97706', light: '#fbbf24', trim: '#fde68a' },
  blue: { primary: '#1d4ed8', mid: '#2563eb', light: '#60a5fa', trim: '#93c5fd' },
  emerald: { primary: '#047857', mid: '#059669', light: '#34d399', trim: '#6ee7b7' },
  violet: { primary: '#6d28d9', mid: '#7c3aed', light: '#a78bfa', trim: '#c4b5fd' }
};

export const INITIAL_FLOORS = {
  B1: {
    id: 'B1',
    name: 'Basement Level (B1)',
    slots: {
      'B1-01': { id: 'B1-01', name: 'Bay 01', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'emerald' },
      'B1-02': { id: 'B1-02', name: 'Bay 02', floor: 'B1', status: 'OCCUPIED', plate: 'MH 12 PK 3410', start: Date.now() - 154000, carColor: 'ruby' },
      'B1-03': { id: 'B1-03', name: 'Bay 03', floor: 'B1', status: 'VACANT', plate: null, start: null, carColor: 'amber' }
    }
  },
  L1: {
    id: 'L1',
    name: 'Ground Floor (Main & IoT)',
    slots: {
      'L1-01': { id: 'L1-01', name: 'Bay 01', floor: 'L1', status: 'VACANT', plate: 'DL 01 AB 4589', start: null, isHardware: true, carColor: 'cyan' },
      'L1-02': { id: 'L1-02', name: 'Bay 02', floor: 'L1', status: 'VACANT', plate: null, start: null, carColor: 'blue' },
      'L1-03': { id: 'L1-03', name: 'Bay 03', floor: 'L1', status: 'OCCUPIED', plate: 'UP 16 BZ 9022', start: Date.now() - 210000, carColor: 'ruby' }
    }
  },
  L2: {
    id: 'L2',
    name: 'Level 2 (Rooftop Deck)',
    slots: {
      'L2-01': { id: 'L2-01', name: 'Bay 01', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'amber' },
      'L2-02': { id: 'L2-02', name: 'Bay 02', floor: 'L2', status: 'VACANT', plate: null, start: null, carColor: 'ruby' },
      'L2-03': { id: 'L2-03', name: 'Bay 03', floor: 'L2', status: 'OCCUPIED', plate: 'CH 01 BG 5543', start: Date.now() - 580000, carColor: 'violet' }
    }
  }
};

export const ARDUINO_CPP_CODE = `/*
  =============================================================================
  ParkSense IoT - Commercial Smart Parking System Firmware v3.0
  Arduino C++ Source Code with 16x2 I2C LCD Display & Hourly Billing Support
  (Compatible with Arduino Uno, Nano, Mega, Leonardo, ESP32)
  =============================================================================

  WIRING DIAGRAM:
  -----------------------------------------------------------------------------
  1. HC-SR04 Ultrasonic Sensor [REQUIRED]:
     - VCC        -> Arduino 5V
     - GND        -> Arduino GND
     - TRIG (TX)  -> Digital Pin 9
     - ECHO (RX)  -> Digital Pin 10

  2. 16x2 I2C LCD Display (LiquidCrystal_I2C) [PLUG & PLAY]:
     - VCC        -> Arduino 5V
     - GND        -> Arduino GND
     - SDA        -> Pin A4 (on Uno/Nano) or Dedicated SDA
     - SCL        -> Pin A5 (on Uno/Nano) or Dedicated SCL
     - Default I2C Address: 0x27 (or 0x3F)

  3. Optional Peripherals:
     - SG90 Servo Motor  -> Signal: Pin 11 (PWM) | Power: 5V & GND
     - Active Buzzer     -> Signal: Pin 6        | Power: GND
     - Red Status LED    -> Anode (+) via 220Ω to Pin 7 | Cathode (-) to GND
     - Green Status LED  -> Anode (+) via 220Ω to Pin 8 | Cathode (-) to GND

  SERIAL COMMUNICATION:
  -----------------------------------------------------------------------------
  - Baud Rate: 9600 bps, 8 Data Bits, No Parity, 1 Stop Bit (8-N-1)
  - Telemetry Format:
      Distance: XX.X cm
      Parking Status: OCCUPIED (or VACANT)
      Parked Time: XXh XXm XXs
      Hourly Fee: Rs. XX.XX
      --------------------
  - Supported Inbound Commands (via Web Serial API):
      'O' / 'o' -> Force Open Barrier Gate (90°)
      'C' / 'c' -> Force Close Barrier Gate (0°)
      'B' / 'b' -> Trigger Proximity Buzzer Beep
      'T' / 't' -> Run LED Diagnostic Cycle
      'S' / 's' -> Request Instant Telemetry Print
  =============================================================================
*/

// ============================================================================
// HARDWARE CONFIGURATION SWITCHES
// ============================================================================
#define USE_LCD     1   // Set to 1 to enable 16x2 I2C LCD Display, 0 to disable
#define USE_SERVO   1   // Set to 1 to enable SG90 Servo barrier, 0 to disable
#define USE_BUZZER  1   // Set to 1 to enable Active Buzzer, 0 to disable
#define USE_LEDS    1   // Set to 1 to enable Red/Green LEDs, 0 to disable

#if USE_LCD
  #include <Wire.h>
  #include <LiquidCrystal_I2C.h>
  LiquidCrystal_I2C lcd(0x27, 16, 2);
#endif

#if USE_SERVO
  #include <Servo.h>
  Servo barrierServo;
#endif

// Pin Definitions
const uint8_t TRIG_PIN       = 9;
const uint8_t ECHO_PIN       = 10;
const uint8_t BUZZER_PIN     = 6;
const uint8_t RED_LED_PIN    = 7;
const uint8_t GREEN_LED_PIN  = 8;
const uint8_t SERVO_PIN      = 11;

// Parking Detection Constants
const float OCCUPIED_THRESHOLD_CM = 10.0;
const float MAX_RELIABLE_DIST_CM  = 250.0;
const unsigned long SENSOR_TIMEOUT_US = 25000;
const float HOURLY_RATE_INR       = 30.0;

// State Variables
const uint8_t TOTAL_BAYS    = 3;
uint8_t availableBays       = 2;
float currentDistance       = 0.0;
bool isOccupied             = false;
bool manualOverride         = false;
uint8_t consecutiveOccupied = 0;
uint8_t consecutiveVacant   = 0;

// Hourly Parked Duration Tracking
unsigned long parkStartTime = 0;
unsigned int lastAlertedHour = 0;
unsigned long milestoneAlertUntil = 0;
unsigned long sessionDepartureUntil = 0;
float lastSessionTotalFee = 0.0;
unsigned int lastSessionHours = 0;
unsigned int lastSessionMins = 0;

// LCD & Telemetry Timing
unsigned long lastLcdUpdateTime = 0;
const unsigned long LCD_UPDATE_INTERVAL_MS = 500;
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 350;

void renderDisplay(unsigned long now) {
#if USE_LCD
  if (now - lastLcdUpdateTime < LCD_UPDATE_INTERVAL_MS) return;
  lastLcdUpdateTime = now;

  char row0[17];
  char row1[17];

  if (now < sessionDepartureUntil) {
    snprintf(row0, sizeof(row0), "PAID & DEPARTED ");
    snprintf(row1, sizeof(row1), "%uh%um Tot:Rs.%u", lastSessionHours, lastSessionMins, (unsigned int)lastSessionTotalFee);
  } else if (isOccupied && now < milestoneAlertUntil) {
    snprintf(row0, sizeof(row0), "** %u HR REACHED **", lastAlertedHour);
    unsigned int fee = (lastAlertedHour + 1) * (unsigned int)HOURLY_RATE_INR;
    snprintf(row1, sizeof(row1), "Fee: Rs.%u/hr  ", fee);
  } else if (isOccupied) {
    unsigned long elapsedSec = (now - parkStartTime) / 1000;
    unsigned int hrs = elapsedSec / 3600;
    unsigned int mins = (elapsedSec % 3600) / 60;
    unsigned int billedHours = hrs + 1;
    unsigned int currentFee = billedHours * (unsigned int)HOURLY_RATE_INR;

    snprintf(row0, sizeof(row0), "PARKED: %02uh %02um ", hrs, mins);
    uint8_t freeNow = (availableBays > 0) ? (availableBays - 1) : 0;
    snprintf(row1, sizeof(row1), "Fee:Rs.%-3u AVL:%u/%u", currentFee, freeNow, TOTAL_BAYS);
  } else {
    snprintf(row0, sizeof(row0), "PARKSENSE: OPEN ");
    snprintf(row1, sizeof(row1), "SPOTS AVAIL: %u/%u", availableBays, TOTAL_BAYS);
  }

  lcd.setCursor(0, 0);
  lcd.print(row0);
  lcd.setCursor(0, 1);
  lcd.print(row1);
#endif
}

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  #if USE_BUZZER
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
  #endif

  #if USE_LEDS
    pinMode(RED_LED_PIN, OUTPUT);
    pinMode(GREEN_LED_PIN, OUTPUT);
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
  #endif

  #if USE_SERVO
    barrierServo.attach(SERVO_PIN);
    barrierServo.write(0);
  #endif

  #if USE_LCD
    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("ParkSense Smart "));
    lcd.setCursor(0, 1);
    lcd.print(F("Hourly Sys Ready"));
    delay(1500);
    lcd.clear();
  #endif

  Serial.println(F("========================================="));
  Serial.println(F("ParkSense IoT C++ Firmware v3.0 Ready"));
  Serial.println(F("Baud: 9600 | Threshold: 10.0 cm"));
  Serial.println(F("I2C 16x2 LCD: ENABLED | Hourly Display: ACTIVE"));
  Serial.println(F("========================================="));
}

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long echoTime = pulseIn(ECHO_PIN, HIGH, SENSOR_TIMEOUT_US);
  if (echoTime == 0) return 100.0;

  float dist = (float)echoTime * 0.0343 / 2.0;
  if (dist < 2.0) dist = 2.0;
  if (dist > MAX_RELIABLE_DIST_CM) dist = MAX_RELIABLE_DIST_CM;
  return dist;
}

void processSerialCommands() {
  while (Serial.available() > 0) {
    char cmd = Serial.read();
    switch (cmd) {
      case 'O':
      case 'o':
        #if USE_SERVO
          barrierServo.write(90);
        #endif
        manualOverride = true;
        Serial.println(F("[CMD] Barrier Gate Opened (Manual Override)"));
        break;
      case 'C':
      case 'c':
        #if USE_SERVO
          barrierServo.write(0);
        #endif
        manualOverride = false;
        Serial.println(F("[CMD] Barrier Gate Closed (Auto Mode Resumed)"));
        break;
      case 'B':
      case 'b':
        #if USE_BUZZER
          digitalWrite(BUZZER_PIN, HIGH);
          delay(80);
          digitalWrite(BUZZER_PIN, LOW);
        #endif
        Serial.println(F("[CMD] Buzzer Beep Test Executed"));
        break;
      case 'T':
      case 't':
        #if USE_LEDS
          digitalWrite(GREEN_LED_PIN, HIGH);
          digitalWrite(RED_LED_PIN, HIGH);
          delay(120);
          digitalWrite(GREEN_LED_PIN, LOW);
          digitalWrite(RED_LED_PIN, LOW);
          delay(120);
          digitalWrite(GREEN_LED_PIN, isOccupied ? LOW : HIGH);
          digitalWrite(RED_LED_PIN, isOccupied ? HIGH : LOW);
        #endif
        Serial.println(F("[CMD] LED Diagnostic Cycle Complete"));
        break;
      case 'S':
      case 's':
        lastTelemetryTime = 0;
        break;
      default:
        break;
    }
  }
}

void loop() {
  unsigned long now = millis();
  processSerialCommands();
  float measuredDist = readUltrasonicDistance();

  if (measuredDist > 0.0 && measuredDist < OCCUPIED_THRESHOLD_CM) {
    consecutiveOccupied++;
    consecutiveVacant = 0;
    if (consecutiveOccupied >= 2) {
      if (!isOccupied) {
        isOccupied = true;
        parkStartTime = now;
        lastAlertedHour = 0;
        #if USE_SERVO
          if (!manualOverride) barrierServo.write(90);
        #endif
        #if USE_BUZZER
          digitalWrite(BUZZER_PIN, HIGH);
          delay(40);
          digitalWrite(BUZZER_PIN, LOW);
        #endif
      }
    }
  } else {
    consecutiveVacant++;
    consecutiveOccupied = 0;
    if (consecutiveVacant >= 2) {
      if (isOccupied) {
        isOccupied = false;
        unsigned long elapsedSec = (now - parkStartTime) / 1000;
        lastSessionHours = elapsedSec / 3600;
        lastSessionMins = (elapsedSec % 3600) / 60;
        lastSessionTotalFee = (float)(lastSessionHours + 1) * HOURLY_RATE_INR;
        sessionDepartureUntil = now + 3000;
        #if USE_SERVO
          if (!manualOverride) barrierServo.write(0);
        #endif
      }
    }
  }

  currentDistance = measuredDist;

  if (isOccupied) {
    unsigned long elapsedSec = (now - parkStartTime) / 1000;
    unsigned int currentHours = elapsedSec / 3600;
    if (currentHours > lastAlertedHour) {
      lastAlertedHour = currentHours;
      milestoneAlertUntil = now + 4000;
      Serial.print(F("[HOURLY ALERT] *** Milestone: "));
      Serial.print(currentHours);
      Serial.print(F(" Hour(s) Elapsed! New Fee: Rs. "));
      Serial.print((currentHours + 1) * (unsigned int)HOURLY_RATE_INR);
      Serial.println(F(".00 ***"));
      #if USE_BUZZER
        digitalWrite(BUZZER_PIN, HIGH); delay(70);
        digitalWrite(BUZZER_PIN, LOW);  delay(60);
        digitalWrite(BUZZER_PIN, HIGH); delay(70);
        digitalWrite(BUZZER_PIN, LOW);
      #endif
    }
  }

  renderDisplay(now);

  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;
    Serial.print(F("Distance: "));
    Serial.print(currentDistance, 1);
    Serial.println(F(" cm"));

    if (isOccupied) {
      Serial.println(F("Parking Status: OCCUPIED"));
      unsigned long elapsedSec = (now - parkStartTime) / 1000;
      unsigned int h = elapsedSec / 3600;
      unsigned int m = (elapsedSec % 3600) / 60;
      unsigned int s = elapsedSec % 60;
      Serial.print(F("Parked Time: "));
      Serial.print(h); Serial.print(F("h "));
      Serial.print(m); Serial.print(F("m "));
      Serial.print(s); Serial.println(F("s"));
      Serial.print(F("Hourly Fee: Rs. "));
      Serial.println((h + 1) * (unsigned int)HOURLY_RATE_INR);
      #if USE_LEDS
        digitalWrite(RED_LED_PIN, HIGH);
        digitalWrite(GREEN_LED_PIN, LOW);
      #endif
    } else {
      Serial.println(F("Parking Status: VACANT"));
      #if USE_LEDS
        digitalWrite(RED_LED_PIN, LOW);
        digitalWrite(GREEN_LED_PIN, HIGH);
      #endif
      #if USE_BUZZER
        digitalWrite(BUZZER_PIN, LOW);
      #endif
    }
    Serial.println(F("--------------------"));
  }
  delay(20);
}`;
