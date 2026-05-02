import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jegafgjxmvjghrqfujsc.supabase.co'
const supabaseAnonKey = 'sb_publishable_U0shaoQtvGFoNAjYUCZskg_y69ip-UX'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*, admin_profile:profiles!ideas_approved_by_fkey(full_name)')
    .limit(1)

  if (error) {
    console.error("Error 1:", error)
    const { data: d2, error: e2 } = await supabase.from('ideas').select('*, admin_profile:profiles!approved_by(full_name)').limit(1)
    if (e2) {
      console.error("Error 2:", e2)
    } else {
      console.log("Success 2:", JSON.stringify(d2))
    }
  } else {
    console.log("Success 1:", JSON.stringify(data))
  }
}

main()
