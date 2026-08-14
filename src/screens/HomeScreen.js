import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import BucketListCard from '../components/BucketListCard';
import { useBucketList } from '../context/BucketListContext';
import { useAuth } from '../context/AuthContext';
import { isItemCompleted } from '../utils/bucketListStats';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1000&q=80';
const AVATAR_IMAGE = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&q=80';

const VISIBLE_COUNT = 5;

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { items, loading, error, refresh } = useBucketList();
  const { user } = useAuth();
  const avatarSource = user?.avatar ? { uri: user.avatar } : { uri: AVATAR_IMAGE };

  // Track the manual/pull refresh separately so we can show a spinner while the
  // backend wakes from sleep (Render free tier cold start can take up to a minute).
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const completedCount = items.filter(isItemCompleted).length;
  const totalCount = items.length;
  const overallProgress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const visibleItems = items.slice(0, VISIBLE_COUNT);
  const remainingCount = totalCount - visibleItems.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.openDrawer()} hitSlop={8}>
                <Ionicons name="menu" size={26} color={colors.textDark} />
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Image source={avatarSource} style={styles.avatar} />
                </TouchableOpacity>
              </View>
            </View>

            {refreshing && (
              <Text style={styles.refreshHint}>Refreshing… the server may take a moment to wake up.</Text>
            )}

            <Text style={styles.title}>Our Bucket List</Text>
            <Text style={styles.subtitle}>Dream together. Plan together. Achieve together.</Text>

            <Image source={{ uri: HERO_IMAGE }} style={styles.hero} />

            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressValue}>{completedCount} / {totalCount} Completed</Text>
              </View>
              <ProgressBar progress={overallProgress} />
              <Text style={styles.progressPercent}>{overallProgress}%</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Bucket List</Text>
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => navigation.navigate('AddToBucketList')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addNewText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <BucketListCard item={item} onPress={() => navigation.navigate('ActivityDetail', { id: item._id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bucket list items yet. Tap "Add New" to get started!</Text>
        }
        ListFooterComponent={
          remainingCount > 0 ? (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllBucketList')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllText}>View All ({totalCount})</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: spacing.md, paddingBottom: spacing.xl },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    refreshHint: { fontSize: 12, color: colors.textGray, marginBottom: spacing.sm },
    avatar: { width: 38, height: 38, borderRadius: 19 },
    title: { fontSize: 30, fontStyle: 'italic', fontWeight: '700', color: colors.textDark },
    subtitle: { fontSize: 13, color: colors.textGray, marginTop: 4, marginBottom: spacing.md },
    hero: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: spacing.md },
    progressCard: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    progressLabel: { fontSize: 14, fontWeight: '700', color: colors.textDark },
    progressValue: { fontSize: 12, color: colors.textGray },
    progressPercent: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 6, alignSelf: 'flex-end' },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
    addNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.chipBackground,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    addNewText: { color: colors.primary, fontWeight: '700', fontSize: 12, marginLeft: 2 },
    error: { color: colors.primary, marginBottom: spacing.sm },
    emptyText: { textAlign: 'center', color: colors.textGray, marginTop: spacing.xl },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
    },
    viewAllText: { color: colors.primary, fontWeight: '700', fontSize: 14, marginRight: 4 },
  });
}
