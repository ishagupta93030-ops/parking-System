import { createClient } from '@supabase/supabase-js';

// Default keys from environment or localStorage
const getStoredConfig = () => {
  const url = localStorage.getItem('parksense_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('parksense_supabase_anon_key') || 
              import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
              import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

let clientInstance = null;

export function getSupabaseClient() {
  const { url, key } = getStoredConfig();
  if (!url || !key) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return clientInstance;
}

export function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem('parksense_supabase_url', url.trim());
  else localStorage.removeItem('parksense_supabase_url');

  if (key) localStorage.setItem('parksense_supabase_anon_key', key.trim());
  else localStorage.removeItem('parksense_supabase_anon_key');

  clientInstance = null; // Recreate on next call
  return getSupabaseClient();
}

export function isSupabaseConfigured() {
  const { url, key } = getStoredConfig();
  return Boolean(url && key);
}

export function getSupabaseConfig() {
  return getStoredConfig();
}

// Test live connection to Supabase
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }

  try {
    const { data, error } = await client.from('vehicle_records').select('ticket_id').limit(1);
    if (error) {
      // Table might not exist yet or key invalid
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected successfully to Supabase database!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ----------------------------------------------------------------------------
// Database Operations with Offline LocalStorage Fallback
// ----------------------------------------------------------------------------

export async function fetchAllVehicleRecords() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('vehicle_records')
        .select('*')
        .order('entry_time', { ascending: false });

      if (!error && data) {
        // Map database columns to app format
        const mapped = data.map(r => ({
          ticketId: r.ticket_id,
          plate: r.plate,
          bay: r.bay,
          entryTime: new Date(r.entry_time).toLocaleTimeString(),
          exitTime: r.exit_time ? new Date(r.exit_time).toLocaleTimeString() : '--:--',
          duration: r.duration || '00:00:00',
          baseFare: Number(r.base_fare || 0).toFixed(2),
          tax: Number(r.tax || 0).toFixed(2),
          totalAmount: Number(r.total_amount || 0).toFixed(2),
          status: r.status || 'PAID'
        }));
        // Update local backup
        localStorage.setItem('parksense_local_records', JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local storage:', e);
    }
  }

  // Fallback to local storage
  const local = localStorage.getItem('parksense_local_records');
  return local ? JSON.parse(local) : [];
}

export async function insertVehicleRecord(rec) {
  // Update local storage first (instant responsiveness)
  const local = localStorage.getItem('parksense_local_records');
  const records = local ? JSON.parse(local) : [];
  const updated = [rec, ...records];
  localStorage.setItem('parksense_local_records', JSON.stringify(updated));

  // Sync to Supabase cloud
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('vehicle_records').insert([
        {
          ticket_id: rec.ticketId,
          plate: rec.plate,
          bay: rec.bay,
          duration: rec.duration,
          base_fare: parseFloat(rec.baseFare) || 0,
          tax: parseFloat(rec.tax) || 0,
          total_amount: parseFloat(rec.totalAmount) || 0,
          status: rec.status || 'PAID'
        }
      ]);
    } catch (e) {
      console.warn('Cloud sync error for vehicle record:', e);
    }
  }

  return updated;
}

export async function deleteVehicleRecord(ticketId) {
  const local = localStorage.getItem('parksense_local_records');
  if (local) {
    const records = JSON.parse(local).filter(r => r.ticketId !== ticketId);
    localStorage.setItem('parksense_local_records', JSON.stringify(records));
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('vehicle_records').delete().eq('ticket_id', ticketId);
    } catch (e) {
      console.warn('Cloud delete error:', e);
    }
  }
}

export async function clearAllVehicleRecords() {
  localStorage.removeItem('parksense_local_records');
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('vehicle_records').delete().neq('ticket_id', '0');
    } catch (e) {
      console.warn('Cloud clear error:', e);
    }
  }
}

export async function logSystemEvent(eventType, message, metadata = {}) {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('system_logs').insert([
        {
          event_type: eventType,
          message,
          metadata
        }
      ]);
    } catch (e) {
      // Ignore background log errors
    }
  }
}

// ----------------------------------------------------------------------------
// Research Response-Time Benchmarks (Physical Hardware & Simulation)
// ----------------------------------------------------------------------------

export function fetchResponseTimeMetrics() {
  try {
    const raw = localStorage.getItem('parksense_benchmark_records');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function insertResponseTimeMetric(metric) {
  // Store in local benchmark cache
  let records = fetchResponseTimeMetrics();
  records = [metric, ...records.slice(0, 199)]; // Keep latest 200 records
  localStorage.setItem('parksense_benchmark_records', JSON.stringify(records));

  // Sync to Supabase cloud logs
  const client = getSupabaseClient();
  if (client) {
    try {
      // 1. Log to system_logs table
      await client.from('system_logs').insert([
        {
          event_type: 'RESPONSE_TIME_BENCHMARK',
          message: `${metric.source} detection response: ${metric.totalMs.toFixed(1)}ms (${metric.eventType})`,
          metadata: metric
        }
      ]);

      // 2. Also try sensor_benchmarks if table exists
      await client.from('sensor_benchmarks').insert([
        {
          source: metric.source,
          event_type: metric.eventType,
          detection_to_ui_ms: metric.detectionToUiMs,
          ui_to_db_ms: metric.uiToDbMs,
          total_response_ms: metric.totalMs,
          measured_at: metric.timestamp
        }
      ]);
    } catch (e) {
      // Silent fallback to local storage
    }
  }

  return records;
}

export function clearResponseTimeMetrics() {
  localStorage.removeItem('parksense_benchmark_records');
  return [];
}

