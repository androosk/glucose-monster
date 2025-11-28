import { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useReadingsStore } from '@/store/readingsStore';
import { useColorScheme } from '@/components/useColorScheme';
import { Reading, ReadingType } from '@/types/database';

const READING_TYPE_LABELS: Record<ReadingType, string> = {
  fasting: 'Fasting',
  pre_meal: 'Pre-meal',
  post_30: 'Post-meal (30m)',
  post_90: 'Post-meal (90m)',
  random: 'Other',
};

function getGlucoseColor(value: number, targetMin = 70, targetMax = 140) {
  if (value < targetMin) return '#3B82F6'; // blue - low
  if (value <= targetMax) return '#10B981'; // green - target
  if (value <= 180) return '#F59E0B'; // yellow - high
  return '#EF4444'; // red - very high
}

function ReadingItem({
  reading,
  targetMin,
  targetMax,
}: {
  reading: Reading;
  targetMin: number;
  targetMax: number;
}) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const glucoseColor = getGlucoseColor(reading.value, targetMin, targetMax);

  return (
    <TouchableOpacity
      style={[
        styles.readingItem,
        { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
      ]}
      onPress={() => router.push(`/edit/${reading.id}`)}
    >
      <View
        style={[styles.glucoseValue, { backgroundColor: glucoseColor + '20' }]}
      >
        <Text style={[styles.glucoseNumber, { color: glucoseColor }]}>
          {reading.value}
        </Text>
        <Text style={[styles.glucoseUnit, { color: glucoseColor }]}>mg/dL</Text>
      </View>
      <View style={styles.readingDetails}>
        <Text style={[styles.readingType, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          {READING_TYPE_LABELS[reading.reading_type]}
        </Text>
        <Text style={[styles.readingTime, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {format(new Date(reading.recorded_at), 'MMM d, h:mm a')}
        </Text>
        {reading.notes && (
          <Text
            style={[styles.readingNotes, { color: isDark ? '#6B7280' : '#9CA3AF' }]}
            numberOfLines={1}
          >
            {reading.notes}
          </Text>
        )}
      </View>
      {(reading.carbs || reading.insulin) && (
        <View style={styles.badges}>
          {reading.carbs && (
            <View style={styles.carbsBadge}>
              <Text style={styles.carbsText}>{reading.carbs}g</Text>
            </View>
          )}
          {reading.insulin && (
            <View style={styles.insulinBadge}>
              <Text style={styles.insulinText}>{reading.insulin}u</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { readings, profile, loading, fetchReadings, fetchProfile } =
    useReadingsStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const targetMin = profile?.target_min ?? 70;
  const targetMax = profile?.target_max ?? 140;

  useEffect(() => {
    fetchReadings();
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    fetchReadings();
    fetchProfile();
  }, []);

  const todayReadings = readings.filter((r) => {
    const today = new Date();
    const readingDate = new Date(r.recorded_at);
    return readingDate.toDateString() === today.toDateString();
  });

  const avgToday =
    todayReadings.length > 0
      ? Math.round(
          todayReadings.reduce((sum, r) => sum + r.value, 0) /
            todayReadings.length
        )
      : null;

  if (loading && readings.length === 0) {
    return (
      <View style={styles.centered}>
        <Image
          source={require('@/assets/images/mascot-laptop.png')}
          style={styles.loadingMascot}
          resizeMode="contain"
        />
        <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Loading your readings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statsCard,
          { backgroundColor: isDark ? '#1F2937' : '#F0FDF4' },
        ]}
      >
        <Text style={[styles.statsLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Today's Average
        </Text>
        <Text
          style={[
            styles.statsValue,
            {
              color: avgToday
                ? getGlucoseColor(avgToday, targetMin, targetMax)
                : isDark
                  ? '#6B7280'
                  : '#9CA3AF',
            },
          ]}
        >
          {avgToday ? `${avgToday} mg/dL` : 'No readings yet'}
        </Text>
        <Text style={[styles.statsSubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {todayReadings.length} reading{todayReadings.length !== 1 ? 's' : ''}{' '}
          today
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
        Recent Readings
      </Text>

      <FlatList
        data={readings.slice(0, 50)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReadingItem
            reading={item}
            targetMin={targetMin}
            targetMax={targetMax}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require('@/assets/images/mascot.png')}
              style={styles.emptyMascot}
              resizeMode="contain"
            />
            <Text style={[styles.emptyTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              No readings yet!
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Tap "Add Reading" to log your first glucose reading and start taming the monster.
            </Text>
          </View>
        }
        contentContainerStyle={readings.length === 0 && styles.emptyContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMascot: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  glucoseValue: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  glucoseNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  glucoseUnit: {
    fontSize: 10,
  },
  readingDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  readingType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 13,
  },
  readingNotes: {
    fontSize: 12,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-end',
  },
  carbsBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  carbsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
  },
  insulinBadge: {
    backgroundColor: '#818CF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insulinText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyMascot: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
  },
});
