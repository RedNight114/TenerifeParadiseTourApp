import { getSupabaseClient } from "./supabase-unified"

export async function signInWithGoogle() {
  const client = await getSupabaseClient()
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
  const client = await getSupabaseClient()
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
