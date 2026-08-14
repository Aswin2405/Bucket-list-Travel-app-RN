import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export default function ProgressRing({ progress = 0, size = 64, strokeWidth = 6 }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const offset = circumference * (1 - Math.min(100, Math.max(0, progress)) / 100);

  return (
    <View style={{ width: size, height: size }}>
      {/* Rotate the whole canvas (not the Circle's `origin` prop) so the arc
          starts at 12 o'clock. react-native-svg's web shape mishandles the
          `origin`/`rotation` props on <Circle> (emits an invalid raw
          `transform-origin` DOM attribute), so we avoid that path entirely. */}
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          stroke={colors.chipBackground}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{progress}%</Text>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    labelWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textDark,
    },
  });
}
