import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. BEZPIECZNIK: Sprawdź czy w ogóle mamy klucze na Vercelu
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("⚠️ BRAK KLUCZY SUPABASE W MIDDLEWARE - Puszczam ruch wolno.")
    // Jeśli nie ma kluczy, nie blokuj strony błędem 500, tylko puść dalej
    return NextResponse.next()
  }

  try {
    // 2. Próba odświeżenia sesji
    return await updateSession(request)
  } catch (e) {
    // 3. W razie awarii Supabase - nie wywalaj całej aplikacji
    console.error('Middleware Error:', e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}