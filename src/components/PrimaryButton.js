import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.6 },
    text: { color: colors.white, fontSize: 16, fontWeight: '700' },
  });
}
