import { createClient } from '@supabase/supabase-js';

const url = 'https://bpowfxvrbgwtbtmtasiw.supabase.co';
const key = 'sb_publishable_u0GjhJR9H7ZmzJUlrAwn1Q_Hm1ySVlV';
// Note: Using service role key if needed, but I don't have it.
const supabase = createClient(url, key);

async function check() {
    console.log("Checking if we can delete notifications without login (RLS check)...");
    
    // We can't actually do this without auth token, but we can check if it returns an error.
    // Let's just run it to see.
    const { data: nData, error: nErr } = await supabase.from('notifications').delete().in('post_id', ['dummy-uuid']);
    console.log("Notifications delete result:", nErr || nData);

    const { data: aData, error: aErr } = await supabase.from('activity_log').delete().in('post_id', ['dummy-uuid']);
    console.log("Activity log delete result:", aErr || aData);
}

check();
