import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export function QrCodeView({ ticketId, bayName, plateNumber }) {
  return (
    <View style={styles.container}>
      {/* Visual QR Code Mock Container */}
      <View style={styles.qrMatrix}>
        {/* Top-Left Finder */}
        <View style={[styles.finderCorner, styles.posTL]}>
          <View style={styles.finderInner} />
        </View>
        {/* Top-Right Finder */}
        <View style={[styles.finderCorner, styles.posTR]}>
          <View style={styles.finderInner} />
        </View>
        {/* Bottom-Left Finder */}
        <View style={[styles.finderCorner, styles.posBL]}>
          <View style={styles.finderInner} />
        </View>

        {/* Center Grid Elements */}
        <View style={styles.centerPattern}>
          <View style={styles.dotRow}>
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
            <View style={styles.dotFilled} />
          </View>
          <View style={styles.dotRow}>
            <View style={styles.dotFilled} />
            <View style={styles.dotFilled} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
          </View>
          <View style={styles.centerBadge}>
            <Text style={styles.centerBadgeText}>PS</Text>
          </View>
          <View style={styles.dotRow}>
            <View style={styles.dotFilled} />
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
          </View>
          <View style={styles.dotRow}>
            <View style={styles.dot} />
            <View style={styles.dotFilled} />
            <View style={styles.dotFilled} />
            <View style={styles.dotFilled} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      {/* Barcode line strip below */}
      <View style={styles.barcodeStrip}>
        <View style={[styles.bar, { width: 3 }]} />
        <View style={[styles.bar, { width: 1 }]} />
        <View style={[styles.bar, { width: 4 }]} />
        <View style={[styles.bar, { width: 2 }]} />
        <View style={[styles.bar, { width: 1 }]} />
        <View style={[styles.bar, { width: 5 }]} />
        <View style={[styles.bar, { width: 2 }]} />
        <View style={[styles.bar, { width: 3 }]} />
        <View style={[styles.bar, { width: 1 }]} />
        <View style={[styles.bar, { width: 4 }]} />
        <View style={[styles.bar, { width: 2 }]} />
        <View style={[styles.bar, { width: 1 }]} />
        <View style={[styles.bar, { width: 3 }]} />
        <View style={[styles.bar, { width: 5 }]} />
        <View style={[styles.bar, { width: 2 }]} />
      </View>

      <Text style={styles.securityText}>SCAN AT AUTOMATED BOOM BARRIER</Text>
      <Text style={styles.codeSubtitle}>{ticketId} • {plateNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 8,
  },
  qrMatrix: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finderCorner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderWidth: 5,
    borderColor: '#0f172a',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posTL: { top: 0, left: 0 },
  posTR: { top: 0, right: 0 },
  posBL: { bottom: 0, left: 0 },
  finderInner: {
    width: 14,
    height: 14,
    backgroundColor: '#0f172a',
    borderRadius: 2,
  },
  centerPattern: {
    width: 60,
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#ffffff',
  },
  dotFilled: {
    width: 6,
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 1,
  },
  centerBadge: {
    backgroundColor: '#2563eb',
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  barcodeStrip: {
    flexDirection: 'row',
    height: 24,
    alignItems: 'center',
    gap: 3,
    marginTop: 12,
  },
  bar: {
    height: 24,
    backgroundColor: '#0f172a',
  },
  securityText: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  codeSubtitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
});
