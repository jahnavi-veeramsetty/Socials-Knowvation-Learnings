import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkTeamFetch() {
    const orgId = '906f9cbd-8b2d-4191-8952-254ab24fd0e0' // From user screenshot
    const { data, error } = await supabase
        .from('organization_members')
        .select(`
            role,
            user_id
        `)
        .eq('organization_id', orgId);
    
    if (error) {
        console.error('Error fetching members:', error.message);
        return;
    }
    console.log('Members found:', data.length);
    
    if (data.length > 0) {
        const userId = data[0].user_id;
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (pError) {
            console.error('Error fetching profile:', pError.message);
        } else {
            console.log('Profile found:', profile.full_name);
        }
    }
}

checkTeamFetch()
