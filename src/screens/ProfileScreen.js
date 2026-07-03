import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../theme/theme';
import ProgressBar from '../components/ProgressBar';
import { useBucketList } from '../context/BucketListContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import { formatMoney } from '../utils/format';
import { isItemCompleted } from '../utils/bucketListStats';

const AVATAR_IMAGE = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80';

const CATEGORY_META = {
  adventure: { label: 'Adventure', icon: 'trail-sign-outline' },
  relaxing: { label: 'Relaxing', icon: 'sunny-outline' },
  romantic: { label: 'Romantic', icon: 'heart-outline' },
  honeymoon: { label: 'Honeymoon', icon: 'heart-circle-outline' },
  nature: { label: 'Nature', icon: 'leaf-outline' },
  culture: { label: 'Culture', icon: 'color-palette-outline' },
  family: { label: 'Family', icon: 'people-outline' },
  luxury: { label: 'Luxury', icon: 'diamond-outline' },
  budget: { label: 'Budget', icon: 'wallet-outline' },
  food: { label: 'Food', icon: 'restaurant-outline' },
  wildlife: { label: 'Wildlife', icon: 'paw-outline' },
  popular: { label: 'Popular', icon: 'flame-outline' },
};

const ACHIEVEMENTS = [
  { key: 'first', label: 'First Adventure', icon: 'flag-outline', threshold: 1 },
  { key: 'five', label: 'Trip Enthusiast', icon: 'trophy-outline', threshold: 5 },
  { key: 'ten', label: 'Globetrotter', icon: 'earth-outline', threshold: 10 },
  { key: 'twentyfive', label: 'Legend', icon: 'star-outline', threshold: 25 },
];

function memberSinceLabel(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { items } = useBucketList();
  const { user, logout, updateAvatar } = useAuth();
  const showAlert = useAlert();
  const [uploading, setUploading] = useState(false);

  const completed = items.filter(isItemCompleted).length;
  const inProgress = items.filter((i) => !isItemCompleted(i) && i.status === 'in_progress').length;
  const notStarted = items.filter((i) => !isItemCompleted(i) && i.status === 'not_started').length;
  const total = items.length;
  const overallProgress = total ? Math.round((completed / total) * 100) : 0;

  const totalSpent = useMemo(
    () => items.reduce((sum, item) => sum + (item.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0), 0),
    [items]
  );

  const favoriteCategory = useMemo(() => {
    if (!items.length) return null;
    const counts = {};
    items.forEach((i) => {
      const key = i.category || 'adventure';
      counts[key] = (counts[key] || 0) + 1;
    });
    const [key, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { key, count, ...(CATEGORY_META[key] || { label: key, icon: 'compass-outline' }) };
  }, [items]);

  const memberSince = memberSinceLabel(user?.createdAt);

  const handleChangePhoto = async () => {
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission needed', 'Please allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.base64) {
      showAlert('Could not read image', 'Please try picking a different photo.');
      return;
    }

    const mime = asset.mimeType || 'image/jpeg';
    const dataUri = `data:${mime};base64,${asset.base64}`;

    setUploading(true);
    try {
      await updateAvatar(dataUri);
    } catch (err) {
      showAlert('Could not update photo', getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const avatarSource = user?.avatar ? { uri: user.avatar } : { uri: AVATAR_IMAGE };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8} disabled={uploading}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.editBadge}>
              {uploading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Ionicons name="camera" size={16} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'Our Journey Together'}</Text>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.email}>{user?.email || 'Dream together. Plan together. Achieve together.'}</Text>
          </View>
          {memberSince && (
            <View style={styles.memberPill}>
              <Ionicons name="calendar-outline" size={12} color={colors.white} />
              <Text style={styles.memberPillText}>Member since {memberSince}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleChangePhoto} disabled={uploading}>
            <Text style={styles.changePhotoText}>{uploading ? 'Uploading…' : 'Change profile picture'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.card, styles.overlapCard]}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.cardTitle}>Trip Progress</Text>
              <Text style={styles.progressValue}>{completed} / {total} Completed</Text>
            </View>
            <ProgressBar progress={overallProgress} />
            <Text style={styles.progressPercent}>{overallProgress}%</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="ribbon" value={completed} label="Completed" color={colors.gold} />
            <StatCard icon="time-outline" value={inProgress} label="In Progress" color={colors.primary} />
            <StatCard icon="ellipse-outline" value={notStarted} label="Not Started" color={colors.textGray} />
          </View>

          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsRow}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = completed >= a.threshold;
              return (
                <View key={a.key} style={[styles.badge, unlocked && styles.badgeUnlocked]}>
                  <View style={[styles.badgeIconWrap, unlocked && styles.badgeIconWrapUnlocked]}>
                    <Ionicons name={a.icon} size={22} color={unlocked ? colors.white : colors.textGray} />
                  </View>
                  <Text style={[styles.badgeLabel, unlocked && styles.badgeLabelUnlocked]} numberOfLines={2}>
                    {a.label}
                  </Text>
                  <Text style={styles.badgeSub}>{unlocked ? 'Unlocked' : `${a.threshold} trips`}</Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.infoRow}>
            <View style={[styles.card, styles.infoCard]}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#FCE4EA' }]}>
                <Ionicons name={favoriteCategory?.icon || 'compass-outline'} size={18} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Favorite Style</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{favoriteCategory?.label || 'None yet'}</Text>
            </View>
            <View style={[styles.card, styles.infoCard]}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#FFF3DC' }]}>
                <Ionicons name="wallet-outline" size={18} color={colors.gold} />
              </View>
              <Text style={styles.infoLabel}>Total Spent</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{formatMoney(totalSpent)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={colors.primary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xl },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: spacing.md,
    backgroundColor: colors.chipBackground,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: { fontSize: 20, fontWeight: '800', color: colors.white },
  emailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginLeft: 4 },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    marginTop: spacing.sm,
  },
  memberPillText: { fontSize: 11, color: colors.white, fontWeight: '600', marginLeft: 4 },
  changePhotoText: { fontSize: 13, color: colors.white, fontWeight: '700', marginTop: spacing.md, textDecorationLine: 'underline' },
  body: { paddingHorizontal: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  overlapCard: { marginTop: -spacing.xl, marginBottom: spacing.md, shadowColor: colors.black, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  progressValue: { fontSize: 12, color: colors.textGray },
  progressPercent: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 6, alignSelf: 'flex-end' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  statLabel: { fontSize: 11, color: colors.textGray, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm },
  achievementsRow: { marginBottom: spacing.lg },
  badge: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    opacity: 0.55,
  },
  badgeUnlocked: { opacity: 1 },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeIconWrapUnlocked: { backgroundColor: colors.gold },
  badgeLabel: { fontSize: 11, fontWeight: '700', color: colors.textGray, textAlign: 'center' },
  badgeLabelUnlocked: { color: colors.textDark },
  badgeSub: { fontSize: 10, color: colors.textGray, marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  infoCard: { flex: 1 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  infoLabel: { fontSize: 11, color: colors.textGray },
  infoValue: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.primary, marginLeft: spacing.xs },
});
