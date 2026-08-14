import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import CategoryChip from '../components/CategoryChip';
import PrimaryButton from '../components/PrimaryButton';
import ErrorState from '../components/ErrorState';
import ScreenHeader from '../components/ScreenHeader';
import { useBucketList } from '../context/BucketListContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import * as aiApi from '../api/aiApi';

const TABS = [
  { key: 'topPlaces', label: 'Top Places' },
  { key: 'thingsToDo', label: 'Things to Do' },
  { key: 'food', label: 'Food' },
];

const DEFAULT_TASKS = ['Research best places', 'Plan travel dates', 'Book flights', 'Book stay'];

export default function AITravelInsightsScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const destination = route.params?.destination || 'Goa, India';
  const { addItem } = useBucketList();
  const showAlert = useAlert();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('topPlaces');
  const [adding, setAdding] = useState(false);

  const loadInsights = useCallback(() => {
    setLoading(true);
    setError(null);
    aiApi
      .getInsights(destination)
      .then((data) => setInsights(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [destination]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleAddToBucketList = async () => {
    if (!insights) return;
    setAdding(true);
    try {
      await addItem({
        title: insights.title,
        description: insights.description,
        image: insights.image,
        category: 'popular',
        source: 'ai_suggested',
        tasks: DEFAULT_TASKS.map((title) => ({ title, completed: false })),
      });
      showAlert('Added!', `${insights.title} was added to your bucket list.`);
      navigation.goBack();
    } finally {
      setAdding(false);
    }
  };

  const activeItems = insights?.[activeTab] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="AI Travel Insights" onBack={() => navigation.goBack()} rightIcon="sparkles" />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {!loading && (error || !insights) && (
        <View style={styles.centered}>
          <ErrorState message={error} onRetry={loadInsights} />
        </View>
      )}

      {!loading && !error && insights && (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.heroWrap}>
              <Image source={{ uri: insights.image }} style={styles.hero} />
              <TouchableOpacity style={styles.heartButton}>
                <Ionicons name="heart" size={20} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>{insights.title}</Text>
              </View>
            </View>

            <Text style={styles.description}>{insights.description}</Text>

            <View style={styles.tabRow}>
              {TABS.map((tab) => (
                <CategoryChip
                  key={tab.key}
                  label={tab.label}
                  active={activeTab === tab.key}
                  onPress={() => setActiveTab(tab.key)}
                />
              ))}
            </View>

            {activeItems.map((entry, index) => (
              <View key={`${entry.title}-${index}`} style={styles.placeCard}>
                {entry.image && <Image source={{ uri: entry.image }} style={styles.placeImage} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeTitle}>{entry.title}</Text>
                  <Text style={styles.placeDescription}>{entry.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton title="Add to My Bucket List" onPress={handleAddToBucketList} loading={adding} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
    heroWrap: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
    hero: { width: '100%', height: 200 },
    heartButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroOverlay: { position: 'absolute', bottom: spacing.sm, left: spacing.sm },
    heroTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
    description: { fontSize: 13, color: colors.textGray, marginBottom: spacing.md, lineHeight: 19 },
    tabRow: { flexDirection: 'row', marginBottom: spacing.md },
    placeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    placeImage: { width: 56, height: 56, borderRadius: radius.sm, marginRight: spacing.sm },
    placeTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
    placeDescription: { fontSize: 12, color: colors.textGray },
    footer: { padding: spacing.md, backgroundColor: colors.background },
  });
}
