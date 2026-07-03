import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export default function CategoryChip({ label, active, onPress }) {
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

const styles = StyleSheet.create({
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
