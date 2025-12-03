import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, ShieldAlert, Coins, Skull } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-green-900/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-green-500">BET<span className="text-white">REX</span></span>
            <Badge variant="outline" className="border-green-600 text-green-400 text-xs hidden sm:block">
              OFFICIAL APP
            </Badge>
          </div>
          <div className="flex gap-4">
             {/* Tu będzie link do logowania */}
            <Link href="/login">
              <Button variant="outline" className="border-green-600 text-green-500 hover:bg-green-900/20 font-bold">
                ZALOGUJ
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-black font-extrabold shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                DOŁĄCZ DO GRY
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Tło ambientowe */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-4 py-1 text-md">
            SPONSOR STRATEGICZNY: PAPITO ENERGY
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            TREX <span className="text-gradient">CUP</span> 2025
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Jedyny taki turniej. Pula nagród: <span className="text-white font-bold">1,00 PLN</span>. 
            Zasady są proste: grasz na charakter albo dostajesz liścia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700 text-black font-bold w-full sm:w-auto shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Flame className="mr-2 h-5 w-5" /> OBSTAWIAJ TERAZ
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white">
              CZYTAJ REGULAMIN
            </Button>
          </div>
        </div>
      </section>

      {/* --- LIVE MATCHES PREVIEW (PLACEHOLDERY) --- */}
      <section className="py-16 bg-zinc-950 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"/> 
              NA ŻYWO / NADCHODZĄCE
            </h2>
            <span className="text-sm text-gray-500">Kursy aktualizowane przez Prezesa</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Karta Meczu 1 */}
            <Card className="bg-black border-zinc-800 hover:border-green-900/50 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-zinc-800 text-gray-300">CS2: WINGMAN</Badge>
                  <span className="text-red-500 text-xs font-bold animate-pulse">LIVE</span>
                </div>
                <CardTitle className="text-center py-4 flex justify-between items-center text-xl">
                  <span>OLIWIER</span>
                  <span className="text-gray-600 text-sm">VS</span>
                  <span>RESZTA ŚWIATA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-green-900/50 hover:bg-green-900/20 hover:text-green-400 h-12 text-lg font-bold">
                    1.45
                  </Button>
                  <Button variant="outline" className="border-red-900/50 hover:bg-red-900/20 hover:text-red-400 h-12 text-lg font-bold">
                    2.80
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Karta Meczu 2 */}
            <Card className="bg-black border-zinc-800 hover:border-green-900/50 transition-all opacity-75 hover:opacity-100">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-zinc-800 text-gray-300">MINECRAFT PVP</Badge>
                  <span className="text-gray-500 text-xs">JUTRO 20:00</span>
                </div>
                <CardTitle className="text-center py-4 flex justify-between items-center text-xl">
                  <span>TEAM PAPITO</span>
                  <span className="text-gray-600 text-sm">VS</span>
                  <span>TEAM BONGOS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button disabled variant="outline" className="border-zinc-800 text-gray-500 h-12 font-bold">
                    1.90
                  </Button>
                  <Button disabled variant="outline" className="border-zinc-800 text-gray-500 h-12 font-bold">
                    1.90
                  </Button>
                </div>
              </CardContent>
            </Card>

             {/* Karta Meczu 3 */}
             <Card className="bg-gradient-to-br from-black to-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-yellow-600 text-black hover:bg-yellow-500">NAGRODA SPECJALNA</Badge>
                <CardTitle className="mt-4 text-lg">Skrzydlak z Organizatorem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Zwycięzca turnieju otrzymuje prawo do wspólnej gry oraz uścisk dłoni Prezesa.
                </p>
                <div className="flex items-center gap-2 text-yellow-500 text-sm font-bold">
                  <Trophy className="w-4 h-4" /> WARTOŚĆ BEZCENNA
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- INFO SECTION --- */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
            <Coins className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Pula Nagród: 1 PLN</h3>
            <p className="text-gray-400 text-sm">
              Słownie: jeden złoty. Plus prestiż na dzielni i szacunek ludzi ulicy.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
            <ShieldAlert className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">System BetRex</h3>
            <p className="text-gray-400 text-sm">
              Bezpieczne obstawianie za punkty Papito. Ochrona przed DDoS i system Anti-Bongo[cite: 88].
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
            <Skull className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Klauzula Liścia</h3>
            <p className="text-gray-400 text-sm">
              Łamiesz zasady? Nie udostępniasz ekranu? Dostajesz liścia na ogarkę[cite: 45]. Proste.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 bg-black">
        <p>&copy; 2025 OliwierBogdańskiZtejStrony Sp. z o.o. | Powered by <span className="text-green-600 font-bold">Sztywny Kod</span></p>
      </footer>
    </main>
  );
}