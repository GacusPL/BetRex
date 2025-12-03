import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createMatch, updateMatchStatus } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Play, CheckCircle, Ban } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Autoryzacja na wejściu
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  // 2. Blokada dla zwykłych śmiertelników
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center flex-col gap-4 p-4 text-center">
        <ShieldAlert className="w-20 h-20 animate-pulse" />
        <h1 className="text-4xl font-black tracking-tighter">ZAKAZ WSTĘPU</h1>
        <p className="text-gray-400">To jest strefa dla Zarządu. <br/>Wracaj obstawiać albo będzie liść.</p>
        <a href="/dashboard" className="text-green-500 hover:underline mt-4 block">Wróć do Dashboardu</a>
      </div>
    )
  }

  // 3. Pobranie meczów (tylko jeśli jesteś adminem)
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-black text-green-500 tracking-tighter">PANEL BOGA</h1>
            <p className="text-gray-400 text-sm">Zarządzanie turniejem TREX CUP</p>
          </div>
          <a href="/dashboard">
            <Button variant="outline" className="border-zinc-700">Podgląd Gracza</Button>
          </a>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* --- LEWA KOLUMNA: TWORZENIE --- */}
          <div className="lg:col-span-1">
            <Card className="bg-black border-green-900/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-green-500">Dodaj Nowy Mecz</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createMatch} className="grid gap-4">
                  <Input name="gameName" placeholder="Gra (np. CS2 Wingman)" className="bg-zinc-900 border-zinc-700 text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="teamA" placeholder="Team A" className="bg-zinc-900 border-zinc-700 text-white" required />
                    <Input name="teamB" placeholder="Team B" className="bg-zinc-900 border-zinc-700 text-white" required />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-black font-bold">
                    DODAJ DO ROZPISKI
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* --- PRAWA KOLUMNA: ZARZĄDZANIE --- */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-500" />
              Aktywne Mecze ({matches?.length || 0})
            </h2>
            
            {matches?.map((match) => (
              <Card key={match.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* INFO O MECZU */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-zinc-800 text-gray-400">{match.game_name}</Badge>
                        <Badge className={`${
                          match.status === 'LIVE' ? 'bg-red-600 hover:bg-red-600 animate-pulse' : 
                          match.status === 'FINISHED' ? 'bg-zinc-700 hover:bg-zinc-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-600'
                        }`}>
                          {match.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold">
                        <span className={match.winner === 'A' ? 'text-green-500' : ''}>{match.team_a}</span>
                        <span className="text-zinc-600 mx-2">vs</span>
                        <span className={match.winner === 'B' ? 'text-green-500' : ''}>{match.team_b}</span>
                      </h3>
                    </div>

                    {/* PRZYCISKI STEROWANIA */}
                    {match.status !== 'FINISHED' && (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        
                        {/* Przycisk START LIVE */}
                        {match.status === 'PENDING' && (
                          <form action={updateMatchStatus.bind(null, match.id, 'LIVE', null)}>
                            <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 font-bold">
                              <Play className="w-4 h-4 mr-2" /> ODPAL LIVE
                            </Button>
                          </form>
                        )}

                        {/* Przyciski ROZSTRZYGNIĘCIA */}
                        <div className="flex gap-2">
                          <form action={updateMatchStatus.bind(null, match.id, 'FINISHED', 'A')}>
                             <Button size="sm" variant="outline" className="border-green-900 text-green-500 hover:bg-green-900/50">
                               Win {match.team_a}
                             </Button>
                          </form>
                          <form action={updateMatchStatus.bind(null, match.id, 'FINISHED', 'B')}>
                             <Button size="sm" variant="outline" className="border-green-900 text-green-500 hover:bg-green-900/50">
                               Win {match.team_b}
                             </Button>
                          </form>
                        </div>
                        
                        {/* Przycisk ANULUJ (gdyby coś poszło nie tak) */}
                         <form action={updateMatchStatus.bind(null, match.id, 'FINISHED', null)}>
                             <Button size="sm" variant="ghost" className="text-gray-500 hover:text-white h-6 text-xs">
                               <Ban className="w-3 h-3 mr-1" /> Anuluj mecz
                             </Button>
                          </form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!matches || matches.length === 0) && (
              <p className="text-gray-500 text-center py-10">Brak meczów. Dodaj coś, bo widzowie czekają.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}