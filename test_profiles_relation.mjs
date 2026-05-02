import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jegafgjxmvjghrqfujsc.supabase.co'
const supabaseAnonKey = 'sb_publishable_U0shaoQtvGFoNAjYUCZskg_y69ip-UX'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*, profiles!ideas_author_id_fkey(full_name, mobile_number, persona)')
    .limit(1)

  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

main()
