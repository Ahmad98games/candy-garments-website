const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qlqowijkxmluakyzqqou.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_EdpgC3Vi_2XyZ_CwrzC00w_SxD_xDKV';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
