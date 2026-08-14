import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';

// This celebration screen is intentionally always dark (festive, not tied to
// the app's light/dark theme setting), so its colors are not theme-driven.
const colors = { white: '#FFFFFF', gold: '#F5A623' };

export default function CompletionScreen({ navigation, route }) {
  const title = route.params?.title || 'your goal';

  const handleShare = () => {
    Share.share({ message: `We just completed "${title}" on our bucket list! 🎉` });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.badgeWrap}>
          <Ionicons name="ribbon" size={90} color={colors.gold} />
        </View>
        <Text style={styles.congrats}>Congratulations!</Text>
        <Text style={styles.body}>You completed</Text>
        <Text style={styles.goalTitle}>{title} 🌴</Text>
        <Text style={styles.body}>Making memories together, one adventure at a time. ❤️</Text>

        <PrimaryButton title="Share the Moment" onPress={handleShare} style={styles.shareButton} />

        <TouchableOpacity
          onPress={() => navigation.navigate('DrawerRoot', { screen: 'MainTabs', params: { screen: 'Home' } })}
        >
          <Text style={styles.seeAllText}>See All Completed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161320' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  badgeWrap: { marginBottom: spacing.lg },
  congrats: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: spacing.md },
  body: { fontSize: 14, color: '#C9C6D6', textAlign: 'center', marginBottom: 4 },
  goalTitle: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: spacing.md },
  shareButton: { width: '100%', marginTop: spacing.lg, marginBottom: spacing.md },
  seeAllText: { color: '#C9C6D6', fontSize: 14, textDecorationLine: 'underline' },
});
