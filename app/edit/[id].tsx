import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Text, View } from '@/components/Themed';
import { useReadingsStore } from '@/store/readingsStore';
import { useColorScheme } from '@/components/useColorScheme';
import { ReadingType } from '@/types/database';

const READING_TYPES: { value: ReadingType; label: string }[] = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'pre_meal', label: 'Pre-meal' },
  { value: 'post_30', label: 'Post-meal (30m)' },
  { value: 'post_90', label: 'Post-meal (90m)' },
  { value: 'random', label: 'Other' },
];

export default function EditReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { readings, updateReading, deleteReading } = useReadingsStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const reading = readings.find((r) => r.id === id);

  const [value, setValue] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('random');
  const [carbs, setCarbs] = useState('');
  const [insulin, setInsulin] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordedAt, setRecordedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (reading) {
      setValue(reading.value.toString());
      setReadingType(reading.reading_type);
      setCarbs(reading.carbs?.toString() || '');
      setInsulin(reading.insulin?.toString() || '');
      setNotes(reading.notes || '');
      setRecordedAt(new Date(reading.recorded_at));
    }
  }, [reading]);

  if (!reading) {
    return (
      <View style={styles.centered}>
        <Text>Reading not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    const glucoseValue = parseInt(value, 10);

    if (!value || isNaN(glucoseValue)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid value',
        text2: 'Please enter a valid glucose reading',
      });
      return;
    }

    if (glucoseValue < 20 || glucoseValue > 600) {
      Toast.show({
        type: 'error',
        text1: 'Out of range',
        text2: 'Glucose value must be between 20 and 600 mg/dL',
      });
      return;
    }

    setLoading(true);

    const { error } = await updateReading(id!, {
      value: glucoseValue,
      reading_type: readingType,
      carbs: carbs ? parseInt(carbs, 10) : null,
      insulin: insulin ? parseFloat(insulin) : null,
      notes: notes.trim() || null,
      recorded_at: recordedAt.toISOString(),
    });

    setLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Reading updated',
      });
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Reading',
      'Are you sure you want to delete this reading?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await deleteReading(id!);
            setLoading(false);

            if (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
              });
            } else {
              Toast.show({
                type: 'success',
                text1: 'Reading deleted',
              });
              router.back();
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Reading',
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#F9FAFB' : '#111827',
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.container,
          { backgroundColor: isDark ? '#111827' : '#FFFFFF' },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Glucose Value (mg/dL)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.valueInput,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                color: isDark ? '#F9FAFB' : '#111827',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder="Enter value"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            maxLength={3}
          />

          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Date & Time
          </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateTimeText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                {format(recordedAt, 'MMM d, yyyy')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.dateTimeText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                {format(recordedAt, 'h:mm a')}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={recordedAt}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setRecordedAt(date);
              }}
              maximumDate={new Date()}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={recordedAt}
              mode="time"
              display="spinner"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) setRecordedAt(date);
              }}
            />
          )}

          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Reading Type
          </Text>
          <View style={styles.typeButtons}>
            {READING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      readingType === type.value
                        ? '#10B981'
                        : isDark
                          ? '#374151'
                          : '#E5E7EB',
                  },
                ]}
                onPress={() => setReadingType(type.value)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        readingType === type.value
                          ? '#FFFFFF'
                          : isDark
                            ? '#F9FAFB'
                            : '#374151',
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Carbs (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                color: isDark ? '#F9FAFB' : '#111827',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="number-pad"
            placeholder="Grams of carbs"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          />

          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Insulin (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                color: isDark ? '#F9FAFB' : '#111827',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            value={insulin}
            onChangeText={setInsulin}
            keyboardType="decimal-pad"
            placeholder="Units of insulin"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          />

          <Text style={[styles.label, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                color: isDark ? '#F9FAFB' : '#111827',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>Delete Reading</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  valueInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesInput: {
    height: 100,
    paddingTop: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
