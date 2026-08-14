import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useBucketList } from '../context/BucketListContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import { formatDate } from '../utils/format';
import CalendarModal from './CalendarModal';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TripDatesSection({ item }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { updateItem } = useBucketList();
  const showAlert = useAlert();
  const [picking, setPicking] = useState(null); // 'start' | 'end' | null
  const [saving, setSaving] = useState(false);

  const { startDate, endDate } = item;

  const handleSelect = async (iso) => {
    const field = picking;
    setPicking(null);
    const payload = {};
    if (field === 'start') {
      payload.startDate = iso;
      // keep end on/after start
      if (endDate && endDate < iso) payload.endDate = iso;
    } else {
      payload.endDate = iso;
    }
    setSaving(true);
    try {
      await updateItem(item._id, payload);
    } catch (err) {
      showAlert('Could not save dates', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Trip Dates</Text>
        <Ionicons name="calendar" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        {saving && <Text style={styles.saving}>Saving…</Text>}
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.dateBox} onPress={() => setPicking('start')} activeOpacity={0.7}>
          <Text style={styles.dateLabel}>Start</Text>
          <Text style={[styles.dateValue, !startDate && styles.datePlaceholder]}>
            {startDate ? formatDate(startDate) : 'Set date'}
          </Text>
        </TouchableOpacity>
        <Ionicons name="arrow-forward" size={16} color={colors.textGray} style={{ marginHorizontal: spacing.sm }} />
        <TouchableOpacity style={styles.dateBox} onPress={() => setPicking('end')} activeOpacity={0.7}>
          <Text style={styles.dateLabel}>End</Text>
          <Text style={[styles.dateValue, !endDate && styles.datePlaceholder]}>
            {endDate ? formatDate(endDate) : 'Set date'}
          </Text>
        </TouchableOpacity>
      </View>

      <CalendarModal
        visible={picking !== null}
        title={picking === 'start' ? 'Pick start date' : 'Pick end date'}
        initialDate={picking === 'start' ? startDate : endDate}
        minDate={picking === 'end' ? startDate || todayISO() : todayISO()}
        onSelect={handleSelect}
        onClose={() => setPicking(null)}
      />
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
    saving: { fontSize: 11, color: colors.textGray, marginLeft: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    dateBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    dateLabel: { fontSize: 11, color: colors.textGray, marginBottom: 4, textTransform: 'uppercase', fontWeight: '700' },
    dateValue: { fontSize: 14, fontWeight: '700', color: colors.textDark },
    datePlaceholder: { color: colors.primary, fontWeight: '600' },
  });
}
