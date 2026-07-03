import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';

export default function ProgressBar({ progress = 0, height = 8 }) {
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.chipBackground,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
