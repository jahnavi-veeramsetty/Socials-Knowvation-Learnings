import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkColumns() {
    const { data, error } = await supabase.from('posts').select('*').limit(1)
    if (data && data.length > 0) {
        console.log('Columns in posts table:', Object.keys(data[0]))
    } else {
        console.log('No data in posts table or error:', error)
    }
}

checkColumns()
