import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../theme/colors';
import { VEHICLE_TYPES, DURATION_OPTIONS } from '../data/facilitiesData';
import { calculateParkingCost } from '../services/bookingService';

export function BookingModal({
  visible,
  onClose,
  facility,
  slot,
  currentPlate,
  onConfirmBooking
}) {
  const [vehicleType, setVehicleType] = useState('car');
  const [selectedHours, setSelectedHours] = useState(1);
  const [plate, setPlate] = useState(currentPlate || 'DL 01 AB 4589');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible || !facility) return null;

  const costSummary = calculateParkingCost(facility.ratePerHour, vehicleType, selectedHours);

  const handleProceed = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmBooking({
        facility,
        slot,
        vehicleType,
        plate: plate.toUpperCase().trim(),
        hours: selectedHours,
        costSummary
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Top Bar Indicator */}
          <View style={styles.notch} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>⚡ Reserve Parking Bay</Text>
              <Text style={styles.headerSubtitle}>{facility.name}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Assigned Bay Info */}
            <View style={styles.bayBanner}>
              <View style={styles.bayIconBox}>
                <Text style={styles.bayIcon}>🅿️</Text>
              </View>
              <View style={styles.bayDetails}>
                <Text style={styles.bayLabel}>DESIGNATED PARKING BAY</Text>
                <Text style={styles.bayName}>
                  {slot ? `${slot.id} • ${slot.name}` : 'Auto-Assigned Nearest Free Bay'}
                </Text>
              </View>
            </View>

            {/* Vehicle Type Selector */}
            <Text style={styles.sectionTitle}>1. Select Vehicle Type</Text>
            <View style={styles.vehicleGrid}>
              {VEHICLE_TYPES.map(vt => {
                const isSelected = vehicleType === vt.id;
                return (
                  <TouchableOpacity
                    key={vt.id}
                    style={[styles.vehicleOption, isSelected && styles.vehicleOptionActive]}
                    onPress={() => setVehicleType(vt.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.vtIcon}>{vt.icon}</Text>
                    <Text style={[styles.vtLabel, isSelected && styles.vtLabelActive]}>{vt.label}</Text>
                    <Text style={styles.vtSub}>{vt.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* License Plate Input */}
            <Text style={styles.sectionTitle}>2. Vehicle License Plate</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>IND 🇮🇳</Text>
              <TextInput
                style={styles.plateInput}
                value={plate}
                onChangeText={setPlate}
                placeholder="DL 01 AB 1234"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {/* Duration Selector */}
            <Text style={styles.sectionTitle}>3. Select Parking Duration</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map(opt => {
                const isSelected = selectedHours === opt.hours;
                return (
                  <TouchableOpacity
                    key={opt.hours}
                    style={[styles.durationPill, isSelected && styles.durationPillActive]}
                    onPress={() => setSelectedHours(opt.hours)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.durationText, isSelected && styles.durationTextActive]}>
                      {opt.label}
                    </Text>
                    {opt.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>POPULAR</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Breakdown Bill */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>TARIFF BREAKDOWN</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Base Tariff ({costSummary.vehicleLabel})</Text>
                <Text style={styles.billValue}>₹ {costSummary.ratePerHour.toFixed(2)}/hr</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Duration ({selectedHours} hr{selectedHours > 1 ? 's' : ''})</Text>
                <Text style={styles.billValue}>₹ {costSummary.baseFare.toFixed(2)}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>GST Tax (5%)</Text>
                <Text style={styles.billValue}>₹ {costSummary.tax.toFixed(2)}</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
                <Text style={styles.totalAmount}>₹ {costSummary.totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {/* Confirmation CTA Button */}
            <TouchableOpacity
              style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
              onPress={handleProceed}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  Pay & Reserve Pass (₹{costSummary.totalAmount.toFixed(2)}) ➔
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  notch: {
    width: 44,
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bayBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bayIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bayIcon: {
    fontSize: 20,
  },
  bayDetails: {
    flex: 1,
  },
  bayLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  bayName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  vehicleOption: {
    width: '48%',
    backgroundColor: '#131b2e',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  vehicleOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  vtIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  vtLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  vtLabelActive: {
    color: '#60a5fa',
  },
  vtSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputPrefix: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  plateInput: {
    flex: 1,
    height: 46,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  durationPill: {
    backgroundColor: '#131b2e',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  durationPillActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  durationTextActive: {
    color: '#ffffff',
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularText: {
    color: '#000000',
    fontSize: 7,
    fontWeight: '900',
  },
  billCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  billValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#334155',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
