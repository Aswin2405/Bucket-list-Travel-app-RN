import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from './PrimaryButton';

export default function ErrorState({ message, onRetry }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textGray} />
      <Text style={styles.message}>{message || 'Something went wrong.'}</Text>
      {onRetry && <PrimaryButton title="Try Again" onPress={onRetry} style={styles.retryButton} />}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    message: { color: colors.textGray, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
    retryButton: { paddingHorizontal: spacing.xl },
  });
}
