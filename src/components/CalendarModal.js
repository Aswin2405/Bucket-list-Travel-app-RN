import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toISO(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayISO() {
  const d = new Date();
  return toISO(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CalendarModal({ visible, title, initialDate, minDate, onSelect, onClose }) {
  const seed = initialDate || todayISO();
  const [seedY, seedM] = seed.split('-').map(Number);
  const [view, setView] = useState({ year: seedY, month: seedM - 1 });

  // Re-seed the visible month whenever the picker is (re)opened.
  const [lastVisible, setLastVisible] = useState(visible);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) setView({ year: seedY, month: seedM - 1 });
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const min = minDate || null;

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const changeMonth = (delta) => {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const handleSelectDay = (day) => {
    const iso = toISO(view.year, view.month, day);
    if (min && iso < min) return;
    onSelect(iso);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={8} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[view.month]} {view.year}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={8} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) return <View key={`empty-${index}`} style={styles.cell} />;
              const iso = toISO(view.year, view.month, day);
              const disabled = min && iso < min;
              const selected = iso === initialDate;
              return (
                <TouchableOpacity
                  key={iso}
                  style={styles.cell}
                  onPress={() => handleSelectDay(day)}
                  disabled={disabled}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dayCircle, selected && styles.daySelected]}>
                    <Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.daySelectedText]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34,33,58,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textGray },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 14, color: colors.textDark },
  dayDisabled: { color: colors.border },
  daySelectedText: { color: colors.white, fontWeight: '800' },
  closeButton: { marginTop: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  closeText: { fontSize: 14, fontWeight: '700', color: colors.textGray },
});
