import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jegafgjxmvjghrqfujsc.supabase.co'
const supabaseAnonKey = 'sb_publishable_U0shaoQtvGFoNAjYUCZskg_y69ip-UX'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '08ab241a-78d3-431f-ad01-bd63a0fe015a')

  console.log("Data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}

main()
