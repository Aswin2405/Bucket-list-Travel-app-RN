import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import ErrorState from '../components/ErrorState';
import ScreenHeader from '../components/ScreenHeader';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import * as aiApi from '../api/aiApi';

function iconForStyle(text) {
  const lower = text.toLowerCase();
  if (lower.includes('nature')) return 'leaf-outline';
  if (lower.includes('beach')) return 'water-outline';
  if (lower.includes('romantic')) return 'heart-outline';
  if (lower.includes('adventure')) return 'flame-outline';
  return 'sparkles-outline';
}

export default function AIIdeasScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const showAlert = useAlert();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surprising, setSurprising] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.getRecommendations();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSurpriseMe = async () => {
    setSurprising(true);
    try {
      const surprise = await aiApi.getSurprise();
      showAlert(surprise.title, surprise.description, [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'View Insights',
          onPress: () => navigation.navigate('AITravelInsights', { destination: surprise.title }),
        },
      ]);
    } catch (err) {
      showAlert('Could not get a surprise', getErrorMessage(err));
    } finally {
      setSurprising(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="AI Ideas" rightIcon="refresh" onRightPress={load} />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {!loading && (error || !data) && (
        <View style={styles.centered}>
          <ErrorState message={error} onRetry={load} />
        </View>
      )}

      {!loading && !error && data && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>AI Recommendations for You</Text>
          <Text style={styles.subtitle}>Handpicked ideas based on your bucket list and interests</Text>

          <View style={styles.cardsGrid}>
            {data.recommendations.map((item, index) => (
              <TouchableOpacity
                key={`${item.title}-${index}`}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AITravelInsights', { destination: item.title })}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.tagRow}>
                    {(item.tags || []).map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.styleCard}>
            <Text style={styles.styleTitle}>Your Travel Style</Text>
            {data.travelStyle.map((style) => (
              <View key={style} style={styles.styleRow}>
                <Ionicons name={iconForStyle(style)} size={16} color={colors.primary} />
                <Text style={styles.styleText}>{style}</Text>
              </View>
            ))}
            <Text style={styles.surpriseHint}>Let AI surprise you! ✨</Text>
            <PrimaryButton title="Surprise Me" onPress={handleSurpriseMe} loading={surprising} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
    title: { fontSize: 18, fontWeight: '800', color: colors.textDark },
    subtitle: { fontSize: 12, color: colors.textGray, marginTop: 4, marginBottom: spacing.md },
    cardsGrid: { gap: spacing.sm, marginBottom: spacing.md },
    card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
    cardImage: { width: '100%', height: 120 },
    cardBody: { padding: spacing.sm },
    cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
    cardDescription: { fontSize: 12, color: colors.textGray, marginBottom: spacing.sm },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: { backgroundColor: colors.chipBackground, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
    tagText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
    styleCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
    styleTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm },
    styleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    styleText: { fontSize: 13, color: colors.textDark, marginLeft: spacing.sm },
    surpriseHint: { fontSize: 12, color: colors.textGray, textAlign: 'center', marginVertical: spacing.sm },
  });
}
