import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

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

const QUICK_VALUES = [70, 80, 90, 100, 110, 120, 130, 140, 150];

export default function AddReadingScreen() {
  const [value, setValue] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('random');
  const [carbs, setCarbs] = useState('');
  const [insulin, setInsulin] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { addReading } = useReadingsStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSubmit = async () => {
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

    const { error } = await addReading({
      value: glucoseValue,
      reading_type: readingType,
      carbs: carbs ? parseInt(carbs, 10) : null,
      insulin: insulin ? parseFloat(insulin) : null,
      notes: notes.trim() || null,
      tags: null,
      meal_id: null,
      recorded_at: new Date().toISOString(),
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
        text1: 'Reading saved',
        text2: `${glucoseValue} mg/dL recorded`,
      });
      setValue('');
      setCarbs('');
      setInsulin('');
      setNotes('');
      setReadingType('random');
      router.push('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
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

        <Text
          style={[styles.quickLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
        >
          Quick Select
        </Text>
        <View style={styles.quickValues}>
          {QUICK_VALUES.map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.quickButton,
                {
                  backgroundColor:
                    value === v.toString()
                      ? '#10B981'
                      : isDark
                        ? '#374151'
                        : '#E5E7EB',
                },
              ]}
              onPress={() => setValue(v.toString())}
            >
              <Text
                style={[
                  styles.quickButtonText,
                  {
                    color:
                      value === v.toString()
                        ? '#FFFFFF'
                        : isDark
                          ? '#F9FAFB'
                          : '#374151',
                  },
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Reading</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  quickLabel: {
    fontSize: 14,
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
  notesInput: {
    height: 100,
    paddingTop: 14,
  },
  quickValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
