import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useBucketList } from '../context/BucketListContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import * as aiApi from '../api/aiApi';

export default function PackingSection({ item }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addPackingItems, togglePackingItem, deletePackingItem } = useBucketList();
  const showAlert = useAlert();
  const destination = item.location || item.title;

  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);

  const packingList = item.packingList || [];
  const packedCount = packingList.filter((p) => p.packed).length;

  const handleAdd = async () => {
    const value = newItem.trim();
    if (!value) return;
    setAdding(true);
    try {
      await addPackingItems(item._id, [value], 'user');
      setNewItem('');
    } catch (err) {
      showAlert('Could not add item', getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { items } = await aiApi.getPackingList(destination, item.startDate, item.endDate);
      if (!items || items.length === 0) {
        showAlert('Nothing to add', 'The AI could not suggest a packing list this time.');
        return;
      }
      await addPackingItems(item._id, items, 'ai_suggested');
    } catch (err) {
      showAlert('Could not generate list', getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = (packId) => {
    togglePackingItem(item._id, packId).catch((err) => showAlert('Something went wrong', getErrorMessage(err)));
  };

  const handleDelete = (packId) => {
    deletePackingItem(item._id, packId).catch((err) => showAlert('Could not remove', getErrorMessage(err)));
  };

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Things to Pack</Text>
          <Ionicons name="briefcase" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        </View>
        {packingList.length > 0 && (
          <Text style={styles.counter}>
            {packedCount}/{packingList.length} packed
          </Text>
        )}
      </View>

      <View style={styles.card}>
        {packingList.length === 0 && (
          <Text style={styles.emptyText}>
            Add what you need to pack, or let AI suggest a list based on your destination and dates.
          </Text>
        )}

        {packingList.map((pack) => (
          <View key={pack._id} style={styles.itemRow}>
            <TouchableOpacity style={styles.itemMain} onPress={() => handleToggle(pack._id)} activeOpacity={0.7}>
              <Ionicons
                name={pack.packed ? 'checkbox' : 'square-outline'}
                size={20}
                color={pack.packed ? colors.success : colors.textGray}
              />
              <Text style={[styles.itemText, pack.packed && styles.itemTextDone]}>{pack.item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(pack._id)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textGray} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Add an item to pack"
            placeholderTextColor={colors.textGray}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity
            style={[styles.addButton, (!newItem.trim() || adding) && styles.disabled]}
            onPress={handleAdd}
            disabled={!newItem.trim() || adding}
          >
            {adding ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="add" size={18} color={colors.white} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.aiButton} onPress={handleGenerate} disabled={generating} activeOpacity={0.8}>
          {generating ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Ionicons name="sparkles" size={15} color={colors.primary} />
              <Text style={styles.aiButtonText}>
                {packingList.length > 0 ? 'Suggest more with AI' : 'Generate packing list with AI'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
    counter: { fontSize: 12, color: colors.textGray, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    emptyText: { fontSize: 13, color: colors.textGray, lineHeight: 18, marginBottom: spacing.sm },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
    itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    itemText: { fontSize: 14, color: colors.textDark, marginLeft: spacing.sm, flex: 1 },
    itemTextDone: { color: colors.textGray, textDecorationLine: 'line-through' },
    addRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    input: {
      flex: 1,
      backgroundColor: colors.chipBackground,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textDark,
      marginRight: spacing.sm,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.6 },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    aiButtonText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginLeft: 6 },
  });
}
