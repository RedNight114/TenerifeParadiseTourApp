import { getSupabaseClient } from "./supabase-optimized"

export async function signInWithGoogle() {
  const supabaseClient = getSupabaseClient()
  const client = await supabaseClient.getClient()
  if (!client) {
    throw new Error("No se pudo obtener el cliente de Supabase")
  }
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signInWithGithub() {
  const supabaseClient = getSupabaseClient()
  const client = await supabaseClient.getClient()
  if (!client) {
    throw new Error("No se pudo obtener el cliente de Supabase")
  }
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}
