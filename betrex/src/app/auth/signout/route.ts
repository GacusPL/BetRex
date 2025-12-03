import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Sprawdź sesję
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // 2. Wyloguj (czyści ciasteczka)
    await supabase.auth.signOut()
  }

  // 3. Wyczyść cache (żeby stare dane nie wisiały)
  revalidatePath('/', 'layout')

  // 4. Przekieruj na stronę logowania
  return NextResponse.redirect(new URL('/login', req.url))
}