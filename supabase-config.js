// ⚠️ استبدل هذه القيم بقيم مشروعك على Supabase
const SUPABASE_URL = 'https://yntbplanuotadiwhmqlz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0orm8kUD8X8nZGvWZgm7NA_ddcA4W0p';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
