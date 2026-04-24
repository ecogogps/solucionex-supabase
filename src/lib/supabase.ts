
import { createClient } from '@supabase/supabase-js';

// Usamos valores por defecto temporales para evitar que la app explote si no hay variables de entorno configuradas
// Esto permite navegar por la UI del prototipo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase: Faltan las variables de entorno en el archivo .env. Las peticiones a la base de datos fallarán, pero la navegación de la UI está habilitada.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
