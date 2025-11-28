import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { Text, View } from '@/components/Themed';
import { useReadingsStore } from '@/store/readingsStore';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsScreen() {
  const { profile, fetchProfile, updateProfile } = useReadingsStore();
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [targetMin, setTargetMin] = useState('70');
  const [targetMax, setTargetMax] = useState('140');
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState('120');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setTargetMin(profile.target_min.toString());
      setTargetMax(profile.target_max.toString());
      setEnableReminders(profile.enable_general_reminders);
      setReminderMinutes(profile.general_reminder_minutes.toString());
    }
  }, [profile]);

  const handleSave = async () => {
    const min = parseInt(targetMin, 10);
    const max = parseInt(targetMax, 10);
    const minutes = parseInt(reminderMinutes, 10);

    if (isNaN(min) || isNaN(max) || min < 50 || max > 200 || min >= max) {
      Toast.show({
        type: 'error',
        text1: 'Invalid range',
        text2: 'Please enter valid target values (50-200)',
      });
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      target_min: min,
      target_max: max,
      enable_general_reminders: enableReminders,
      general_reminder_minutes: isNaN(minutes) ? 120 : minutes,
    });
    setSaving(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Settings saved',
      });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#111827' : '#FFFFFF' },
      ]}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Target Range
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
          ]}
        >
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              Minimum (mg/dL)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  color: isDark ? '#F9FAFB' : '#111827',
                  borderColor: isDark ? '#4B5563' : '#E5E7EB',
                },
              ]}
              value={targetMin}
              onChangeText={setTargetMin}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              Maximum (mg/dL)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  color: isDark ? '#F9FAFB' : '#111827',
                  borderColor: isDark ? '#4B5563' : '#E5E7EB',
                },
              ]}
              value={targetMax}
              onChangeText={setTargetMax}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Reminders
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
          ]}
        >
          <View style={styles.switchRow}>
            <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              Enable check-in reminders
            </Text>
            <Switch
              value={enableReminders}
              onValueChange={setEnableReminders}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {enableReminders && (
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                Remind every (minutes)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    color: isDark ? '#F9FAFB' : '#111827',
                    borderColor: isDark ? '#4B5563' : '#E5E7EB',
                  },
                ]}
                value={reminderMinutes}
                onChangeText={setReminderMinutes}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Account
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
          ]}
        >
          <Text style={[styles.emailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Signed in as
          </Text>
          <Text style={[styles.email, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {user?.email}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          GlucoseMojo v1.0.0
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
  section: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: 14,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 12,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'transparent',
  },
  version: {
    fontSize: 12,
  },
});
