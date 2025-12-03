'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cashoutCoupon } from '@/app/dashboard/actions'
import { Ticket, History, RotateCcw } from 'lucide-react'
import { useState } from "react"

export default function UserCouponsList({ coupons }: { coupons: any[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const handleCashout = async (couponId: number) => {
    if (!confirm('Na pewno chcesz zrobić Cashout? Odzyskasz 90% stawki.')) return
    
    setLoadingId(couponId)
    const result = await cashoutCoupon(couponId)
    setLoadingId(null)

    if (result.error) alert(result.error)
    else alert(result.success)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 mt-8">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-gray-400"/> HISTORIA ZAKŁADÓW
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {coupons && coupons.length > 0 ? (
            coupons.map((coupon) => (
                <div key={coupon.id} className="bg-black border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4">
                    
                    {/* LEWA: INFO */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                                coupon.status === 'WON' ? 'bg-green-600' :
                                coupon.status === 'LOST' ? 'bg-red-600' :
                                coupon.status === 'OPEN' ? 'bg-yellow-600 text-black' : 'bg-gray-600'
                            }>
                                {coupon.status === 'CASHOUTED' ? 'WYCOFANY' : coupon.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date(coupon.created_at).toLocaleString()}</span>
                        </div>
                        
                        <div className="text-sm text-gray-300">
                            <ul className="space-y-1">
                                {coupon.coupon_selections?.map((sel: any, idx: number) => (
                                    <li key={idx} className="flex gap-2">
                                        <span className="text-green-500 font-bold">[{sel.prediction}]</span>
                                        <span>{sel.matches?.game_name}</span>
                                        <span className="text-gray-500 text-xs">({sel.matches?.team_a} vs {sel.matches?.team_b})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* PRAWA: FINANSE I CASHOUT */}
                    <div className="flex flex-col items-end justify-center min-w-[120px] gap-2">
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Stawka / Wygrana</div>
                            <div className="font-mono text-white">
                                {coupon.stake} <span className="text-gray-600">/</span> <span className="text-green-400 font-bold">{coupon.potential_win}</span>
                            </div>
                        </div>

                        {coupon.status === 'OPEN' && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 h-8 text-xs"
                                onClick={() => handleCashout(coupon.id)}
                                disabled={loadingId === coupon.id}
                            >
                                <RotateCcw className="w-3 h-3 mr-1"/> 
                                {loadingId === coupon.id ? '...' : `Cashout (${Math.floor(coupon.stake * 0.9)})`}
                            </Button>
                        )}
                    </div>
                </div>
            ))
        ) : (
            <p className="text-center text-gray-500 py-4">Brak kuponów. Postaw coś!</p>
        )}
      </CardContent>
    </Card>
  )
}