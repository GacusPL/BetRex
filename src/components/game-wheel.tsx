'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-roulette-pro/dist/index.css'
import { Button } from "@/components/ui/button"
import { Shuffle, Loader2 } from 'lucide-react'

// --- FIX: DYNAMIC IMPORT ---
// To rozwiązuje problem "Element type is invalid" oraz błędy SSR.
// Kod sprawdza, czy biblioteka eksportuje "Wheel" (named) czy "default".
const Wheel = dynamic(
  () => import('react-roulette-pro').then((mod: any) => mod.Wheel || mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center text-green-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }
)

// Gry z Regulaminu §5
const GAMES = [
  { id: '1', text: 'CS2: Aim Map' },
  { id: '2', text: 'Minecraft PvP' },
  { id: '3', text: "Liar's Bar" },
  { id: '4', text: 'Team Fortress 2' },
  { id: '5', text: 'CS 1.6' },
  { id: '6', text: 'Geometry Dash' },
  { id: '7', text: 'Clash Royale' },
]

export default function GameWheel() {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [winGame, setWinGame] = useState<string | null>(null)

  const handleSpinClick = () => {
    if (mustSpin) return
    const newPrizeNumber = Math.floor(Math.random() * GAMES.length)
    setPrizeNumber(newPrizeNumber)
    setMustSpin(true)
    setWinGame(null)
  }

  const handleStopSpinning = () => {
    setMustSpin(false)
    setWinGame(GAMES[prizeNumber].text)
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl max-w-md mx-auto">
      <h2 className="text-3xl font-black text-yellow-500 mb-6 uppercase tracking-widest text-center">
        Losowanie Gry
      </h2>

      <div className="wheel-container scale-90 sm:scale-100">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={GAMES.map(g => ({ option: g.text, style: { backgroundColor: '#18181b', textColor: 'white' } }))}
          onStopSpinning={handleStopSpinning}
          backgroundColors={['#27272a', '#09090b']}
          textColors={['#ffffff']}
          outerBorderColor="#16a34a"
          outerBorderWidth={5}
          innerRadius={15}
          innerBorderColor="#16a34a"
          innerBorderWidth={2}
          radiusLineColor="#3f3f46"
          radiusLineWidth={2}
          fontSize={14}
        />
      </div>

      <div className="mt-8 text-center space-y-4 w-full">
        {winGame ? (
            <div className="animate-in zoom-in duration-500">
                <p className="text-gray-400 text-sm uppercase">Wylosowano:</p>
                <h3 className="text-4xl font-black text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                    {winGame}
                </h3>
            </div>
        ) : (
            <p className="text-zinc-600 italic h-14 content-center">Zakręć kołem, by poznać przeznaczenie...</p>
        )}

        <Button 
            onClick={handleSpinClick} 
            disabled={mustSpin}
            className="w-full h-14 text-xl font-bold bg-green-600 hover:bg-green-700 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {mustSpin ? 'LOSOWANIE...' : <><Shuffle className="mr-2 w-6 h-6"/> KRĘĆ!</>}
        </Button>
      </div>
    </div>
  )
}