import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase: Credenciales no detectadas. La conexión con la base de datos podría no funcionar correctamente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);