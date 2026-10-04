import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';

export function SlotPicker({ floors, selectedSlot, onSelectSlot, onBookSlot }) {
  const [activeFloorId, setActiveFloorId] = useState('L1');

  const currentFloor = floors.find(f => f.id === activeFloorId) || floors[0];
  const vacantCount = currentFloor.slots.filter(s => s.status === 'VACANT').length;

  return (
    <View style={styles.container}>
      {/* Floor Tab Selector */}
      <View style={styles.floorTabRow}>
        {floors.map(floor => {
          const isCurrent = floor.id === activeFloorId;
          const floorVacant = floor.slots.filter(s => s.status === 'VACANT').length;
          return (
            <TouchableOpacity
              key={floor.id}
              style={[styles.floorTab, isCurrent && styles.floorTabActive]}
              onPress={() => setActiveFloorId(floor.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.floorTabText, isCurrent && styles.floorTabTextActive]}>
                {floor.id}
              </Text>
              <View style={[styles.floorBadge, isCurrent ? styles.floorBadgeActive : null]}>
                <Text style={styles.floorBadgeText}>{floorVacant} Free</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floor Header Info */}
      <View style={styles.floorInfoCard}>
        <View>
          <Text style={styles.floorTitle}>{currentFloor.name}</Text>
          <Text style={styles.floorSubtitle}>{currentFloor.description}</Text>
        </View>
        <View style={styles.floorStat}>
          <Text style={styles.statCount}>{vacantCount}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
      </View>

      {/* Status Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Vacant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
          <Text style={styles.legendText}>EV</Text>
        </View>
      </View>

      {/* 2D Parking Bay Visual Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.entryLane}>
          <Text style={styles.laneText}>◄ IN / OUT DRIVE LANE ►</Text>
        </View>

        <View style={styles.slotsGrid}>
          {currentFloor.slots.map(slot => {
            const isSelected = selectedSlot?.id === slot.id;
            const isVacant = slot.status === 'VACANT';
            const isOccupied = slot.status === 'OCCUPIED';
            const isReserved = slot.status === 'RESERVED';

            let bgColor = '#1e293b';
            let borderColor = '#334155';
            let statusTextColor = COLORS.textMuted;

            if (isVacant) {
              bgColor = isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)';
              borderColor = isSelected ? COLORS.success : 'rgba(16, 185, 129, 0.5)';
              statusTextColor = COLORS.success;
            } else if (isOccupied) {
              bgColor = 'rgba(239, 68, 68, 0.12)';
              borderColor = 'rgba(239, 68, 68, 0.4)';
              statusTextColor = COLORS.danger;
            } else if (isReserved) {
              bgColor = 'rgba(245, 158, 11, 0.12)';
              borderColor = 'rgba(245, 158, 11, 0.4)';
              statusTextColor = COLORS.warning;
            }

            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  { backgroundColor: bgColor, borderColor: borderColor },
                  isSelected && styles.slotCardSelected
                ]}
                onPress={() => isVacant && onSelectSlot(slot, currentFloor)}
                disabled={!isVacant}
                activeOpacity={0.8}
              >
                {/* Header of Bay */}
                <View style={styles.slotHeader}>
                  <Text style={styles.slotIdText}>{slot.id}</Text>
                  {slot.isHardware && (
                    <View style={styles.hwPill}>
                      <Text style={styles.hwPillText}>IoT</Text>
                    </View>
                  )}
                  {slot.type === 'ev' && (
                    <Text style={styles.typeIcon}>⚡</Text>
                  )}
                  {slot.type === 'handicap' && (
                    <Text style={styles.typeIcon}>♿</Text>
                  )}
                </View>

                {/* Bay Center Graphic */}
                <View style={styles.slotGraphic}>
                  {isVacant ? (
                    <View style={styles.vacantGraphic}>
                      <Text style={styles.vacantIcon}>🅿️</Text>
                      <Text style={styles.vacantText}>FREE</Text>
                    </View>
                  ) : isOccupied ? (
                    <View style={styles.occupiedGraphic}>
                      <Text style={styles.carIcon}>🚗</Text>
                      <Text style={styles.plateText} numberOfLines={1}>{slot.plate || 'CAR'}</Text>
                    </View>
                  ) : (
                    <View style={styles.occupiedGraphic}>
                      <Text style={styles.carIcon}>🔒</Text>
                      <Text style={styles.reservedText}>RESERVED</Text>
                    </View>
                  )}
                </View>

                {/* Bay Footer */}
                <View style={styles.slotFooter}>
                  <Text style={[styles.statusText, { color: statusTextColor }]}>
                    {slot.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Slot Action Bar */}
      {selectedSlot && (
        <View style={styles.selectionBar}>
          <View>
            <Text style={styles.selectionLabel}>SELECTED PARKING BAY</Text>
            <Text style={styles.selectionTitle}>{selectedSlot.id} • {selectedSlot.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.reserveBtn}
            onPress={() => onBookSlot(selectedSlot, currentFloor)}
            activeOpacity={0.8}
          >
            <Text style={styles.reserveBtnText}>Book This Bay ➔</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  floorTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  floorTab: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  floorTabActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  floorTabText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  floorTabTextActive: {
    color: '#ffffff',
  },
  floorBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  floorBadgeActive: {
    backgroundColor: '#1e3a8a',
  },
  floorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
  },
  floorInfoCard: {
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  floorTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  floorSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  floorStat: {
    alignItems: 'flex-end',
  },
  statCount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.success,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  gridContainer: {
    backgroundColor: '#0b0f19',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  entryLane: {
    backgroundColor: '#1e293b',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  laneText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  slotCard: {
    width: '48%',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    minHeight: 95,
    justifyContent: 'space-between',
  },
  slotCardSelected: {
    borderColor: '#60a5fa',
    borderWidth: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotIdText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  hwPill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hwPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
  },
  typeIcon: {
    fontSize: 12,
  },
  slotGraphic: {
    alignItems: 'center',
    marginVertical: 4,
  },
  vacantGraphic: {
    alignItems: 'center',
  },
  vacantIcon: {
    fontSize: 18,
  },
  vacantText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.success,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  occupiedGraphic: {
    alignItems: 'center',
  },
  carIcon: {
    fontSize: 18,
  },
  plateText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f87171',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  reservedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fbbf24',
    marginTop: 2,
  },
  slotFooter: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selectionBar: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  selectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#bfdbfe',
    letterSpacing: 0.8,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  reserveBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reserveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
