import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface Taxi {
  id: string;
  name: string;
  vehicle_type: string;
  price_per_km: number;
  multiplier: number;
  is_available: boolean;
  created_at: string;
}

export interface Availability {
  id: string;
  date: string;
  time_slot: string;
  is_available: boolean;
  created_at: string;
}

export interface Ride {
  id: string;
  user_id: string;
  taxi_id: string;
  start_location: string;
  start_lat: number;
  start_lng: number;
  end_location: string;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  estimated_time: number;
  price: number;
  ride_date: string;
  ride_time: string;
  status: 'pending' | 'accepted' | 'en_route' | 'finished' | 'cancelled';
  created_at: string;
}

export interface RideWithDetails extends Ride {
  profiles: Profile;
  taxis: Taxi;
}
