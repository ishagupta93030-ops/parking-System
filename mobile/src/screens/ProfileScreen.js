import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS } from '../theme/colors';

export function ProfileScreen({
  currentPlate,
  onOpenVehicleModal,
  isCloudConnected
}) {
  const handleTestConnection = () => {
    Alert.alert(
      'Supabase Cloud Status',
      isCloudConnected
        ? 'Connected successfully to Supabase Realtime Database. Cloud telemetry is live.'
        : 'Running in Local Offline-First Mode with immediate cache sync.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Driver Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>🚗</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Registered Smart Driver</Text>
          <Text style={styles.userSub}>Verified ParkSense Mobile Passholder</Text>
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{currentPlate}</Text>
          </View>
        </View>
      </View>

      {/* Vehicle Management Option */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onOpenVehicleModal}
        activeOpacity={0.8}
      >
        <View style={styles.menuIconBox}>
          <Text style={styles.menuIcon}>🚘</Text>
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Manage Vehicles & Plates</Text>
          <Text style={styles.menuSub}>Current: {currentPlate}</Text>
        </View>
        <Text style={styles.menuArrow}>➔</Text>
      </TouchableOpacity>

      {/* Cloud & Realtime Status */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleTestConnection}
        activeOpacity={0.8}
      >
        <View style={[styles.menuIconBox, { backgroundColor: '#064e3b' }]}>
          <Text style={styles.menuIcon}>☁️</Text>
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Supabase Cloud Database</Text>
          <Text style={styles.menuSub}>
            {isCloudConnected ? 'Connected & Broadcasting' : 'Offline Storage Active'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isCloudConnected ? COLORS.success : COLORS.warning }]} />
      </TouchableOpacity>

      {/* IoT Hardware Integration */}
      <View style={styles.infoCard}>
        <View style={styles.infoHead}>
          <Text style={styles.infoHeadTitle}>📡 ARDUINO HC-SR04 IOT LINK</Text>
          <View style={styles.iotLivePill}>
            <Text style={styles.iotLiveText}>LIVE SENSOR</Text>
          </View>
        </View>
        <Text style={styles.infoBody}>
          Level 1, Bay 01 is physically wired to an Arduino C++ ultrasonic sensor. Real-time physical vehicle entries synchronize instantaneously with your mobile app.
        </Text>
      </View>

      {/* Parking Rules & Support */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>COMMERCIAL PARKING RULES</Text>
        <Text style={styles.ruleItem}>• First 15 minutes are free grace period for drop-offs.</Text>
        <Text style={styles.ruleItem}>• Standard 1-Hour Fixed Tariff: ₹30.00 + 5% GST (₹31.50).</Text>
        <Text style={styles.ruleItem}>• Show your Digital Gate Pass at the boom barrier scanner.</Text>
        <Text style={styles.ruleItem}>• 24/7 Security & Towing Assistance: 1800-PARK-SENSE.</Text>
      </View>
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
  profileCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  userSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  plateBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  plateText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  menuItem: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  menuSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  menuArrow: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoHeadTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 0.8,
  },
  iotLivePill: {
    backgroundColor: '#065f46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iotLiveText: {
    color: '#34d399',
    fontSize: 8,
    fontWeight: '900',
  },
  infoBody: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  supportCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  supportTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  ruleItem: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 4,
  },
});
