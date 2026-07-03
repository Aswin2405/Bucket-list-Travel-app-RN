import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';
import ProgressRing from './ProgressRing';
import { isItemCompleted } from '../utils/bucketListStats';

const STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In Progress',
  not_started: 'Not Started',
};

export default function BucketListCard({ item, onPress }) {
  const doneTasks = item.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = item.tasks?.length || 0;
  const completed = isItemCompleted(item);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {completed ? (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textGray} />
            <Text style={styles.date}>{item.date || 'Completed'}</Text>
          </View>
        ) : (
          <Text style={styles.date}>{doneTasks}/{totalTasks} Tasks</Text>
        )}
      </View>
      <View style={styles.statusWrap}>
        {completed ? (
          <Ionicons name="ribbon" size={30} color={colors.gold} />
        ) : (
          <ProgressRing progress={item.progress || 0} size={44} strokeWidth={4} />
        )}
        <Text style={styles.statusLabel}>{STATUS_LABEL[completed ? 'completed' : item.status]}</Text>
      </View>
    </TouchableOpacity>
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
  image: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 12, color: colors.textGray, marginLeft: 4 },
  statusWrap: { alignItems: 'center', width: 70 },
  statusLabel: { fontSize: 10, color: colors.textGray, marginTop: 2 },
});
