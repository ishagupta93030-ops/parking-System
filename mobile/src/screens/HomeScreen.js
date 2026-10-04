import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../theme/colors';
import { FacilityCard } from '../components/FacilityCard';
import { PARKING_FACILITIES } from '../data/facilitiesData';

export function HomeScreen({
  activeBooking,
  onQuickPark,
  onOpenPass,
  onSelectFacility,
  onBookFacility,
  totalVacantSpots,
  totalCapacity,
  onOpenRates
}) {
  const occupiedCount = totalCapacity - totalVacantSpots;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ACTIVE BOOKING NOTIFICATION BANNER */}
      {activeBooking ? (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={onOpenPass}
          activeOpacity={0.85}
        >
          <View style={styles.activeBannerTop}>
            <View style={styles.activeBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeBadgeText}>ACTIVE PARKING SESSION</Text>
            </View>
            <Text style={styles.viewPassLink}>View Gate Pass ➔</Text>
          </View>

          <View style={styles.activeBannerMain}>
            <View>
              <Text style={styles.activeBayText}>{activeBooking.bay}</Text>
              <Text style={styles.activePlateText}>Vehicle: {activeBooking.plate}</Text>
            </View>
            <View style={styles.activeCostBox}>
              <Text style={styles.activeCostLabel}>PAID</Text>
              <Text style={styles.activeCostValue}>₹{activeBooking.totalAmount || activeBooking.total}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* 1-TAP QUICK PARK HERO BUTTON */}
      <TouchableOpacity
        style={styles.quickParkHero}
        onPress={onQuickPark}
        activeOpacity={0.85}
      >
        <View style={styles.quickParkContent}>
          <View style={styles.quickIconBox}>
            <Text style={styles.quickIcon}>⚡</Text>
          </View>
          <View style={styles.quickTextContainer}>
            <Text style={styles.quickParkTitle}>1-TAP AUTO PARK</Text>
            <Text style={styles.quickParkSub}>Instant reservation for nearest free bay</Text>
          </View>
        </View>
        <View style={styles.quickParkArrow}>
          <Text style={styles.arrowText}>➔</Text>
        </View>
      </TouchableOpacity>

      {/* 1-HOUR FIXED RATE HIGHLIGHT CARD */}
      <TouchableOpacity
        style={styles.pricingHighlight}
        onPress={onOpenRates}
        activeOpacity={0.9}
      >
        <View style={styles.pricingHeader}>
          <Text style={styles.pricingTag}>OFFICIAL 1-HOUR FIXED TARIFF</Text>
          <Text style={styles.taxInfo}>+5% GST Applied</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={styles.priceAmount}>₹ 31.50</Text>
          <View style={styles.priceDetail}>
            <Text style={styles.priceBreak}>₹30.00 Base / 1 hr</Text>
            <Text style={styles.graceText}>First 15m Grace Free</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* LIVE OCCUPANCY STATS WIDGET */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>CITY PARKING AVAILABILITY</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statGreen}>{totalVacantSpots}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statRed}>{occupiedCount}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBlue}>{totalCapacity}</Text>
            <Text style={styles.statLabel}>Total Bays</Text>
          </View>
        </View>
      </View>

      {/* NEARBY PARKING FACILITIES LIST */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>NEARBY FACILITIES</Text>
        <Text style={styles.listSubtitle}>Live IoT Vacancy Data</Text>
      </View>

      {PARKING_FACILITIES.map(facility => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onSelect={onSelectFacility}
          onBookDirect={onBookFacility}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  activeBanner: {
    backgroundColor: '#0284c7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    shadowColor: '#0284c7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  activeBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewPassLink: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '800',
  },
  activeBannerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBayText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  activePlateText: {
    fontSize: 11,
    color: '#bae6fd',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  activeCostBox: {
    alignItems: 'flex-end',
  },
  activeCostLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#bae6fd',
  },
  activeCostValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  quickParkHero: {
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#059669',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  quickParkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 22,
  },
  quickTextContainer: {
    justifyContent: 'center',
  },
  quickParkTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  quickParkSub: {
    fontSize: 10,
    color: '#d1fae5',
    fontWeight: '600',
    marginTop: 2,
  },
  quickParkArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pricingHighlight: {
    backgroundColor: '#1e3a8a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pricingTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#93c5fd',
    letterSpacing: 1,
  },
  taxInfo: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6ee7b7',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  priceDetail: {
    alignItems: 'flex-end',
  },
  priceBreak: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dbeafe',
  },
  graceText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#93c5fd',
  },
  statsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statGreen: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.success,
  },
  statRed: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.danger,
  },
  statBlue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listHeader: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  listSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
