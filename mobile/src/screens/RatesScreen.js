import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';
import { RateCalculator } from '../components/RateCalculator';

export function RatesScreen({ onProceedToBooking }) {
  return (
    <View style={styles.container}>
      <RateCalculator onProceedToBooking={onProceedToBooking} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
