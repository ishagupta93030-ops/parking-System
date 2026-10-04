import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { PARKING_FACILITIES, VEHICLE_TYPES, DURATION_OPTIONS } from '../data/facilitiesData';
import { calculateParkingCost } from '../services/bookingService';

export function RateCalculator({ onProceedToBooking }) {
  const [selectedFacility, setSelectedFacility] = useState(PARKING_FACILITIES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [selectedHours, setSelectedHours] = useState(1);

  const cost = calculateParkingCost(selectedFacility.ratePerHour, selectedVehicle, selectedHours);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1-Hour Fixed Tariff Hero */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTag}>OFFICIAL 1-HOUR FIXED PARKING TARIFF</Text>
        <Text style={styles.heroRate}>
          ₹ {(selectedFacility.ratePerHour * 1.05).toFixed(2)}
        </Text>
        <Text style={styles.heroSub}>
          ₹{selectedFacility.ratePerHour.toFixed(2)} Base + ₹{(selectedFacility.ratePerHour * 0.05).toFixed(2)} GST (5%)
        </Text>
      </View>

      {/* Facility Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Select Facility</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facRow}>
          {PARKING_FACILITIES.map(fac => {
            const isSelected = fac.id === selectedFacility.id;
            return (
              <TouchableOpacity
                key={fac.id}
                style={[styles.facChip, isSelected && styles.facChipActive]}
                onPress={() => setSelectedFacility(fac)}
                activeOpacity={0.8}
              >
                <Text style={[styles.facName, isSelected && styles.facNameActive]}>{fac.name}</Text>
                <Text style={styles.facRate}>₹{fac.ratePerHour}/hr base</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Vehicle Category Matrix */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Vehicle Category & Multiplier</Text>
        <View style={styles.vehicleGrid}>
          {VEHICLE_TYPES.map(vt => {
            const isSelected = selectedVehicle === vt.id;
            const vtHourly = (selectedFacility.ratePerHour * vt.baseMultiplier).toFixed(2);
            return (
              <TouchableOpacity
                key={vt.id}
                style={[styles.vehicleBox, isSelected && styles.vehicleBoxActive]}
                onPress={() => setSelectedVehicle(vt.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.vehicleIcon}>{vt.icon}</Text>
                <Text style={[styles.vehicleTitle, isSelected && styles.vehicleTitleActive]}>{vt.label}</Text>
                <Text style={styles.vehiclePrice}>₹{vtHourly}/hr</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Duration Selector */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Duration Period</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map(opt => {
            const isSelected = selectedHours === opt.hours;
            return (
              <TouchableOpacity
                key={opt.hours}
                style={[styles.durPill, isSelected && styles.durPillActive]}
                onPress={() => setSelectedHours(opt.hours)}
                activeOpacity={0.8}
              >
                <Text style={[styles.durText, isSelected && styles.durTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Calculated Breakdown Card */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>ESTIMATED TARIFF INVOICE</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Base Hourly Fee</Text>
          <Text style={styles.rowVal}>₹ {cost.ratePerHour.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duration ({selectedHours}h)</Text>
          <Text style={styles.rowVal}>₹ {cost.baseFare.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Govt. GST (5%)</Text>
          <Text style={styles.rowVal}>₹ {cost.tax.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total Amount</Text>
          <Text style={styles.totalNum}>₹ {cost.totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.bookThisBtn}
          onPress={() => onProceedToBooking(selectedFacility, selectedVehicle, selectedHours)}
          activeOpacity={0.85}
        >
          <Text style={styles.bookThisText}>⚡ Book with this Rate ➔</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heroBanner: {
    backgroundColor: '#1e40af',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  heroTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#bfdbfe',
    letterSpacing: 1,
  },
  heroRate: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  heroSub: {
    fontSize: 11,
    color: '#dbeafe',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  facRow: {
    flexDirection: 'row',
  },
  facChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  facChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  facName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
  },
  facNameActive: {
    color: '#ffffff',
  },
  facRate: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleBox: {
    width: '48%',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  vehicleBoxActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  vehicleIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  vehicleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vehicleTitleActive: {
    color: '#60a5fa',
  },
  vehiclePrice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34d399',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durPill: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  durPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  durText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
  },
  durTextActive: {
    color: '#ffffff',
  },
  breakdownCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 30,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  rowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  totalNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  bookThisBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookThisText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
