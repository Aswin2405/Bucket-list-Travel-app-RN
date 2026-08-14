import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function ProgressBar({ progress = 0, height = 8 }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%`, height }]} />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
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
}
