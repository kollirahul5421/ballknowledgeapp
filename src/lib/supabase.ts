import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          code: string;
          player1: string;
          player2: string | null;
          status: 'waiting' | 'lobby' | 'playing' | 'finished';
          player1_ready: boolean;
          player2_ready: boolean;
          game_state: any | null;
          created_at: string;
          joined_at: string | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          player1: string;
          player2?: string | null;
          status?: 'waiting' | 'lobby' | 'playing' | 'finished';
          player1_ready?: boolean;
          player2_ready?: boolean;
          game_state?: any | null;
          created_at?: string;
          joined_at?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          player1?: string;
          player2?: string | null;
          status?: 'waiting' | 'lobby' | 'playing' | 'finished';
          player1_ready?: boolean;
          player2_ready?: boolean;
          game_state?: any | null;
          created_at?: string;
          joined_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};