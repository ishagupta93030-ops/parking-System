import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { COLORS } from './src/theme/colors';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreMapScreen } from './src/screens/ExploreMapScreen';
import { SlotsScreen } from './src/screens/SlotsScreen';
import { MyPassScreen } from './src/screens/MyPassScreen';
import { RatesScreen } from './src/screens/RatesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BookingModal } from './src/components/BookingModal';
import { DigitalPassModal } from './src/components/DigitalPassModal';
import { VehicleManagerModal } from './src/components/VehicleManagerModal';
import { INITIAL_FLOORS } from './src/data/slotsData';
import { PARKING_FACILITIES } from './src/data/facilitiesData';
import {
  generateTicketId,
  findNearestVacantSlot,
  calculateParkingCost
} from './src/services/bookingService';
import {
  createCloudBooking,
  releaseCloudBooking,
  subscribeToSlotChanges,
  getClient
} from './src/services/supabaseService';

export default function App() {
  // Navigation & Screen Tab
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'explore', 'slots', 'pass', 'rates', 'profile'

  // Application Data State
  const [floors, setFloors] = useState(INITIAL_FLOORS);
  const [currentPlate, setCurrentPlate] = useState('DL 01 AB 4589');
  const [activeBooking, setActiveBooking] = useState(null);
  const [history, setHistory] = useState([
    {
      ticketId: '#PS-MOB-9120',
      plate: 'DL 01 AB 4589',
      bay: 'Bay L1-03',
      entryTime: 'Yesterday, 04:30 PM',
      totalAmount: '31.50',
      status: 'COMPLETED'
    }
  ]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Modals
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [modalFacility, setModalFacility] = useState(PARKING_FACILITIES[0]);
  const [modalSlot, setModalSlot] = useState(null);

  // Initialize Supabase & Real-time Listeners
  useEffect(() => {
    const client = getClient();
    if (client) {
      setIsCloudConnected(true);
    }

    const channel = subscribeToSlotChanges(payload => {
      if (payload && payload.new) {
        const { name, status, plate } = payload.new;
        setFloors(prevFloors =>
          prevFloors.map(floor => ({
            ...floor,
            slots: floor.slots.map(s =>
              s.name === name ? { ...s, status, plate: plate || null } : s
            )
          }))
        );
      }
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  // Compute Total Live Vacancy
  const totalCapacity = floors.reduce((acc, f) => acc + f.slots.length, 0);
  const totalVacantSpots = floors.reduce(
    (acc, f) => acc + f.slots.filter(s => s.status === 'VACANT').length,
    0
  );

  // Quick 1-Tap Booking Trigger
  const handleQuickPark = () => {
    if (activeBooking) {
      Alert.alert(
        'Active Parking Exists',
        `You already have an active pass in ${activeBooking.bay}. View your gate pass or check out first.`,
        [
          { text: 'View Pass', onPress: () => setPassModalVisible(true) },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    const nearest = findNearestVacantSlot(floors);
    if (!nearest) {
      Alert.alert('Facility Full', 'All bays are currently occupied. Please select another facility.');
      return;
    }

    setModalFacility(PARKING_FACILITIES[0]);
    setModalSlot(nearest.slot);
    setBookingModalVisible(true);
  };

  // Select Facility Direct Book
  const handleBookFacility = (facility) => {
    setModalFacility(facility);
    const nearest = findNearestVacantSlot(floors);
    setModalSlot(nearest ? nearest.slot : null);
    setBookingModalVisible(true);
  };

  // Select Specific Slot from 2D Layout
  const handleBookSpecificSlot = (slot, floor) => {
    setModalFacility(PARKING_FACILITIES[0]);
    setModalSlot(slot);
    setBookingModalVisible(true);
  };

  // Complete Reservation & Commit
  const handleConfirmBooking = async (bookingData) => {
    const ticketId = generateTicketId();
    const bayName = bookingData.slot ? bookingData.slot.name : 'Bay L1-01';
    const slotId = bookingData.slot ? bookingData.slot.id : 'L1-01';

    const newBooking = {
      ticketId,
      plate: bookingData.plate,
      bay: `${slotId} (${bayName})`,
      slotId,
      hours: bookingData.hours,
      baseFare: bookingData.costSummary.baseFare,
      tax: bookingData.costSummary.tax,
      totalAmount: bookingData.costSummary.totalAmount,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    // 1. Update local slot state to OCCUPIED
    setFloors(prev =>
      prev.map(floor => ({
        ...floor,
        slots: floor.slots.map(s =>
          s.id === slotId ? { ...s, status: 'OCCUPIED', plate: bookingData.plate } : s
        )
      }))
    );

    // 2. Set active booking & history
    setActiveBooking(newBooking);
    setHistory(prev => [newBooking, ...prev]);

    // 3. Dispatch to Supabase Cloud
    await createCloudBooking({
      ticketId,
      plate: bookingData.plate,
      bay: bayName,
      hours: bookingData.hours,
      baseFare: bookingData.costSummary.baseFare,
      tax: bookingData.costSummary.tax,
      totalAmount: bookingData.costSummary.totalAmount
    });

    // Close booking modal and open gate pass
    setBookingModalVisible(false);
    setPassModalVisible(true);

    Alert.alert(
      '🎉 Booking Confirmed!',
      `Your digital gate pass is ready for ${newBooking.bay}. Show QR at the entrance boom barrier.`
    );
  };

  // Leave Bay & Check out
  const handleLeaveBay = async (booking) => {
    // 1. Free local slot
    if (booking.slotId) {
      setFloors(prev =>
        prev.map(floor => ({
          ...floor,
          slots: floor.slots.map(s =>
            s.id === booking.slotId ? { ...s, status: 'VACANT', plate: null } : s
          )
        }))
      );
    }

    // 2. Cloud release
    await releaseCloudBooking(booking.ticketId, booking.bay);

    // 3. Clear active booking
    setActiveBooking(null);
    setPassModalVisible(false);

    Alert.alert(
      '🚗 Parking Session Ended',
      `Thank you for using ParkSense IoT! The exit barrier has been signaled.`
    );
  };

  // Rate calculator booking redirect
  const handleRateBookRedirect = (facility, vehicleType, hours) => {
    setModalFacility(facility);
    const nearest = findNearestVacantSlot(floors);
    setModalSlot(nearest ? nearest.slot : null);
    setBookingModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Header */}
      <Header
        currentPlate={currentPlate}
        onOpenVehicleModal={() => setVehicleModalVisible(true)}
        isCloudConnected={isCloudConnected}
        activeBooking={activeBooking}
      />

      {/* Screen Body Viewport */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            activeBooking={activeBooking}
            onQuickPark={handleQuickPark}
            onOpenPass={() => setPassModalVisible(true)}
            onSelectFacility={fac => {
              setModalFacility(fac);
              setActiveTab('rates');
            }}
            onBookFacility={handleBookFacility}
            totalVacantSpots={totalVacantSpots}
            totalCapacity={totalCapacity}
            onOpenRates={() => setActiveTab('rates')}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreMapScreen
            onSelectFacility={fac => {
              setModalFacility(fac);
              setActiveTab('rates');
            }}
            onBookFacility={handleBookFacility}
          />
        )}

        {activeTab === 'slots' && (
          <SlotsScreen
            floors={floors}
            onBookSlot={handleBookSpecificSlot}
          />
        )}

        {activeTab === 'pass' && (
          <MyPassScreen
            activeBooking={activeBooking}
            history={history}
            onLeaveBay={handleLeaveBay}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'rates' && (
          <RatesScreen
            onProceedToBooking={handleRateBookRedirect}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            currentPlate={currentPlate}
            onOpenVehicleModal={() => setVehicleModalVisible(true)}
            isCloudConnected={isCloudConnected}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('explore')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'explore' && styles.navIconActive]}>🗺️</Text>
          <Text style={[styles.navLabel, activeTab === 'explore' && styles.navLabelActive]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('slots')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'slots' && styles.navIconActive]}>🏗️</Text>
          <Text style={[styles.navLabel, activeTab === 'slots' && styles.navLabelActive]}>Floors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('pass')}
          activeOpacity={0.8}
        >
          <View style={styles.passIconWrap}>
            <Text style={[styles.navIcon, activeTab === 'pass' && styles.navIconActive]}>🎫</Text>
            {activeBooking && <View style={styles.navBadgeDot} />}
          </View>
          <Text style={[styles.navLabel, activeTab === 'pass' && styles.navLabelActive]}>My Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('rates')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'rates' && styles.navIconActive]}>💰</Text>
          <Text style={[styles.navLabel, activeTab === 'rates' && styles.navLabelActive]}>Tariff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <BookingModal
        visible={bookingModalVisible}
        onClose={() => setBookingModalVisible(false)}
        facility={modalFacility}
        slot={modalSlot}
        currentPlate={currentPlate}
        onConfirmBooking={handleConfirmBooking}
      />

      <DigitalPassModal
        visible={passModalVisible}
        onClose={() => setPassModalVisible(false)}
        booking={activeBooking}
        onLeaveBay={handleLeaveBay}
      />

      <VehicleManagerModal
        visible={vehicleModalVisible}
        onClose={() => setVehicleModalVisible(false)}
        currentPlate={currentPlate}
        onSelectPlate={setCurrentPlate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  bottomNav: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passIconWrap: {
    position: 'relative',
  },
  navBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.success,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1.0,
    transform: [{ scale: 1.15 }],
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '900',
  },
});
