import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BettingSystem from '@/components/betting-system'
import UserCouponsList from '@/components/user-coupons'
import { Zap, LogOut, Skull } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Sprawdź sesję
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // 2. Pobierz profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Pobierz Pojedynki (Oferta)
  const { data: duels } = await supabase
    .from('duels')
    .select('*, matches(*)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  // 4. Pobierz Kupony
  const { data: myCoupons, error: couponsError } = await supabase
    .from('coupons')
    .select(`
        *,
        coupon_selections (
            prediction,
            matches (
                game_name, 
                team_a, 
                team_b
            )
        )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (couponsError) {
      console.error("❌ BŁĄD POBIERANIA KUPONÓW:", couponsError.message)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tighter text-white hover:opacity-80 transition">
            BET<span className="text-green-500">REX</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-green-500 fill-green-500" />
              <span className="font-bold text-green-400">{profile?.papito_points ?? 0}</span>
              <span className="text-xs text-green-600 font-bold uppercase hidden sm:inline">Rex Coins</span>
            </div>
            
            {profile?.is_admin && (
                <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-red-900 text-red-500 hover:bg-red-900/20">Admin</Button>
                </Link>
            )}

            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-white hover:bg-red-900/20">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 pb-20">
        <header className="mb-8">
            <h1 className="text-3xl font-bold mb-1 text-white">Witaj, <span className="text-green-500">{profile?.username || 'Graczu'}</span></h1>
            <p className="text-gray-400 text-sm">Złóż kupon, zanim kursy spadną.</p>
        </header>

        {/* SYSTEM BUKMACHERSKI */}
        <BettingSystem 
            initialDuels={duels || []} 
            userPoints={profile?.papito_points || 0} 
        />

        {/* HISTORIA KUPONÓW */}
        <UserCouponsList coupons={myCoupons || []} />

        {/* OSTRZEŻENIE NA DOLE */}
        <div className="mt-12 text-center border-t border-zinc-800 pt-8">
            <p className="text-xs text-zinc-600 flex items-center justify-center gap-2">
                <Skull className="w-4 h-4 text-red-900"/>
                Pamiętaj: Próby oszustwa zakończą się banem i liściem na ogarkę.
            </p>
        </div>

      </main>
    </div>
  )
}