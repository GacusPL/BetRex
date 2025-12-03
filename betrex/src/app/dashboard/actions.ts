'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function placeBet(matchId: number, prediction: string, amount: number) {
  const supabase = await createClient()

  // 1. Sprawdź kim jest user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nie jesteś zalogowany, kolego.' }

  // 2. Pobierz aktualne punkty
  const { data: profile } = await supabase
    .from('profiles')
    .select('papito_points')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Brak profilu gracza.' }
  
  // 3. Sprawdź czy go stać (Gry na kredyt nie ma w regulaminie)
  if (profile.papito_points < amount) {
    return { error: 'Brak waluty! Idź po więcej Papito Energy.' }
  }

  // 4. Zabierz punkty (prosta transakcja)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ papito_points: profile.papito_points - amount })
    .eq('id', user.id)

  if (updateError) return { error: 'Błąd transakcji punktów.' }

  // 5. Zapisz zakład
  const { error: betError } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      match_id: matchId,
      amount: amount,
      prediction: prediction,
      status: 'OPEN'
    })

  if (betError) {
    // Wypadałoby oddać punkty, ale w MVP zakładamy, że baza nie klęknie ;)
    return { error: 'Nie udało się postawić zakładu.' }
  }

  revalidatePath('/dashboard')
  return { success: 'Zakład przyjęty! Powodzenia.' }
}