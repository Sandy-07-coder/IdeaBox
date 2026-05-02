import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jegafgjxmvjghrqfujsc.supabase.co'
const supabaseAnonKey = 'sb_publishable_U0shaoQtvGFoNAjYUCZskg_y69ip-UX'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  // Try to update idea with id = '1380f123-0e29-4af7-965e-6aa294f97000'
  const { data, error } = await supabase
    .from('ideas')
    .update({ is_approved: true })
    .eq('id', '1380f123-0e29-4af7-965e-6aa294f97000')
    .select()

  console.log("Data:", data)
  console.log("Error:", error)
}

main()
