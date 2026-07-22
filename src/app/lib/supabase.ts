import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dsqkxedafwzkjtcupzwx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eVKip5bCvRVzLJ4-Sdutrw_Fik6pLIn";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
