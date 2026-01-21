import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  sku: string;
  created_at: string;
  updated_at: string;
}
