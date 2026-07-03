import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '../theme/theme';
import ProgressRing from '../components/ProgressRing';
import PrimaryButton from '../components/PrimaryButton';
import ErrorState from '../components/ErrorState';
import TripDatesSection from '../components/TripDatesSection';
import WeatherSection from '../components/WeatherSection';
import PackingSection from '../components/PackingSection';
import ExpensesSection from '../components/ExpensesSection';
import { useBucketList } from '../context/BucketListContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import * as aiApi from '../api/aiApi';

const ORIGIN_STORAGE_KEY = 'travelOrigin';

const STAY_TIERS = [
  { key: 'budget', label: 'Budget-Friendly' },
  { key: 'medium', label: 'Mid-Range' },
  { key: 'high', label: 'High-End' },
];

const TRAVEL_MODES = [
  { key: 'flight', label: 'Flight', icon: 'airplane-outline' },
  { key: 'train', label: 'Train', icon: 'train-outline' },
  { key: 'bus', label: 'Bus', icon: 'bus-outline' },
];

export default function ActivityDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { items, toggleTask, completeItem, shareItem, unshareItem } = useBucketList();
  const { user } = useAuth();
  const showAlert = useAlert();
  const item = useMemo(() => items.find((i) => i._id === id), [items, id]);

  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [origin, setOrigin] = useState(null);
  const [originInput, setOriginInput] = useState('');
  const [originLoaded, setOriginLoaded] = useState(false);

  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);

  const destination = item?.location || item?.title;

  useEffect(() => {
    AsyncStorage.getItem(ORIGIN_STORAGE_KEY).then((stored) => {
      if (stored) setOrigin(stored);
      setOriginLoaded(true);
    });
  }, []);

  const loadPlan = useCallback(
    (originValue) => {
      if (!destination || !originValue) return;
      setPlanLoading(true);
      setPlanError(null);
      aiApi
        .getTripPlan(destination, originValue)
        .then((data) => setPlan(data))
        .catch((err) => setPlanError(getErrorMessage(err)))
        .finally(() => setPlanLoading(false));
    },
    [destination]
  );

  const handleSubmitOrigin = () => {
    const value = originInput.trim();
    if (!value) return;
    AsyncStorage.setItem(ORIGIN_STORAGE_KEY, value);
    setOrigin(value);
    setPlan(null);
    loadPlan(value);
  };

  const handleChangeOrigin = () => {
    setOriginInput(origin || '');
    setOrigin(null);
    setPlan(null);
    setPlanError(null);
  };

  const handleGeneratePlan = () => {
    if (origin) loadPlan(origin);
  };

  const isOwner = item?.owner?._id === user?._id;

  const handleShare = async () => {
    const email = shareEmail.trim();
    if (!email) return;
    setSharing(true);
    setShareError(null);
    try {
      await shareItem(item._id, email);
      setShareEmail('');
    } catch (err) {
      setShareError(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveMember = (member) => {
    const isSelf = member._id === user?._id;
    showAlert(
      isSelf ? 'Leave this trip?' : `Remove ${member.name}?`,
      isSelf
        ? 'You will lose access to this trip unless someone shares it with you again.'
        : `${member.name} will no longer be able to see or edit this trip.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSelf ? 'Leave' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unshareItem(item._id, member._id);
              if (isSelf) navigation.goBack();
            } catch (err) {
              showAlert('Could not remove', getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const handleMarkCompleted = async () => {
    await completeItem(item._id);
    navigation.replace('Completion', { title: item.title });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: item.image }} style={styles.hero} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{item.title}</Text>
          <Text style={styles.heroSubtitle}>
            {item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </Text>
        </View>
        <View style={styles.ringOverlay}>
          <ProgressRing progress={item.progress || 0} size={56} strokeWidth={5} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Tasks</Text>
        {(item.tasks || []).map((task) => (
          <TouchableOpacity
            key={task._id}
            style={styles.taskRow}
            onPress={() => toggleTask(item._id, task._id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={task.completed ? colors.success : colors.textGray}
            />
            <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>{task.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.planHeaderRow}>
          <View style={styles.planHeaderTitleRow}>
            <Text style={styles.sectionTitle}>Trip Members</Text>
            <Ionicons name="people" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
          </View>
        </View>

        <View style={styles.membersCard}>
          {item.owner && (
            <View style={styles.memberRow}>
              <Ionicons name="person-circle" size={22} color={colors.primary} />
              <Text style={styles.memberText} numberOfLines={1}>
                {item.owner.name}
                {item.owner._id === user?._id ? ' (You)' : ''}
              </Text>
              <Text style={styles.memberRole}>Owner</Text>
            </View>
          )}
          {(item.collaborators || []).map((member) => (
            <View key={member._id} style={styles.memberRow}>
              <Ionicons name="person-circle-outline" size={22} color={colors.textGray} />
              <Text style={styles.memberText} numberOfLines={1}>
                {member.name}
                {member._id === user?._id ? ' (You)' : ''}
              </Text>
              {(isOwner || member._id === user?._id) && (
                <TouchableOpacity onPress={() => handleRemoveMember(member)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.textGray} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.shareRow}>
            <TextInput
              style={styles.shareInput}
              placeholder="Add a friend by email"
              placeholderTextColor={colors.textGray}
              value={shareEmail}
              onChangeText={setShareEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onSubmitEditing={handleShare}
            />
            <TouchableOpacity
              style={[styles.shareButton, (!shareEmail.trim() || sharing) && styles.disabled]}
              onPress={handleShare}
              disabled={!shareEmail.trim() || sharing}
            >
              {sharing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Ionicons name="add" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          {shareError && <Text style={styles.shareError}>{shareError}</Text>}
        </View>

        <TripDatesSection item={item} />
        <WeatherSection item={item} />
        <PackingSection item={item} />
        <ExpensesSection item={item} />

        <View style={styles.planHeaderRow}>
          <View style={styles.planHeaderTitleRow}>
            <Text style={styles.sectionTitle}>Plan Your Trip</Text>
            <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
          </View>
          {origin && plan && !planLoading && (
            <TouchableOpacity onPress={handleGeneratePlan} hitSlop={8}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {!origin && originLoaded && (
          <View style={styles.originCard}>
            <Text style={styles.originLabel}>Where are you traveling from?</Text>
            <Text style={styles.originHint}>
              Needed to estimate flight/train/bus prices for this specific route.
            </Text>
            <TextInput
              style={styles.originInput}
              placeholder="e.g. Chennai, India"
              placeholderTextColor={colors.textGray}
              value={originInput}
              onChangeText={setOriginInput}
              onSubmitEditing={handleSubmitOrigin}
            />
            <PrimaryButton title="Get Trip Plan" onPress={handleSubmitOrigin} disabled={!originInput.trim()} />
          </View>
        )}

        {origin && (
          <View style={styles.originSummaryRow}>
            <Text style={styles.originSummaryText}>From {origin} to {destination}</Text>
            <TouchableOpacity onPress={handleChangeOrigin}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {origin && !plan && !planLoading && !planError && (
          <PrimaryButton title="Generate AI Trip Plan" onPress={handleGeneratePlan} />
        )}

        {planLoading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />}
        {planError && !planLoading && <ErrorState message={planError} onRetry={() => loadPlan(origin)} />}

        {plan && !planLoading && !planError && (
          <>
            {plan.sameLocation && (
              <Text style={styles.disclaimer}>
                You're already in {destination} - no need for flights, trains, or buses. Here's what to do there.
              </Text>
            )}

            {!plan.sameLocation && (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                    <Text style={styles.infoLabel}>Nearest Airport</Text>
                  </View>
                  <Text style={styles.airportName}>{plan.nearestAirport?.name}</Text>
                  <Text style={styles.infoText}>{plan.nearestAirport?.note}</Text>
                </View>

                <Text style={styles.subsectionTitle}>Getting There</Text>
                {TRAVEL_MODES.map(({ key, label, icon }) => {
                  const mode = plan.travelOptions?.[key];
                  if (!mode) return null;
                  return (
                    <View key={key} style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Ionicons name={icon} size={18} color={colors.primary} />
                        <Text style={styles.infoLabel}>{label}</Text>
                      </View>
                      {mode.available ? (
                        <>
                          <View style={styles.travelRow}>
                            <Text style={styles.flightRange}>{mode.range}</Text>
                            {mode.duration ? <Text style={styles.duration}>{mode.duration}</Text> : null}
                          </View>
                          <Text style={styles.infoText}>{mode.tips}</Text>
                        </>
                      ) : (
                        <Text style={styles.infoText}>{mode.tips || `${label} isn't a practical option for this route.`}</Text>
                      )}
                    </View>
                  );
                })}
                <Text style={styles.disclaimer}>Prices are AI estimates, not live pricing.</Text>
              </>
            )}

            <Text style={styles.subsectionTitle}>Best Places to Visit</Text>
            {plan.bestPlaces?.map((place, index) => (
              <View key={`${place.title}-${index}`} style={styles.placeCard}>
                {place.image && <Image source={{ uri: place.image }} style={styles.placeImage} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeTitle}>{place.title}</Text>
                  <Text style={styles.placeDescription}>{place.description}</Text>
                </View>
              </View>
            ))}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.infoLabel}>Best Time to Visit</Text>
              </View>
              <Text style={styles.infoText}>{plan.bestTimeToVisit}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
                <Text style={styles.infoLabel}>Suggested Itinerary</Text>
              </View>
              <Text style={styles.infoText}>{plan.suggestedItinerary}</Text>
            </View>

            <Text style={styles.subsectionTitle}>Where to Stay</Text>
            {STAY_TIERS.map(({ key, label }) => (
              <View key={key} style={{ marginBottom: spacing.sm }}>
                <Text style={styles.tierLabel}>{label}</Text>
                {(plan.stays?.[key] || []).map((stay, index) => (
                  <View key={`${stay.name}-${index}`} style={styles.stayCard}>
                    {stay.image && <Image source={{ uri: stay.image }} style={styles.placeImage} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.placeTitle} numberOfLines={1}>{stay.name}</Text>
                      <Text style={styles.stayPrice}>{stay.priceRange}</Text>
                      <Text style={styles.placeDescription}>{stay.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
            <Text style={styles.disclaimer}>Stay prices are AI estimates, not live availability.</Text>
          </>
        )}
      </ScrollView>

      {item.status !== 'completed' && (
        <View style={styles.footer}>
          <PrimaryButton title="Mark as Completed" onPress={handleMarkCompleted} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { height: 260 },
  hero: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: { position: 'absolute', bottom: spacing.md, left: spacing.md },
  heroTitle: { fontSize: 24, fontWeight: '700', color: colors.white },
  heroSubtitle: { fontSize: 13, color: colors.white, marginTop: 2, opacity: 0.85 },
  ringOverlay: { position: 'absolute', bottom: spacing.md, right: spacing.md },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm },
  subsectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm, marginTop: spacing.xs },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  taskText: { marginLeft: spacing.sm, fontSize: 14, color: colors.textDark },
  taskTextDone: { color: colors.textGray, textDecorationLine: 'line-through' },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  planHeaderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  originCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  originLabel: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  originHint: { fontSize: 12, color: colors.textGray, marginBottom: spacing.sm },
  originInput: {
    backgroundColor: colors.chipBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  originSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  originSummaryText: { fontSize: 12, color: colors.textGray, flexShrink: 1 },
  changeLink: { fontSize: 12, color: colors.primary, fontWeight: '700', marginLeft: spacing.sm },
  membersCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  memberText: { flex: 1, fontSize: 14, color: colors.textDark, marginLeft: spacing.sm },
  memberRole: { fontSize: 11, color: colors.textGray, fontWeight: '700', textTransform: 'uppercase' },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  shareInput: {
    flex: 1,
    backgroundColor: colors.chipBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
    marginRight: spacing.sm,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.6 },
  shareError: { fontSize: 12, color: colors.primary, marginTop: spacing.sm },
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
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginLeft: 6 },
  infoText: { fontSize: 12, color: colors.textGray, lineHeight: 18 },
  airportName: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  travelRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  flightRange: { fontSize: 18, fontWeight: '800', color: colors.primary, marginRight: spacing.sm },
  duration: { fontSize: 12, color: colors.textGray },
  disclaimer: { fontSize: 10, color: colors.textGray, fontStyle: 'italic', marginBottom: spacing.sm },
  tierLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 6, textTransform: 'uppercase' },
  stayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  stayPrice: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  footer: { padding: spacing.md },
});
