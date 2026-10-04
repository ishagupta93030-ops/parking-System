import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { COLORS } from '../theme/colors';
import { QrCodeView } from './QrCodeView';
import { formatRemainingTime } from '../services/bookingService';

export function DigitalPassModal({
  visible,
  onClose,
  booking,
  onLeaveBay,
  onExtendDuration
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(3600);

  useEffect(() => {
    if (!booking) return;

    // Default remaining duration in seconds
    const totalSecs = (booking.hours || 1) * 3600;
    setRemainingSeconds(totalSecs);

    const interval = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  if (!visible || !booking) return null;

  const handleLeaveConfirm = () => {
    Alert.alert(
      'Leave Parking Bay?',
      `Are you ready to check out and vacate ${booking.bay}? Automated barrier will open for exit.`,
      [
        { text: 'Stay Parked', style: 'cancel' },
        {
          text: 'Leave Bay & End Pass',
          style: 'destructive',
          onPress: () => onLeaveBay(booking)
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Close Header */}
          <View style={styles.topBar}>
            <Text style={styles.passTitle}>🎫 DIGITAL PARKING PASS</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Live Session Timer Banner */}
            <View style={styles.timerBanner}>
              <Text style={styles.timerLabel}>REMAINING PARKING TIME</Text>
              <Text style={styles.timerCount}>{formatRemainingTime(remainingSeconds)}</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveText}>Active Live Session</Text>
              </View>
            </View>

            {/* Scannable Ticket Pass Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.hubName}>PARKSENSE AUTOMATED HUB</Text>
                <Text style={styles.ticketCode}>{booking.ticketId}</Text>
              </View>

              {/* Scannable QR Code */}
              <QrCodeView
                ticketId={booking.ticketId}
                bayName={booking.bay}
                plateNumber={booking.plate}
              />

              <View style={styles.dashedDivider} />

              {/* Ticket Details Grid */}
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ASSIGNED BAY</Text>
                  <Text style={styles.detailValueGreen}>{booking.bay}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VEHICLE PLATE</Text>
                  <Text style={styles.detailValue}>{booking.plate}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ENTRY TIME</Text>
                  <Text style={styles.detailValue}>{booking.startTime || 'Just Now'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>PAID TARIFF</Text>
                  <Text style={styles.detailValueGold}>₹ {booking.totalAmount || booking.total}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.leaveBtn}
                onPress={handleLeaveConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.leaveBtnText}>🚪 Leave Bay / Gate Checkout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerBanner: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#bfdbfe',
    letterSpacing: 1,
  },
  timerCount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86efac',
  },
  ticketCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  hubName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  ticketCode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '46%',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  detailValueGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34d399',
    marginTop: 2,
  },
  detailValueGold: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fbbf24',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  leaveBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  leaveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
