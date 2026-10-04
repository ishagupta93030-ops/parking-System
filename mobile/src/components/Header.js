import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export function Header({ currentPlate, onOpenVehicleModal, isCloudConnected, activeBooking }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🚗</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>ParkSense</Text>
              <View style={styles.iotBadge}>
                <Text style={styles.iotText}>IoT 2.0</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Smart Driver Android Pass</Text>
          </View>
        </View>

        {/* Right side: Vehicle plate badge + connection pill */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.plateBadge}
            onPress={onOpenVehicleModal}
            activeOpacity={0.8}
          >
            <Text style={styles.plateLabel}>VEHICLE</Text>
            <Text style={styles.plateText}>{currentPlate}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cloud & IoT Status Strip */}
      <View style={styles.statusStrip}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: isCloudConnected ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.statusText}>
            {isCloudConnected ? 'Supabase Realtime Live' : 'Offline-First Sync'}
          </Text>
        </View>

        {activeBooking && (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>⚡ PARKED: {activeBooking.bay}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  logoIcon: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  iotBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  iotText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-end',
  },
  plateLabel: {
    color: '#38bdf8',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  plateText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusStrip: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  activePillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
});
