import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

export default function SuggestionCard({ suggestion, onAdd, added }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: suggestion.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{suggestion.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{suggestion.description}</Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, added && styles.addedButton]}
        onPress={onAdd}
        disabled={added}
        activeOpacity={0.8}
      >
        <Ionicons name={added ? 'checkmark' : 'add'} size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: { width: 56, height: 56, borderRadius: radius.sm, marginRight: spacing.sm },
  info: { flex: 1, marginRight: spacing.sm },
  title: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  description: { fontSize: 12, color: colors.textGray },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedButton: { backgroundColor: colors.success },
});
