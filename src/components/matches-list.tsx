'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { placeBet } from '@/app/dashboard/actions' // Upewnij się, że masz ten plik z poprzednich kroków!
import { Zap, Trophy, AlertTriangle, Swords } from 'lucide-react'

// Typ danych zgodny z bazą Supabase
type Match = {
  id: number
  game_name: string
  team_a: string
  team_b: string
  status: string // 'PENDING', 'LIVE', 'FINISHED'
  winner: string | null
}

export default function MatchesList({ initialMatches, userId }: { initialMatches: Match[], userId: string }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [betAmount, setBetAmount] = useState<number>(100)
  const supabase = createClient()

  // --- 1. REALTIME (To spełnia wymóg Live Betting ze SWIZ) ---
  // Jak Admin zmieni wynik w bazie, u Ciebie zmieni się to bez odświeżania strony.
  useEffect(() => {
    const channel = supabase
      .channel('realtime-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
           setMatches((current) => current.map(m => m.id === payload.new.id ? payload.new as Match : m))
        } else if (payload.eventType === 'INSERT') {
           setMatches((current) => [payload.new as Match, ...current])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // --- 2. OBSŁUGA ZAKŁADU ---
  const handleBet = async (matchId: number, prediction: string, teamName: string) => {
    if (betAmount <= 0) return alert("Co ty, na minusie chcesz grać?")
    
    // Optymistyczne powiadomienie
    const confirm = window.confirm(`Czy na pewno chcesz postawić ${betAmount} pkt na ${teamName}?`)
    if (!confirm) return

    const result = await placeBet(matchId, prediction, betAmount)
    
    if (result.error) {
      alert(`BŁĄD: ${result.error}`)
    } else {
      alert(`SUKCES: ${result.success}`)
      // Tutaj można by odświeżyć punkty usera, ale dla MVP wystarczy odświeżenie strony F5
      // lub użycie router.refresh()
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {matches.map((match) => (
        <Card key={match.id} className={`bg-zinc-900 border-zinc-800 relative overflow-hidden transition-all hover:border-green-900/50 ${match.status === 'LIVE' ? 'border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : ''}`}>
          
          {/* OZNACZENIE STATUSU */}
          {match.status === 'LIVE' && (
             <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 animate-pulse z-10">
               LIVE
             </div>
          )}
          {match.status === 'FINISHED' && (
             <div className="absolute top-0 right-0 bg-zinc-700 text-gray-300 text-xs font-bold px-3 py-1 z-10">
               KONIEC
             </div>
          )}

          <CardHeader className="pb-2 text-center pt-8">
            <Badge variant="outline" className="mb-3 w-fit mx-auto border-green-900 text-green-500 font-bold tracking-wider">
              {match.game_name}
            </Badge>
            <CardTitle className="flex justify-between items-center text-lg md:text-xl text-white font-black uppercase tracking-tight">
              <span className={`w-1/3 text-right ${match.winner === 'A' ? 'text-yellow-400' : ''}`}>{match.team_a}</span>
              <span className="text-zinc-600 mx-2"><Swords className="w-5 h-5" /></span>
              <span className={`w-1/3 text-left ${match.winner === 'B' ? 'text-yellow-400' : ''}`}>{match.team_b}</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {match.status !== 'FINISHED' ? (
              <div className="space-y-4 mt-4">
                {/* INPUT STAWKI */}
                <div className="flex items-center gap-2 justify-center bg-black/40 p-2 rounded-lg border border-white/5">
                   <span className="text-zinc-500 text-xs uppercase font-bold">Stawka:</span>
                   <Input 
                      type="number" 
                      value={betAmount} 
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-20 bg-transparent border-none text-white h-6 text-right font-mono focus-visible:ring-0 p-0"
                   />
                   <Zap className="w-4 h-4 text-green-500" />
                </div>
                
                {/* PRZYCISKI OBSTAWIANIA */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleBet(match.id, 'A', match.team_a)}
                    className="bg-zinc-800 hover:bg-green-600 hover:text-black text-zinc-300 font-bold border border-zinc-700 transition-colors"
                  >
                    {match.team_a}
                  </Button>
                  <Button 
                    onClick={() => handleBet(match.id, 'B', match.team_b)}
                    className="bg-zinc-800 hover:bg-green-600 hover:text-black text-zinc-300 font-bold border border-zinc-700 transition-colors"
                  >
                    {match.team_b}
                  </Button>
                </div>
              </div>
            ) : (
                /* WIDOK PO ZAKOŃCZENIU */
               <div className="text-center py-4 bg-zinc-950/50 rounded border border-zinc-800/50 mt-4">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs uppercase font-bold">Zwycięzca</p>
                  <p className="text-white font-black text-lg tracking-wider">
                    {match.winner === 'A' ? match.team_a : (match.winner === 'B' ? match.team_b : 'REMIS')}
                  </p>
               </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* EMPTY STATE */}
      {matches.length === 0 && (
        <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-400">Pusta rozpiska</h3>
          <p className="text-gray-600">Prezes jeszcze nie ustalił kto z kim gra.</p>
        </div>
      )}
    </div>
  )
}