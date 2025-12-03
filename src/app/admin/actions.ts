'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Pomocnicza: Czy to Szef?
async function isUserAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin === true
}

// 1. TWORZENIE POJEDYNKU (Kontenera)
export async function createDuel(formData: FormData) {
  try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }

    const supabase = await createClient()
    const name = formData.get('name') as string

    if (!name) return { error: 'Podaj nazwę pojedynku.' }

    const { error } = await supabase.from('duels').insert({ name, status: 'ACTIVE' })
    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: 'Pojedynek utworzony.' }
  } catch (err) {
    return { error: 'Błąd przy tworzeniu pojedynku.' }
  }
}

// 2. DODAWANIE MECZU DO POJEDYNKU (Z kursami i datą)
export async function createMatch(formData: FormData) {
  try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }

    const supabase = await createClient()
    
    // Pobieramy dane z formularza
    const duelId = formData.get('duelId')
    const gameName = formData.get('gameName') as string
    const teamA = formData.get('teamA') as string
    const teamB = formData.get('teamB') as string
    const oddsA = parseFloat(formData.get('oddsA') as string)
    const oddsB = parseFloat(formData.get('oddsB') as string)
    const handicap = formData.get('handicap') as string
    const startTime = formData.get('startTime') as string // Format HTML datetime-local

    if (!duelId || !gameName || !teamA || !teamB) return { error: 'Brakuje danych meczu.' }

    const { error } = await supabase.from('matches').insert({
      duel_id: Number(duelId),
      game_name: gameName,
      team_a: teamA,
      team_b: teamB,
      odds_a: oddsA || 1.0,
      odds_b: oddsB || 1.0,
      handicap: handicap || null,
      start_time: startTime || new Date().toISOString(),
      status: 'PENDING'
    })
    
    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: 'Mecz dodany do rozpiski.' }
  } catch (err) {
    console.error(err)
    return { error: 'Błąd przy dodawaniu meczu.' }
  }
}

// 3. STEROWANIE MECZEM (Zmiana statusu / Edycja kursów)
export async function updateMatch(formData: FormData) {
   try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }
    const supabase = await createClient()

    const matchId = formData.get('matchId')
    const action = formData.get('action') as string // 'LIVE', 'FINISH_A', 'FINISH_B', 'UPDATE_ODDS'

    if (action === 'UPDATE_ODDS') {
        const newOddsA = parseFloat(formData.get('oddsA') as string)
        const newOddsB = parseFloat(formData.get('oddsB') as string)
        
        await supabase.from('matches').update({ odds_a: newOddsA, odds_b: newOddsB }).eq('id', Number(matchId))
        revalidatePath('/admin')
        return { success: 'Kursy zaktualizowane.' }
    }

    let status = 'PENDING'
    let winner = null

    if (action === 'LIVE') status = 'LIVE'
    if (action === 'FINISH_A') { status = 'FINISHED'; winner = 'A' }
    if (action === 'FINISH_B') { status = 'FINISHED'; winner = 'B' }
    if (action === 'CANCEL') { status = 'CANCELLED'; winner = null }

    const { error } = await supabase
      .from('matches')
      .update({ status, winner })
      .eq('id', Number(matchId))

    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: `Status zmieniony na ${status}` }
  } catch (err) {
    return { error: 'Błąd aktualizacji meczu.' }
  }
}

// --- 4. ZARZĄDZANIE KUPONAMI (Interwencja Admina) ---
export async function manageCoupon(formData: FormData) {
  try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień. Zostaw to.' }

    const supabase = await createClient()
    const couponId = formData.get('couponId')
    const action = formData.get('action') as string // 'PAY_OUT', 'VOID', 'REJECT'

    if (!couponId) return { error: 'Brak ID kuponu.' }

    // Pobierz dane kuponu
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single()

    if (fetchError || !coupon) return { error: 'Nie znaleziono kuponu.' }

    // LOGIKA INTERWENCJI
    if (action === 'PAY_OUT') {
      // 1. Oznacz jako WYGRANY
      await supabase.from('coupons').update({ status: 'WON' }).eq('id', couponId)
      
      // 2. Przelej hajs użytkownikowi
      // (Pobieramy aktualne punkty i dodajemy wygraną)
      const { data: profile } = await supabase.from('profiles').select('papito_points').eq('id', coupon.user_id).single()
      if (profile) {
        await supabase.from('profiles')
          .update({ papito_points: profile.papito_points + coupon.potential_win })
          .eq('id', coupon.user_id)
      }
      revalidatePath('/admin')
      return { success: `Wypłacono ${coupon.potential_win} REX graczowi.` }
    }

    if (action === 'VOID') {
      // 1. Anuluj (ZWROT STAWKI)
      await supabase.from('coupons').update({ status: 'VOIDED' }).eq('id', couponId)
      
      // 2. Oddaj stawkę
      const { data: profile } = await supabase.from('profiles').select('papito_points').eq('id', coupon.user_id).single()
      if (profile) {
        await supabase.from('profiles')
          .update({ papito_points: profile.papito_points + coupon.stake })
          .eq('id', coupon.user_id)
      }
      revalidatePath('/admin')
      return { success: 'Kupon anulowany. Stawka zwrócona.' }
    }

    if (action === 'REJECT') {
      // Po prostu przegrana (np. za oszustwo / Klauzulę Liścia)
      await supabase.from('coupons').update({ status: 'LOST' }).eq('id', couponId)
      revalidatePath('/admin')
      return { success: 'Kupon oznaczony jako PRZEGRANY.' }
    }

    return { error: 'Nieznana akcja.' }

  } catch (err) {
    console.error(err)
    return { error: 'Błąd operacji na kuponie.' }
  }
}

// --- 5. EDYCJA SZCZEGÓŁÓW MECZU (POPRAWKI) ---
export async function editMatchDetails(formData: FormData) {
  try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }

    const supabase = await createClient()
    const matchId = formData.get('matchId')
    
    // Pobieramy nowe dane
    const gameName = formData.get('gameName') as string
    const teamA = formData.get('teamA') as string
    const teamB = formData.get('teamB') as string
    const oddsA = parseFloat(formData.get('oddsA') as string)
    const oddsB = parseFloat(formData.get('oddsB') as string)
    const handicap = formData.get('handicap') as string
    const startTime = formData.get('startTime') as string

    if (!matchId) return { error: 'Brak ID meczu.' }

    const { error } = await supabase
      .from('matches')
      .update({
        game_name: gameName,
        team_a: teamA,
        team_b: teamB,
        odds_a: oddsA,
        odds_b: oddsB,
        handicap: handicap || null, // Jeśli pusty string to null
        start_time: startTime
      })
      .eq('id', Number(matchId))

    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: 'Dane meczu zaktualizowane.' }
  } catch (err) {
    console.error(err)
    return { error: 'Nie udało się zapisać zmian.' }
  }
}

// --- 6. USUWANIE MECZU (Gdybyś dodał przez pomyłkę) ---
export async function deleteMatch(formData: FormData) {
    try {
        if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }
        const supabase = await createClient()
        const matchId = formData.get('matchId')

        await supabase.from('matches').delete().eq('id', Number(matchId))
        
        revalidatePath('/admin')
        revalidatePath('/dashboard')
        return { success: 'Mecz usunięty z bazy.' }
    } catch (err) {
        return { error: 'Błąd usuwania.' }
    }
}