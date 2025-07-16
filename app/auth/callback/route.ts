import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, if not create one
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      if (!profile) {
        // Create profile for OAuth user
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
          updated_at: new Date().toISOString(),
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard/client`)
}
