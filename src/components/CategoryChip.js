import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function CategoryChip({ label, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: colors.chipBackground,
      marginRight: spacing.sm + 4,
      marginBottom: spacing.sm,
    },
    activeChip: { backgroundColor: colors.primary },
    text: { fontSize: 13, fontWeight: '600', color: colors.textGray },
    activeText: { color: colors.white },
  });
}
