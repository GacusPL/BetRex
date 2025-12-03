'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Pomocnicza funkcja do sprawdzania, czy user to Szef
async function isUserAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true
}

export async function createMatch(formData: FormData) {
  try {
    // 1. Sprawdź uprawnienia (Security First)
    if (!await isUserAdmin()) {
      return { error: 'Brak uprawnień. Nie dla psa kiełbasa.' }
    }

    const supabase = await createClient()
    const gameName = formData.get('gameName') as string
    const teamA = formData.get('teamA') as string
    const teamB = formData.get('teamB') as string

    // 2. Walidacja danych (żeby nie wysłać pustych do bazy)
    if (!gameName || !teamA || !teamB) {
      return { error: 'Wypełnij wszystkie pola, Prezesie.' }
    }

    // 3. Zapis do bazy
    const { error } = await supabase.from('matches').insert({
      game_name: gameName,
      team_a: teamA,
      team_b: teamB,
      status: 'PENDING'
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin')
    revalidatePath('/dashboard') // Odśwież też graczom
    return { success: 'Mecz dodany do rozpiski.' }

  } catch (err) {
    console.error('Create Match Error:', err)
    return { error: 'Błąd serwera przy dodawaniu meczu.' }
  }
}

export async function updateMatchStatus(matchId: number, newStatus: string, winner: string | null) {
  try {
    if (!await isUserAdmin()) return { error: 'Brak uprawnień.' }

    const supabase = await createClient()

    // Aktualizacja statusu
    const { error } = await supabase
      .from('matches')
      .update({ 
        status: newStatus, 
        winner: winner 
      })
      .eq('id', matchId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: `Status zmieniony na ${newStatus}` }

  } catch (err) {
    console.error('Update Match Error:', err)
    return { error: 'Nie udało się zaktualizować meczu.' }
  }
}