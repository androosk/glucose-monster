import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { format, subDays, startOfDay } from 'date-fns';

import { Text, View } from '@/components/Themed';
import { useReadingsStore } from '@/store/readingsStore';
import { useColorScheme } from '@/components/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

type TimeFilter = 'today' | 'week' | 'month';

export default function ChartsScreen() {
  const [filter, setFilter] = useState<TimeFilter>('week');
  const { readings, profile, fetchReadings } = useReadingsStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const targetMin = profile?.target_min ?? 70;
  const targetMax = profile?.target_max ?? 140;

  useEffect(() => {
    fetchReadings();
  }, []);

  const getFilteredReadings = () => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
    }

    return readings
      .filter((r) => new Date(r.recorded_at) >= startDate)
      .sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );
  };

  const filteredReadings = getFilteredReadings();

  const chartData = filteredReadings.map((r, index) => ({
    x: index,
    y: r.value,
    date: new Date(r.recorded_at),
  }));

  const stats = {
    count: filteredReadings.length,
    avg:
      filteredReadings.length > 0
        ? Math.round(
            filteredReadings.reduce((sum, r) => sum + r.value, 0) /
              filteredReadings.length
          )
        : 0,
    min:
      filteredReadings.length > 0
        ? Math.min(...filteredReadings.map((r) => r.value))
        : 0,
    max:
      filteredReadings.length > 0
        ? Math.max(...filteredReadings.map((r) => r.value))
        : 0,
    inRange: filteredReadings.filter(
      (r) => r.value >= targetMin && r.value <= targetMax
    ).length,
  };

  const inRangePercent =
    stats.count > 0 ? Math.round((stats.inRange / stats.count) * 100) : 0;

  const FilterButton = ({
    value,
    label,
  }: {
    value: TimeFilter;
    label: string;
  }) => (
    <Text
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
        {
          color: filter === value ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280',
          backgroundColor:
            filter === value ? '#10B981' : isDark ? '#374151' : '#E5E7EB',
        },
      ]}
      onPress={() => setFilter(value)}
    >
      {label}
    </Text>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#FFFFFF' },
      ]}
    >
      <View style={styles.filterRow}>
        <FilterButton value="today" label="Today" />
        <FilterButton value="week" label="Week" />
        <FilterButton value="month" label="Month" />
      </View>

      <View
        style={[
          styles.statsGrid,
          { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats.avg || '-'}
          </Text>
          <Text
            style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
          >
            Average
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>
            {stats.min || '-'}
          </Text>
          <Text
            style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
          >
            Min
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {stats.max || '-'}
          </Text>
          <Text
            style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
          >
            Max
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {inRangePercent}%
          </Text>
          <Text
            style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
          >
            In Range
          </Text>
        </View>
      </View>

      <Text
        style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
      >
        Glucose Trend
      </Text>

      {chartData.length > 1 ? (
        <View style={styles.chartContainer}>
          <CartesianChart
            data={chartData}
            xKey="x"
            yKeys={['y']}
            domainPadding={{ left: 10, right: 10, top: 20, bottom: 10 }}
            axisOptions={{
              font: null,
              tickCount: 5,
              labelColor: isDark ? '#9CA3AF' : '#6B7280',
              lineColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            {({ points }) => (
              <Line
                points={points.y}
                color="#10B981"
                strokeWidth={2}
                curveType="natural"
              />
            )}
          </CartesianChart>
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text
            style={[styles.emptyText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}
          >
            {chartData.length === 0
              ? 'No readings in this period'
              : 'Need at least 2 readings to show chart'}
          </Text>
        </View>
      )}

      <Text
        style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
      >
        Summary
      </Text>
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
        ]}
      >
        <Text
          style={[styles.summaryText, { color: isDark ? '#D1D5DB' : '#374151' }]}
        >
          {stats.count} readings recorded
        </Text>
        <Text
          style={[styles.summaryText, { color: isDark ? '#D1D5DB' : '#374151' }]}
        >
          Target range: {targetMin}-{targetMax} mg/dL
        </Text>
        <Text
          style={[styles.summaryText, { color: isDark ? '#D1D5DB' : '#374151' }]}
        >
          {stats.inRange} of {stats.count} readings in target range
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  filterButtonActive: {},
  statsGrid: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    height: 250,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  emptyChart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 14,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 8,
  },
});
