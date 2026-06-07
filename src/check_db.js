import { createClient } from '@supabase/supabase-js';

const url = 'https://bpowfxvrbgwtbtmtasiw.supabase.co';
const key = 'sb_publishable_u0GjhJR9H7ZmzJUlrAwn1Q_Hm1ySVlV';
const supabase = createClient(url, key);

async function check() {
    console.log("Testing 4...");
    const { data: d4, error: e4 } = await supabase
        .from('notifications')
        .select(`*, posts:post_id(title)`)
        .limit(1);
    console.log("Result 4:", e4 ? e4.message : d4);
}

check();
