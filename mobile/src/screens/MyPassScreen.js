import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../theme/colors';
import { QrCodeView } from '../components/QrCodeView';

export function MyPassScreen({
  activeBooking,
  history,
  onLeaveBay,
  onNavigateHome
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ACTIVE PASS SECTION */}
      {activeBooking ? (
        <View style={styles.passSection}>
          <View style={styles.liveTag}>
            <View style={styles.pulse} />
            <Text style={styles.liveTagText}>ACTIVE DIGITAL GATE PASS</Text>
          </View>

          {/* Ticket Card */}
          <View style={styles.ticketCard}>
            <Text style={styles.hubTitle}>PARKSENSE SMART PARKING HUB</Text>
            <Text style={styles.ticketNum}>{activeBooking.ticketId}</Text>

            {/* QR Code */}
            <QrCodeView
              ticketId={activeBooking.ticketId}
              bayName={activeBooking.bay}
              plateNumber={activeBooking.plate}
            />

            <View style={styles.divider} />

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ASSIGNED BAY</Text>
                <Text style={styles.infoValGreen}>{activeBooking.bay}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>VEHICLE PLATE</Text>
                <Text style={styles.infoVal}>{activeBooking.plate}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ENTRY TIME</Text>
                <Text style={styles.infoVal}>{activeBooking.startTime || 'Active'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>PAID TARIFF</Text>
                <Text style={styles.infoValGold}>₹ {activeBooking.totalAmount || activeBooking.total}</Text>
              </View>
            </View>
          </View>

          {/* Leave Bay Action */}
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={() => onLeaveBay(activeBooking)}
            activeOpacity={0.8}
          >
            <Text style={styles.leaveBtnText}>🚪 Leave Bay / Gate Checkout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noActiveCard}>
          <Text style={styles.noActiveIcon}>🎫</Text>
          <Text style={styles.noActiveTitle}>No Active Parking Pass</Text>
          <Text style={styles.noActiveSub}>You currently don't have an active parking session.</Text>
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={onNavigateHome}
            activeOpacity={0.8}
          >
            <Text style={styles.bookNowText}>⚡ Reserve a Bay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PARKING HISTORY & AUDIT LOGS */}
      <View style={styles.historySection}>
        <Text style={styles.historyHeading}>PARKING ACTIVITY & RECEIPTS</Text>

        {history && history.length > 0 ? (
          history.map((item, idx) => (
            <View key={idx} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <View style={styles.historyIcon}>
                  <Text style={styles.historyIconText}>🅿️</Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyBay}>{item.bay}</Text>
                  <Text style={styles.historyPlate}>{item.plate} • {item.ticketId}</Text>
                </View>
                <View style={styles.historyPrice}>
                  <Text style={styles.historyAmount}>₹ {item.totalAmount || item.total}</Text>
                  <Text style={styles.historyStatus}>{item.status || 'PAID'}</Text>
                </View>
              </View>
              <View style={styles.historyFooter}>
                <Text style={styles.historyTime}>Entry: {item.entryTime || item.startTime || 'Past'}</Text>
                <Text style={styles.verifiedBadge}>✓ Verified Cloud Pass</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No past receipts yet. Your parking history will appear here.</Text>
          </View>
        )}
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
  passSection: {
    marginBottom: 20,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  liveTagText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ticketCard: {
    backgroundColor: '#131b2e',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  hubTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  ticketNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginTop: 2,
    marginBottom: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 12,
  },
  infoItem: {
    width: '46%',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  infoValGreen: {
    fontSize: 15,
    fontWeight: '900',
    color: '#34d399',
    marginTop: 2,
  },
  infoValGold: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fbbf24',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  leaveBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  leaveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  noActiveCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  noActiveIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  noActiveTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  noActiveSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  bookNowBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 14,
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  historySection: {
    marginTop: 4,
  },
  historyHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  historyIconText: {
    fontSize: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyBay: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  historyPlate: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  historyPrice: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  historyStatus: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38bdf8',
    marginTop: 2,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  historyTime: {
    fontSize: 10,
    color: '#64748b',
  },
  verifiedBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
  },
  emptyHistory: {
    backgroundColor: '#131b2e',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
});
