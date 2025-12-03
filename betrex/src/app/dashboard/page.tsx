import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchesList from '@/components/matches-list'
import { Zap, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Sprawdź sesję
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // 2. Pobierz profil (Punkty Papito)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Pobierz mecze (sortuj od najnowszych)
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tighter text-white">
              BET<span className="text-green-500">REX</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Wskaźnik punktów Papito */}
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-green-500 fill-green-500" />
              <span className="font-bold text-green-400">{profile?.papito_points || 0}</span>
              <span className="text-xs text-green-600 font-bold uppercase hidden sm:inline">Papito Power</span>
            </div>

            <form action="/auth/signout" method="post">
              <Button 
                variant="ghost" 
                size="icon" 
                type="submit" 
                className="text-gray-400 hover:text-white hover:bg-red-900/20"
                title="Wyloguj się"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Witaj, {profile?.username || 'Graczu'}</h1>
          <p className="text-gray-400">
            Wybierz mądrze. Pamiętaj o zasadach charakternej gry.
          </p>
        </header>

        {/* LISTA MECZÓW (CLIENT COMPONENT) */}
        <MatchesList initialMatches={matches || []} userId={user.id} />
      </main>
    </div>
  )
}