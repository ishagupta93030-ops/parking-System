import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { supabase } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'rates', 'ticket'
  const [vacantSpots, setVacantSpots] = useState(18);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedHours, setSelectedHours] = useState(1);
  const [plateNumber, setPlateNumber] = useState('DL 01 AB 4589');

  // 1-Hour Fixed Tariff
  const hourlyRate = 30.0;
  const gstTax = hourlyRate * 0.05;
  const oneHourTotal = hourlyRate + gstTax;

  // Total for selected hours
  const totalPayable = (hourlyRate * selectedHours * 1.05).toFixed(2);

  const handleBookSpot = () => {
    const booking = {
      ticketId: `#PS-MOB-${Math.floor(100 + Math.random() * 900)}`,
      bay: 'Bay L1-04',
      plate: plateNumber,
      hours: selectedHours,
      total: totalPayable,
      startTime: new Date().toLocaleTimeString(),
    };
    setActiveBooking(booking);
    setVacantSpots(prev => Math.max(0, prev - 1));
    setActiveTab('ticket');
    Alert.alert('Booking Confirmed!', `Reserved for ${selectedHours} hour(s). Total: ₹${totalPayable}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚗 ParkSense IoT</Text>
          <Text style={styles.headerSubtitle}>Smart Driver Mobile Pass</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{plateNumber}</Text>
        </View>
      </View>

      {/* Main Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {/* Active Booking Banner */}
        {activeBooking && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerTitle}>⭐ YOUR ACTIVE PARKING</Text>
            <Text style={styles.activeBannerText}>
              {activeBooking.bay} • {activeBooking.ticketId}
            </Text>
            <Text style={styles.activeBannerSub}>
              Entry: {activeBooking.startTime} | Paid: ₹{activeBooking.total}
            </Text>
          </View>
        )}

        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <View>
            {/* 1-Hour Fixed Rate Card */}
            <View style={styles.pricingHero}>
              <Text style={styles.pricingHeroLabel}>OFFICIAL 1-HOUR FIXED PARKING TARIFF</Text>
              <Text style={styles.pricingHeroAmount}>₹ {oneHourTotal.toFixed(2)}</Text>
              <Text style={styles.pricingHeroDetail}>₹30.00 Base + ₹1.50 GST (First 15m Free)</Text>
            </View>

            {/* Quick Live Occupancy */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Live Parking Availability</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumberGreen}>{vacantSpots}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumberRed}>6</Text>
                  <Text style={styles.statLabel}>Occupied</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumberBlue}>24</Text>
                  <Text style={styles.statLabel}>Total Bays</Text>
                </View>
              </View>
            </View>

            {/* Quick Reservation Button */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleBookSpot}>
              <Text style={styles.primaryButtonText}>⚡ Reserve Nearest Free Bay Now</Text>
            </TouchableOpacity>

            {/* Duration Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Select Duration</Text>
              <View style={styles.pillRow}>
                {[1, 2, 4, 8].map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.pill, selectedHours === h && styles.pillActive]}
                    onPress={() => setSelectedHours(h)}
                  >
                    <Text style={[styles.pillText, selectedHours === h && styles.pillTextActive]}>
                      {h} Hr{h > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.calcSummary}>
                Estimated Total: ₹ {totalPayable} (incl. 5% GST)
              </Text>
            </View>
          </View>
        )}

        {/* TAB 2: RATES */}
        {activeTab === 'rates' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transparent Hourly Rate Card</Text>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>🚗 Standard Car</Text>
              <Text style={styles.rateValue}>₹ 30.00 / hr</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>🚙 Large SUV</Text>
              <Text style={styles.rateValue}>₹ 40.00 / hr</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>🏍️ Two-Wheeler</Text>
              <Text style={styles.rateValue}>₹ 15.00 / hr</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>⚡ EV + Fast Charging</Text>
              <Text style={styles.rateValue}>₹ 50.00 / hr</Text>
            </View>
          </View>
        )}

        {/* TAB 3: DIGITAL TICKET */}
        {activeTab === 'ticket' && (
          <View style={styles.ticketCard}>
            <Text style={styles.ticketHeader}>PARKSENSE DIGITAL GATE PASS</Text>
            <View style={styles.ticketDashed} />
            <Text style={styles.ticketInfo}>Ticket: {activeBooking?.ticketId || '#PS-MOB-701'}</Text>
            <Text style={styles.ticketInfo}>Vehicle: {activeBooking?.plate || plateNumber}</Text>
            <Text style={styles.ticketInfo}>Assigned Bay: {activeBooking?.bay || 'Bay L1-04'}</Text>
            <Text style={styles.ticketInfo}>Duration: {activeBooking?.hours || 1} Hour(s)</Text>
            <Text style={styles.ticketTotal}>TOTAL PAID: ₹ {activeBooking?.total || '31.50'}</Text>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>[ VERIFIED IOT QR PASS ]</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('rates')}>
          <Text style={[styles.navText, activeTab === 'rates' && styles.navTextActive]}>💰 1-Hr Rates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('ticket')}>
          <Text style={[styles.navText, activeTab === 'ticket' && styles.navTextActive]}>🎫 My Pass</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#1d4ed8',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 11, color: '#bfdbfe', fontWeight: '600' },
  badge: { backgroundColor: '#1e3a8a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ffffff', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 12 },
  body: { padding: 16, paddingBottom: 40 },
  activeBanner: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  activeBannerTitle: { color: '#e0f2fe', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  activeBannerText: { color: '#ffffff', fontSize: 16, fontWeight: '900', marginTop: 2 },
  activeBannerSub: { color: '#bae6fd', fontSize: 11, marginTop: 2 },
  pricingHero: {
    backgroundColor: '#1e40af',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  pricingHeroLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  pricingHeroAmount: { color: '#ffffff', fontSize: 36, fontWeight: '900', marginVertical: 4 },
  pricingHeroDetail: { color: '#dbeafe', fontSize: 11, fontWeight: 'bold' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumberGreen: { fontSize: 28, fontWeight: '900', color: '#059669' },
  statNumberRed: { fontSize: 28, fontWeight: '900', color: '#e11d48' },
  statNumberBlue: { fontSize: 28, fontWeight: '900', color: '#2563eb' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  primaryButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  pillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pill: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pillActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  pillText: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  pillTextActive: { color: '#ffffff' },
  calcSummary: { fontSize: 12, fontWeight: 'bold', color: '#059669', textAlign: 'center', marginTop: 4 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rateLabel: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
  rateValue: { fontSize: 13, fontWeight: '900', color: '#059669', fontFamily: 'monospace' },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  ticketHeader: { fontSize: 14, fontWeight: '900', color: '#0f172a', letterSpacing: 1 },
  ticketDashed: { width: '100%', height: 1, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', marginVertical: 12 },
  ticketInfo: { fontSize: 12, color: '#475569', marginBottom: 6, fontWeight: '600' },
  ticketTotal: { fontSize: 18, fontWeight: '900', color: '#059669', marginVertical: 8 },
  qrPlaceholder: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  qrText: { color: '#38bdf8', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  navbar: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  navTextActive: { color: '#2563eb', fontWeight: '900' },
});
