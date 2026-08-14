import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import CategoryChip from '../components/CategoryChip';
import SuggestionCard from '../components/SuggestionCard';
import ErrorState from '../components/ErrorState';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import { useBucketList } from '../context/BucketListContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import { CATEGORIES } from '../constants/categories';
import * as aiApi from '../api/aiApi';

const SUGGESTION_CATEGORIES = ['Suggestions', ...CATEGORIES.map((c) => c.label)];
const MANUAL_CATEGORIES = CATEGORIES;

const DEFAULT_TASKS = ['Research best places', 'Plan travel dates', 'Book flights', 'Book stay'];

export default function AddToBucketListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addItem } = useBucketList();
  const showAlert = useAlert();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [manualCategory, setManualCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState('Suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedTitles, setAddedTitles] = useState([]);

  const loadSuggestions = useCallback(async (selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiApi.getSuggestions(selectedCategory);
      setSuggestions(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions(category);
  }, [category, loadSuggestions]);

  const handleManualAdd = async () => {
    if (!title.trim()) {
      showAlert('Add a title', 'Type the name of the place or goal you want to add.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        source: 'user',
        tasks: DEFAULT_TASKS.map((t) => ({ title: t, completed: false })),
      };
      if (manualCategory) payload.category = manualCategory;
      await addItem(payload);
      setTitle('');
      setDescription('');
      navigation.goBack();
    } catch (err) {
      showAlert('Could not add item', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSuggestion = async (suggestion) => {
    setAddedTitles((prev) => [...prev, suggestion.title]);
    try {
      await addItem({
        title: suggestion.title,
        description: suggestion.description,
        image: suggestion.image,
        category: suggestion.category || 'adventure',
        source: 'ai_suggested',
        tasks: DEFAULT_TASKS.map((t) => ({ title: t, completed: false })),
      });
    } catch (err) {
      setAddedTitles((prev) => prev.filter((t) => t !== suggestion.title));
      showAlert('Could not add item', getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={16}
      >
        <ScreenHeader title="Add to Bucket List" onBack={() => navigation.goBack()} rightIcon="sparkles" />

        <FlatList
          data={loading || error ? [] : suggestions}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <SuggestionCard
              suggestion={item}
              added={addedTitles.includes(item.title)}
              onAdd={() => handleAddSuggestion(item)}
            />
          )}
          ListHeaderComponent={
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Where do you want to go?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Machu Picchu, Peru"
                  placeholderTextColor={colors.textGray}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={colors.textGray}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
                <Text style={styles.categoryLabel}>Category (optional)</Text>
                <View style={styles.manualChipRow}>
                  {MANUAL_CATEGORIES.map((c) => (
                    <CategoryChip
                      key={c.key}
                      label={c.label}
                      active={manualCategory === c.key}
                      onPress={() => setManualCategory(manualCategory === c.key ? null : c.key)}
                    />
                  ))}
                </View>
                <PrimaryButton title="Add to Bucket List" onPress={handleManualAdd} loading={submitting} />
              </View>

              <View style={styles.banner}>
                <View style={{ flex: 1 }}>
                  <View style={styles.bannerTitleRow}>
                    <Text style={styles.bannerTitle}>AI Suggests for You</Text>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.bannerSubtitle}>Based on your interests and travel goals</Text>
                </View>
                <Ionicons name="hardware-chip-outline" size={36} color={colors.primary} />
              </View>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={SUGGESTION_CATEGORIES}
                keyExtractor={(item) => item}
                style={styles.chipRow}
                renderItem={({ item }) => (
                  <CategoryChip label={item} active={item === category} onPress={() => setCategory(item)} />
                )}
              />

              {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />}
              {error && <ErrorState message={error} onRetry={() => loadSuggestions(category)} />}
            </View>
          }
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={styles.emptyText}>No suggestions right now, try another category.</Text>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    formTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm },
    input: {
      backgroundColor: colors.chipBackground,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textDark,
      marginBottom: spacing.sm,
    },
    multilineInput: { minHeight: 60, textAlignVertical: 'top' },
    categoryLabel: { fontSize: 12, color: colors.textGray, marginBottom: spacing.sm },
    manualChipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs },
    chipRow: { flexGrow: 0, marginBottom: spacing.md },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.chipBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    bannerTitleRow: { flexDirection: 'row', alignItems: 'center' },
    bannerTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginRight: 6 },
    bannerSubtitle: { fontSize: 12, color: colors.textGray, marginTop: 4 },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    emptyText: { textAlign: 'center', color: colors.textGray, marginTop: spacing.lg },
  });
}
