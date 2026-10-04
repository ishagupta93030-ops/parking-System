import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { COLORS } from '../theme/colors';

const INITIAL_VEHICLES = [
  { plate: 'DL 01 AB 4589', type: 'car', label: 'Primary Sedan', icon: '🚗' },
  { plate: 'UP 16 CD 9900', type: 'suv', label: 'Family SUV', icon: '🚙' },
  { plate: 'HR 26 EF 3344', type: 'ev', label: 'EV City Commuter', icon: '⚡' }
];

export function VehicleManagerModal({
  visible,
  onClose,
  currentPlate,
  onSelectPlate
}) {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [newPlate, setNewPlate] = useState('');
  const [newLabel, setNewLabel] = useState('');

  if (!visible) return null;

  const handleAddVehicle = () => {
    if (!newPlate.trim()) return;
    const formatted = newPlate.toUpperCase().trim();
    const created = {
      plate: formatted,
      type: 'car',
      label: newLabel.trim() || 'My Vehicle',
      icon: '🚗'
    };
    setVehicles([...vehicles, created]);
    onSelectPlate(formatted);
    setNewPlate('');
    setNewLabel('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🚘 My Vehicle Garage</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Vehicle List */}
            <Text style={styles.sectionTitle}>SELECT ACTIVE VEHICLE</Text>
            {vehicles.map((v, idx) => {
              const isSelected = v.plate === currentPlate;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
                  onPress={() => {
                    onSelectPlate(v.plate);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconBox}>
                    <Text style={styles.iconText}>{v.icon}</Text>
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehiclePlate}>{v.plate}</Text>
                    <Text style={styles.vehicleLabel}>{v.label}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add New Vehicle Form */}
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>+ Add Another Vehicle</Text>

              <TextInput
                style={styles.input}
                value={newPlate}
                onChangeText={setNewPlate}
                placeholder="License Plate (e.g. DL 08 Z 1234)"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />

              <TextInput
                style={styles.input}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Vehicle Nickname (e.g. Red City Hatchback)"
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddVehicle}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>Save Vehicle to App</Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
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
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  vehicleCard: {
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  vehicleCardActive: {
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  vehicleLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
  },
  addCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  addTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '900',
  },
});
