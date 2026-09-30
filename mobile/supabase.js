import { createClient } from '@supabase/supabase-js';

// Supabase Production Project URL and Key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oqleznvcaropvlmgaznf.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_QvyVb4e6OdE8AlUY5SPimg_o4P9TSue';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
