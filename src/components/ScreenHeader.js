import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/theme';

export default function ScreenHeader({ title, onBack, rightIcon, onRightPress, rightElement }) {
  const showRight = rightElement || rightIcon;

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={10} style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={colors.textDark} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={[styles.side, styles.rightSide]}>
        {rightElement ||
          (rightIcon && (
            <TouchableOpacity
              onPress={onRightPress}
              disabled={!onRightPress}
              hitSlop={10}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name={rightIcon} size={18} color={colors.primary} />
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: { width: 36, alignItems: 'flex-start' },
  rightSide: { alignItems: 'flex-end' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.textDark },
});
