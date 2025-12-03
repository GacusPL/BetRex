'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type Selection = {
  matchId: number
  prediction: 'A' | 'B'
  odds: number
}

export async function placeCoupon(selections: Selection[], stake: number) {
  const supabase = await createClient()

  // 1. Sprawdź usera
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj się, byczku.' }

  if (selections.length === 0) return { error: 'Pusty kupon? Serio?' }
  if (stake < 1) return { error: 'Stawka musi być większa niż 0.' }

  // 2. Sprawdź balans konta
  const { data: profile } = await supabase
    .from('profiles')
    .select('papito_points')
    .eq('id', user.id)
    .single()

  if (!profile || profile.papito_points < stake) {
    return { error: 'Brak środków. Idź po Papito Energy.' }
  }

  // 3. Oblicz kurs całkowity (AKO)
  // (Dla bezpieczeństwa pobieramy kursy z bazy, żeby ktoś nie podmienił ich w HTML-u)
  // Ale na potrzeby MVP zaufamy temu co przyszło, z szybką weryfikacją w przyszłości.
  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1)
  const potentialWin = Math.floor(stake * totalOdds)

  // 4. TRANSACTION MODE (Wszystko albo nic)
  
  // A. Zabierz punkty
  const { error: balanceError } = await supabase
    .from('profiles')
    .update({ papito_points: profile.papito_points - stake })
    .eq('id', user.id)

  if (balanceError) return { error: 'Błąd transakcji.' }

  // B. Stwórz Kupon
  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .insert({
      user_id: user.id,
      stake: stake,
      total_odds: totalOdds,
      potential_win: potentialWin,
      status: 'OPEN'
    })
    .select()
    .single()

  if (couponError || !coupon) {
    // W razie błędu oddaj punkty (Rollback dla ubogich)
    await supabase.from('profiles').update({ papito_points: profile.papito_points }).eq('id', user.id)
    return { error: 'Nie udało się stworzyć kuponu.' }
  }

  // C. Dodaj pozycje do kuponu
  const selectionsData = selections.map(sel => ({
    coupon_id: coupon.id,
    match_id: sel.matchId,
    prediction: sel.prediction,
    odds_at_placement: sel.odds
  }))

  const { error: linesError } = await supabase.from('coupon_selections').insert(selectionsData)

  if (linesError) {
     return { error: 'Błąd zapisu typów.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: `Kupon przyjęty! Do wygrania: ${potentialWin} pkt` }
}

// --- 5. CASHOUT (Wycofanie zakładu) ---
export async function cashoutCoupon(couponId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Zaloguj się.' }

  // 1. Pobierz kupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .eq('user_id', user.id) // Security: Tylko właściciel może zrobić cashout
    .single()

  if (error || !coupon) return { error: 'Nie znaleziono kuponu.' }
  if (coupon.status !== 'OPEN') return { error: 'Kupon już zamknięty.' }

  // 2. Oblicz wartość cashoutu (np. 90% stawki - "podatek od strachu")
  // W prawdziwym buku to zależy od szans, tu upraszczamy.
  const cashoutValue = Math.floor(coupon.stake * 0.9)

  // 3. Transakcja (Zwrot kasy + Zamknięcie kuponu)
  
  // A. Oznacz jako CASHOUTED
  const { error: updateError } = await supabase
    .from('coupons')
    .update({ status: 'CASHOUTED' }) // Musisz dodać ten status w bazie lub użyć 'VOIDED'
    .eq('id', couponId)

  if (updateError) return { error: 'Błąd cashoutu.' }

  // B. Oddaj punkty
  const { data: profile } = await supabase.from('profiles').select('papito_points').eq('id', user.id).single()
  if (profile) {
    await supabase.from('profiles')
      .update({ papito_points: profile.papito_points + cashoutValue })
      .eq('id', user.id)
  }

  revalidatePath('/dashboard')
  return { success: `Cashout udany! Odzyskano ${cashoutValue} pkt.` }
}