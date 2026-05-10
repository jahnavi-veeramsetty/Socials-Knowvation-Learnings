import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkTables() {
    const { data, error } = await supabase.from('activity_log').select('*').limit(1)
    if (error) {
        console.log('activity_log table might not exist:', error.message)
    } else {
        console.log('activity_log table exists')
    }
}

checkTables()
