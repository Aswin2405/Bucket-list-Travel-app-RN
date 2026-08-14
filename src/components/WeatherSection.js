import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../api/errors';
import { formatWeekdayDate } from '../utils/format';
import * as weatherApi from '../api/weatherApi';

export default function WeatherSection({ item }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const destination = item.location || item.title;
  const { startDate, endDate } = item;
  const hasDates = !!startDate && !!endDate;

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!hasDates || !destination) return;
    setLoading(true);
    setError(null);
    weatherApi
      .getWeather(destination, startDate, endDate)
      .then(setWeather)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [destination, startDate, endDate, hasDates]);

  useEffect(() => {
    setWeather(null);
    load();
  }, [load]);

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Weather</Text>
          <Ionicons name="partly-sunny" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        </View>
        {hasDates && weather && !loading && (
          <TouchableOpacity onPress={load} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {!hasDates && (
        <View style={styles.infoCard}>
          <Text style={styles.mutedText}>Set your trip dates above to see the weather for those days.</Text>
        </View>
      )}

      {hasDates && loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />}

      {hasDates && error && !loading && (
        <View style={styles.infoCard}>
          <Text style={styles.mutedText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryLink}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasDates && weather && !loading && !error && (
        <>
          <Text style={styles.locationNote}>
            {weather.source === 'forecast'
              ? `Live forecast for ${weather.location}`
              : `Typical weather for ${weather.location} (based on last year)`}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
            {weather.daily.map((day) => (
              <View key={day.date} style={styles.dayCard}>
                <Text style={styles.dayDate}>{formatWeekdayDate(day.date)}</Text>
                <Ionicons name={day.icon} size={30} color={colors.primary} style={{ marginVertical: 6 }} />
                <Text style={styles.dayTemp}>
                  {Math.round(day.tempMax)}° <Text style={styles.dayTempMin}>/ {Math.round(day.tempMin)}°</Text>
                </Text>
                <Text style={styles.dayDesc} numberOfLines={2}>
                  {day.description}
                </Text>
                {day.precipitation > 0 && (
                  <View style={styles.precipRow}>
                    <Ionicons name="water-outline" size={11} color={colors.textGray} />
                    <Text style={styles.precipText}>{day.precipitation}mm</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
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
    infoCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    mutedText: { fontSize: 13, color: colors.textGray, lineHeight: 18 },
    retryLink: { marginTop: spacing.sm },
    retryText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
    locationNote: { fontSize: 12, color: colors.textGray, marginBottom: spacing.sm },
    daysRow: { paddingBottom: spacing.xs },
    dayCard: {
      width: 104,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginRight: spacing.sm,
      alignItems: 'center',
    },
    dayDate: { fontSize: 12, fontWeight: '700', color: colors.textDark },
    dayTemp: { fontSize: 15, fontWeight: '800', color: colors.textDark },
    dayTempMin: { fontSize: 12, fontWeight: '600', color: colors.textGray },
    dayDesc: { fontSize: 11, color: colors.textGray, textAlign: 'center', marginTop: 2, minHeight: 28 },
    precipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    precipText: { fontSize: 10, color: colors.textGray, marginLeft: 2 },
  });
}
