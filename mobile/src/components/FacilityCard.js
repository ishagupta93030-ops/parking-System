import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export function FacilityCard({ facility, onSelect, onBookDirect }) {
  const occupancyPct = Math.round(((facility.totalSpots - facility.vacantSpots) / facility.totalSpots) * 100);
  const isAvailable = facility.vacantSpots > 0;

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.titleInfo}>
          <View style={styles.badgeRow}>
            {facility.isCurrentFacility && (
              <View style={styles.iotBadge}>
                <Text style={styles.iotBadgeText}>⚡ LIVE IOT HUB</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{facility.category || 'Deck'}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {facility.rating}</Text>
            </View>
          </View>
          <Text style={styles.facilityName}>{facility.name}</Text>
          <Text style={styles.addressText}>📍 {facility.address}</Text>
        </View>
      </View>

      {/* Distance & Time strip */}
      <View style={styles.distanceStrip}>
        <Text style={styles.distanceText}>
          {facility.distanceKm === 0 ? '🎯 Current Location' : `🚗 ${facility.distanceKm} km (${facility.driveTimeMin} mins drive)`}
        </Text>
        <Text style={styles.openHoursText}>🕒 {facility.operatingHours}</Text>
      </View>

      {/* Live Vacancy Meter */}
      <View style={styles.vacancyContainer}>
        <View style={styles.vacancyHeader}>
          <Text style={styles.vacancyLabel}>LIVE VACANCY</Text>
          <Text style={[styles.vacancyCount, { color: isAvailable ? COLORS.success : COLORS.danger }]}>
            {facility.vacantSpots} of {facility.totalSpots} Bays Free
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, occupancyPct)}%`,
                backgroundColor: occupancyPct > 85 ? COLORS.danger : occupancyPct > 60 ? COLORS.warning : COLORS.success
              }
            ]}
          />
        </View>
      </View>

      {/* Rate & Features */}
      <View style={styles.featuresRow}>
        {facility.features.slice(0, 3).map((feat, idx) => (
          <View key={idx} style={styles.featureChip}>
            <Text style={styles.featureText}>✓ {feat}</Text>
          </View>
        ))}
      </View>

      {/* Price & Action Row */}
      <View style={styles.actionRow}>
        <View>
          <Text style={styles.rateLabel}>1-HOUR TARIFF</Text>
          <Text style={styles.rateValue}>₹ {facility.ratePerHour.toFixed(2)}<Text style={styles.perHourText}>/hr</Text></Text>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onSelect(facility)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>View Rates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
            onPress={() => isAvailable && onBookDirect(facility)}
            disabled={!isAvailable}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnText}>
              {isAvailable ? '⚡ Reserve Bay' : 'Full'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  iotBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  iotBadgeText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
  },
  categoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '900',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  addressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  distanceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
  },
  openHoursText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  vacancyContainer: {
    marginBottom: 10,
  },
  vacancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  vacancyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  vacancyCount: {
    fontSize: 11,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  featureChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  rateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  perHourText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailsBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  bookBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bookBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
