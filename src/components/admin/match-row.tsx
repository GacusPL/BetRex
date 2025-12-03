'use client'

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Ban, Pencil, Save, X, Trash2 } from 'lucide-react'
import { updateMatch, editMatchDetails, deleteMatch } from '@/app/admin/actions' // Import akcji

// Definicja typu (uproszczona)
type Match = {
  id: number
  game_name: string
  team_a: string
  team_b: string
  odds_a: number
  odds_b: number
  handicap?: string | null
  start_time: string
  status: string
  winner: string | null
}

export default function AdminMatchRow({ match }: { match: Match }) {
  const [isEditing, setIsEditing] = useState(false)

  // Formatowanie daty dla inputa datetime-local (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
  }

  // --- TRYB EDYCJI ---
  if (isEditing) {
    return (
      <form 
        action={async (formData) => {
            await editMatchDetails(formData)
            setIsEditing(false) // Wyjdź z edycji po zapisie
        }} 
        className="flex flex-col gap-4 p-4 bg-zinc-900/80 border border-yellow-600/50 rounded animate-in fade-in"
      >
        <input type="hidden" name="matchId" value={match.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input name="gameName" defaultValue={match.game_name} placeholder="Gra" className="bg-black border-zinc-700" required />
            <Input type="datetime-local" name="startTime" defaultValue={formatDateForInput(match.start_time)} className="bg-black border-zinc-700 dark:[color-scheme:dark]" required />
            <Input name="handicap" defaultValue={match.handicap || ''} placeholder="Handicap" className="bg-black border-zinc-700" />
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="w-4 h-4"/></Button>
                <Button type="submit" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"><Save className="w-4 h-4 mr-2"/> Zapisz</Button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center border-t border-zinc-800 pt-4">
            <div className="flex gap-2 items-center">
                <Input name="teamA" defaultValue={match.team_a} className="bg-black border-zinc-700 text-right" required />
                <Input name="oddsA" type="number" step="0.01" defaultValue={match.odds_a} className="w-20 bg-black border-zinc-700 text-green-400 font-mono" required />
            </div>
            <div className="flex gap-2 items-center">
                <Input name="oddsB" type="number" step="0.01" defaultValue={match.odds_b} className="w-20 bg-black border-zinc-700 text-green-400 font-mono" required />
                <Input name="teamB" defaultValue={match.team_b} className="bg-black border-zinc-700" required />
            </div>
        </div>
      </form>
    )
  }

  // --- TRYB PODGLĄDU (ZWYKŁY) ---
  return (
    <div className="flex flex-col xl:flex-row items-center justify-between p-3 bg-black rounded border border-zinc-800 hover:border-zinc-600 transition gap-4 group">
        
        {/* INFO */}
        <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
                <Badge className={match.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-zinc-700'}>{match.status}</Badge>
                <span className="text-xs text-gray-500 font-mono">{new Date(match.start_time).toLocaleString()}</span>
                <span className="text-xs font-bold text-green-500 border border-green-900 px-1 rounded">{match.game_name}</span>
            </div>
            <div className="font-bold text-lg">
                {match.team_a} <span className="text-yellow-500 text-sm">({match.odds_a})</span> 
                <span className="text-zinc-600 mx-2">vs</span> 
                {match.team_b} <span className="text-yellow-500 text-sm">({match.odds_b})</span>
            </div>
            {match.handicap && <div className="text-xs text-blue-400">Handicap: {match.handicap}</div>}
        </div>

        {/* STEROWANIE */}
        <div className="flex flex-wrap gap-2 justify-end w-full xl:w-auto items-center">
            
            {/* Przycisk EDYCJI (Ołówek) - Tylko gdy mecz nie jest zakończony */}
            {match.status !== 'FINISHED' && match.status !== 'CANCELLED' && (
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 text-gray-500 hover:text-yellow-500 hover:bg-yellow-900/20">
                    <Pencil className="w-4 h-4" />
                </Button>
            )}

            {/* Przycisk USUWANIA (Śmietnik) - Tylko dla PENDING */}
            {match.status === 'PENDING' && (
                 <form action={deleteMatch}>
                    <input type="hidden" name="matchId" value={match.id} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                 </form>
            )}

            <div className="w-px h-6 bg-zinc-800 mx-1 hidden xl:block"></div>

            {/* Standardowe przyciski (LIVE, WIN, CANCEL) */}
            {match.status === 'PENDING' && (
                <form action={updateMatch}>
                    <input type="hidden" name="matchId" value={match.id} />
                    <input type="hidden" name="action" value="LIVE" />
                    <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700 font-bold px-4"><Play className="w-3 h-3 mr-2"/> START</Button>
                </form>
            )}
            
            {match.status !== 'FINISHED' && match.status !== 'CANCELLED' && (
                <>
                    <form action={updateMatch}>
                        <input type="hidden" name="matchId" value={match.id} />
                        <input type="hidden" name="action" value="FINISH_A" />
                        <Button size="sm" variant="outline" className="h-8 text-green-500 border-green-900 hover:bg-green-900/20">A</Button>
                    </form>
                    <form action={updateMatch}>
                        <input type="hidden" name="matchId" value={match.id} />
                        <input type="hidden" name="action" value="FINISH_B" />
                        <Button size="sm" variant="outline" className="h-8 text-green-500 border-green-900 hover:bg-green-900/20">B</Button>
                    </form>
                    <form action={updateMatch}>
                        <input type="hidden" name="matchId" value={match.id} />
                        <input type="hidden" name="action" value="CANCEL" />
                        <Button size="sm" variant="ghost" className="h-8 text-gray-500 hover:text-red-500"><Ban className="w-4 h-4"/></Button>
                    </form>
                </>
            )}
            {match.status === 'FINISHED' && (
                <span className="text-sm font-bold text-yellow-500 border border-yellow-900/50 px-3 py-1 rounded bg-yellow-900/10">
                    Wygrał: {match.winner === 'A' ? match.team_a : match.team_b}
                </span>
            )}
        </div>
    </div>
  )
}