import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Reading, Profile, ReadingType } from '@/types/database';

interface ReadingInsert {
  value: number;
  reading_type: ReadingType;
  carbs: number | null;
  notes: string | null;
  tags: string[] | null;
  meal_id: string | null;
  recorded_at: string;
  user_id: string;
}

interface ReadingsState {
  readings: Reading[];
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchReadings: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  addReading: (
    reading: Omit<Reading, 'id' | 'user_id' | 'created_at'>
  ) => Promise<{ error: Error | null }>;
  updateReading: (
    id: string,
    updates: Partial<Reading>
  ) => Promise<{ error: Error | null }>;
  deleteReading: (id: string) => Promise<{ error: Error | null }>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: Error | null }>;
}

export const useReadingsStore = create<ReadingsState>((set, get) => ({
  readings: [],
  profile: null,
  loading: false,
  error: null,

  fetchReadings: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      set({ readings: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  addReading: async (reading) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData: ReadingInsert = {
        ...reading,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('readings')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        readings: [data, ...state.readings],
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateReading: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('readings')
        .update(updates as never)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        readings: state.readings.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteReading: async (id) => {
    try {
      const { error } = await supabase.from('readings').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        readings: state.readings.filter((r) => r.id !== id),
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateProfile: async (updates) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));
