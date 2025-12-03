import GameWheel from '@/components/game-wheel'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

export default function WheelPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Przycisk powrotu */}
        <div className="absolute top-4 left-4 z-50">
            <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-zinc-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót
            </Button>
            </Link>
        </div>

        {/* Tło Papito */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black pointer-events-none" />

        <div className="relative z-10 w-full">
            <GameWheel />
        </div>
        
        <div className="absolute bottom-4 text-center w-full text-zinc-700 text-xs">
            Powered by BetRex & Papito Energy
        </div>
    </div>
  )
}