'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { placeCoupon } from '@/app/dashboard/actions'
import { Zap, Trash2, Ticket, CheckCircle } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

// Typy danych
type Match = {
  id: number
  game_name: string
  team_a: string
  team_b: string
  odds_a: number
  odds_b: number
  status: string
  start_time: string
  handicap?: string | null
}

type Duel = {
  id: number
  name: string
  matches: Match[]
}

type Selection = {
  matchId: number
  gameName: string
  prediction: 'A' | 'B' // Kogo obstawił?
  teamName: string // Nazwa drużyny dla wyświetlania
  odds: number
}

export default function BettingSystem({ initialDuels, userPoints }: { initialDuels: any[], userPoints: number }) {
  const [coupon, setCoupon] = useState<Selection[]>([])
  const [stake, setStake] = useState<number>(100)
  const [loading, setLoading] = useState(false)

  // --- LOGIKA KUPONU ---
  
  // Dodawanie/Usuwanie typu
  const toggleSelection = (match: Match, prediction: 'A' | 'B') => {
    // 1. Sprawdź czy mecz już jest na kuponie
    const existingIndex = coupon.findIndex(s => s.matchId === match.id)
    
    // Jeśli kliknąłeś to samo -> usuń (odznacz)
    if (existingIndex >= 0 && coupon[existingIndex].prediction === prediction) {
      setCoupon(coupon.filter((_, i) => i !== existingIndex))
      return
    }

    // Jeśli kliknąłeś przeciwny typ w tym samym meczu -> podmień
    const newSelection: Selection = {
      matchId: match.id,
      gameName: match.game_name,
      prediction,
      teamName: prediction === 'A' ? match.team_a : match.team_b,
      odds: prediction === 'A' ? match.odds_a : match.odds_b
    }

    if (existingIndex >= 0) {
      const newCoupon = [...coupon]
      newCoupon[existingIndex] = newSelection
      setCoupon(newCoupon)
    } else {
      setCoupon([...coupon, newSelection])
    }
  }

  // Obliczenia
  const totalOdds = coupon.reduce((acc, curr) => acc * curr.odds, 1)
  const potentialWin = Math.floor(stake * totalOdds)

  // Wysyłanie
  const handlePlaceCoupon = async () => {
    if (stake <= 0) return alert('Za darmo to uczciwa cena, ale nie tutaj.')
    
    setLoading(true)
    const result = await placeCoupon(
      coupon.map(s => ({ matchId: s.matchId, prediction: s.prediction, odds: s.odds })),
      stake
    )
    setLoading(false)

    if (result.error) {
      alert(`BŁĄD: ${result.error}`)
    } else {
      alert(`POSZŁO! ${result.success}`)
      setCoupon([]) // Wyczyść kupon po sukcesie
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* --- LEWA KOLUMNA: OFERTA (MECZE) --- */}
      <div className="lg:col-span-2 space-y-8">
        {initialDuels?.map((duel) => (
          <div key={duel.id} className="space-y-4">
            <div className="flex items-center gap-3 border-l-4 border-green-500 pl-4">
               <h2 className="text-2xl font-bold text-white uppercase">{duel.name}</h2>
            </div>
            
            <div className="grid gap-4">
              {duel.matches?.map((match: Match) => {
                const isSelectedA = coupon.some(s => s.matchId === match.id && s.prediction === 'A')
                const isSelectedB = coupon.some(s => s.matchId === match.id && s.prediction === 'B')

                return (
                  <Card key={match.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition relative overflow-hidden">
                    {match.status === 'LIVE' && <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 font-bold animate-pulse">LIVE</div>}
                    
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      {/* Info o meczu */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                           <Badge variant="outline" className="border-green-900 text-green-500 text-[10px]">{match.game_name}</Badge>
                           <span className="text-zinc-500 text-xs font-mono">{new Date(match.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="font-bold text-white text-lg">
                          {match.team_a} <span className="text-zinc-600 font-normal text-sm">vs</span> {match.team_b}
                        </div>
                        {match.handicap && <div className="text-blue-400 text-xs mt-1">Handicap: {match.handicap}</div>}
                      </div>

                      {/* Kursy (Przyciski) */}
                      {match.status !== 'FINISHED' && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            onClick={() => toggleSelection(match, 'A')}
                            className={`flex-1 md:w-32 h-12 font-bold border transition-all ${isSelectedA 
                              ? 'bg-green-600 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                              : 'bg-black text-white border-zinc-700 hover:bg-zinc-800'}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] opacity-70 mb-1">{match.team_a}</span>
                                <span className="text-lg">{match.odds_a.toFixed(2)}</span>
                            </div>
                          </Button>

                          <Button 
                            onClick={() => toggleSelection(match, 'B')}
                            className={`flex-1 md:w-32 h-12 font-bold border transition-all ${isSelectedB 
                              ? 'bg-green-600 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                              : 'bg-black text-white border-zinc-700 hover:bg-zinc-800'}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] opacity-70 mb-1">{match.team_b}</span>
                                <span className="text-lg">{match.odds_b.toFixed(2)}</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              {!duel.matches?.length && <p className="text-gray-600 italic pl-4">Brak gier w tym pojedynku.</p>}
            </div>
          </div>
        ))}
      </div>

      {/* --- PRAWA KOLUMNA: BET SLIP (KUPON) --- */}
      <div className="lg:col-span-1 lg:sticky lg:top-24">
        <Card className="bg-black border-yellow-600/30 shadow-2xl overflow-hidden">
          <CardHeader className="bg-yellow-600/10 border-b border-yellow-600/20 pb-3">
            <CardTitle className="flex items-center justify-between text-yellow-500">
                <span className="flex items-center gap-2"><Ticket className="w-5 h-5"/> TWÓJ KUPON</span>
                <Badge className="bg-yellow-600 text-black font-bold">{coupon.length}</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4">
            
            {/* Lista typów na kuponie */}
            {coupon.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {coupon.map((sel, idx) => (
                  <div key={idx} className="bg-zinc-900/80 p-3 rounded border border-zinc-800 relative group">
                    <button 
                        onClick={() => setCoupon(coupon.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 text-zinc-600 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-green-500 font-bold mb-1">{sel.gameName}</div>
                    <div className="font-bold text-sm text-white mb-1">
                        Typ: <span className="text-yellow-500">{sel.prediction === 'A' ? '1' : '2'}</span> ({sel.teamName})
                    </div>
                    <div className="text-right text-xs text-gray-400 font-mono">Kurs: {sel.odds.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="py-10 text-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded">
                    <p>Kupon pusty.</p>
                    <p className="text-xs mt-1">Kliknij kursy, by dodać.</p>
                </div>
            )}

            <Separator className="bg-zinc-800" />

            {/* Podsumowanie i Stawka */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Kurs całkowity (AKO):</span>
                    <span className="text-white font-bold">{totalOdds.toFixed(2)}</span>
                </div>
                
                <div className="bg-zinc-900 p-2 rounded border border-zinc-700 flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase font-bold">Stawka:</span>
                    <Input 
                        type="number" 
                        value={stake} 
                        onChange={(e) => setStake(Number(e.target.value))}
                        className="bg-transparent border-none text-right font-mono text-white focus-visible:ring-0 p-0 h-auto"
                    />
                    <Zap className="w-4 h-4 text-green-500" />
                </div>

                <div className="flex justify-between items-center bg-green-900/20 p-3 rounded border border-green-900/50">
                    <span className="text-xs text-green-400 uppercase font-bold">Ewentualna wygrana:</span>
                    <span className="text-xl font-black text-green-400">{potentialWin}</span>
                </div>

                <Button 
                    onClick={handlePlaceCoupon} 
                    disabled={coupon.length === 0 || loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black text-lg h-14 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                >
                    {loading ? 'Wysyłanie...' : 'POSTAW ZAKŁAD'}
                </Button>
                <div className="text-center text-[10px] text-gray-500">
                    Dostępne środki: <span className="text-white">{userPoints}</span> pkt
                </div>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  )
}