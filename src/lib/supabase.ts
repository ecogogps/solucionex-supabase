
import { createClient } from '@supabase/supabase-js';

// Usamos valores por defecto temporales para evitar que la app explote si no hay variables de entorno configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase: Faltan las variables de entorno. Las peticiones fallarán pero la UI cargará.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
