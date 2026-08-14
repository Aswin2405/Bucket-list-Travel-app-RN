import React, { useMemo } from 'react';
import { Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import BucketListCard from '../components/BucketListCard';
import { useBucketList } from '../context/BucketListContext';

export default function AllBucketListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { items, refresh } = useBucketList();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title={`Your Bucket List (${items.length})`} onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <BucketListCard item={item} onPress={() => navigation.navigate('ActivityDetail', { id: item._id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bucket list items yet. Tap "Add New" to get started!</Text>
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: spacing.md, paddingBottom: spacing.xl },
    emptyText: { textAlign: 'center', color: colors.textGray, marginTop: spacing.xl },
  });
}
