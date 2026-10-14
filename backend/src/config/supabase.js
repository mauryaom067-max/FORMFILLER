import 'dotenv/config'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl) {
  throw new Error(
    'SUPABASE_URL is missing from environment variables'
  )
}

if (!supabaseSecretKey) {
  throw new Error(
    'SUPABASE_SECRET_KEY is missing from environment variables'
  )
}

/*
|--------------------------------------------------------------------------
| Normal Supabase Server Client
|--------------------------------------------------------------------------
| Used for normal backend database operations.
*/
export const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

/*
|--------------------------------------------------------------------------
| Supabase Admin Client
|--------------------------------------------------------------------------
| Used for trusted backend-only operations such as:
| - Storage uploads
| - Storage deletes
| - Final PDF management
| - Other privileged server operations
|
| IMPORTANT:
| SUPABASE_SECRET_KEY must NEVER be exposed to frontend.
*/
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)