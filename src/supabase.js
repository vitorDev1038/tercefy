import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://slzdzrfvrocsmczgoddb.supabase.co'
const supabaseKey = 'sb_publishable_KCOEVIuReY_YKpDOGOPH9w_VJrUg3j6'
export const supabase = createClient(supabaseUrl, supabaseKey)