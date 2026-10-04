import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { SlotPicker } from '../components/SlotPicker';

export function SlotsScreen({
  floors,
  onBookSlot
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelectSlot = (slot, floor) => {
    setSelectedSlot(slot);
  };

  const handleBook = (slot, floor) => {
    onBookSlot(slot, floor);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🏗️</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>2D Multi-Floor Visual Deck</Text>
          <Text style={styles.subtitle}>Select any vacant bay directly from the live facility map</Text>
        </View>
      </View>

      {/* Visual Slot Picker Component */}
      <SlotPicker
        floors={floors}
        selectedSlot={selectedSlot}
        onSelectSlot={handleSelectSlot}
        onBookSlot={handleBook}
      />
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
  headerBanner: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});
