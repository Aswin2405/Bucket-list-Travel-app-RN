import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import CategoryChip from '../components/CategoryChip';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../api/errors';
import { CATEGORIES } from '../constants/categories';
import * as aiApi from '../api/aiApi';

const EXPLORE_CATEGORIES = ['Popular', ...CATEGORIES.filter((c) => c.key !== 'popular').map((c) => c.label)];

export default function ExploreScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [category, setCategory] = useState('Popular');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback((selectedCategory, isRefresh) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    aiApi
      .getExploreDestinations(selectedCategory)
      .then((data) => setDestinations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load(category, false);
  }, [category, load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Explore"
        rightIcon="shuffle"
        onRightPress={() => load(category, true)}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={EXPLORE_CATEGORIES}
        keyExtractor={(item) => item}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <CategoryChip label={item} active={item === category} onPress={() => setCategory(item)} />
        )}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(category, false)} />
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(category, true)} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AITravelInsights', { destination: item.title })}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    chipRow: { flexGrow: 0, marginVertical: spacing.md },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
    card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
    image: { width: '100%', height: 100 },
    cardBody: { padding: spacing.sm },
    name: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
    description: { fontSize: 11, color: colors.textGray },
  });
}
