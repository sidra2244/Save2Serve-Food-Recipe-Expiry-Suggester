// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rhjjzqbgtkptgxyyspll.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoamp6cWJndGtwdGd4eXlzcGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzM1NzgsImV4cCI6MjA4MTYwOTU3OH0.5DCf9Z0t9KofpC-8_Coxs6n_45gjlrJRV_RaC0fj9bc'

export const supabase = createClient(supabaseUrl, supabaseKey)