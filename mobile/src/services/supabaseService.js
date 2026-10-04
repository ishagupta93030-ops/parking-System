import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const DEFAULT_SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client = null;
let isOfflineMode = false;

export function initializeSupabase(customUrl, customKey) {
  const url = customUrl || DEFAULT_SUPABASE_URL;
  const key = customKey || DEFAULT_SUPABASE_KEY;

  if (!url || !key) {
    isOfflineMode = true;
    return null;
  }

  try {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    isOfflineMode = false;
    return client;
  } catch (error) {
    console.warn('Supabase initialization failed, falling back to offline mode:', error);
    isOfflineMode = true;
    return null;
  }
}

// Get or create instance
export function getClient() {
  if (!client) {
    return initializeSupabase();
  }
  return client;
}

// ----------------------------------------------------------------------------
// Cloud / Realtime API Endpoints
// ----------------------------------------------------------------------------

/**
 * Subscribe to real-time slot changes
 */
export function subscribeToSlotChanges(callback) {
  const supabase = getClient();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('public:parking_slots')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        (payload) => {
          if (callback) callback(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return null;
  }
}

/**
 * Fetch all slots from Supabase
 */
export async function fetchSlots() {
  const supabase = getClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('parking_slots')
      .select('*');

    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('Error fetching slots from cloud:', e);
    return null;
  }
}

/**
 * Create a new parking booking in the cloud
 */
export async function createCloudBooking(bookingData) {
  const supabase = getClient();
  if (!supabase) return { success: true, offline: true };

  try {
    // 1. Insert vehicle record
    const { error: recordError } = await supabase.from('vehicle_records').insert([
      {
        ticket_id: bookingData.ticketId,
        plate: bookingData.plate,
        bay: bookingData.bay,
        duration: `${bookingData.hours}:00:00`,
        base_fare: parseFloat(bookingData.baseFare),
        tax: parseFloat(bookingData.tax),
        total_amount: parseFloat(bookingData.totalAmount),
        status: 'PAID'
      }
    ]);

    if (recordError) console.warn('Cloud booking record error:', recordError);

    // 2. Update slot status to OCCUPIED
    const { error: slotError } = await supabase
      .from('parking_slots')
      .update({
        status: 'OCCUPIED',
        plate: bookingData.plate,
        start_time: new Date().toISOString()
      })
      .eq('name', bookingData.bay);

    if (slotError) console.warn('Cloud slot update error:', slotError);

    // 3. Log event
    await supabase.from('system_logs').insert([
      {
        event_type: 'MOBILE_APP_RESERVATION',
        message: `Vehicle ${bookingData.plate} reserved ${bookingData.bay} for ${bookingData.hours}h`,
        metadata: bookingData
      }
    ]);

    return { success: true, offline: false };
  } catch (err) {
    console.warn('Cloud sync error during booking:', err);
    return { success: true, offline: true, error: err.message };
  }
}

/**
 * Release / Cancel a booking in the cloud
 */
export async function releaseCloudBooking(ticketId, bayName) {
  const supabase = getClient();
  if (!supabase) return { success: true, offline: true };

  try {
    // Update record status to COMPLETED
    await supabase
      .from('vehicle_records')
      .update({
        exit_time: new Date().toISOString(),
        status: 'COMPLETED'
      })
      .eq('ticket_id', ticketId);

    // Free the slot
    if (bayName) {
      await supabase
        .from('parking_slots')
        .update({
          status: 'VACANT',
          plate: null,
          start_time: null
        })
        .eq('name', bayName);
    }

    return { success: true };
  } catch (err) {
    console.warn('Error releasing cloud booking:', err);
    return { success: false, error: err.message };
  }
}
