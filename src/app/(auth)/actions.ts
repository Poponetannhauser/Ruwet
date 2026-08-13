'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email) {
    return redirect('/login?error=Email%20harus%20diisi')
  }

  const rateLimit = checkRateLimit(`login:${email.toLowerCase().trim()}`, { maxRequests: 5, intervalMs: 60000 })
  if (!rateLimit.success) {
    return redirect('/login?error=Terlalu%20banyak%20percobaan%20login.%20Harap%20tunggu%201%20menit.')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email) {
    return redirect('/signup?error=Email%20harus%20diisi')
  }

  const rateLimit = checkRateLimit(`signup:${email.toLowerCase().trim()}`, { maxRequests: 3, intervalMs: 60000 })
  if (!rateLimit.success) {
    return redirect('/signup?error=Terlalu%20banyak%20percobaan%20pendaftaran.%20Harap%20tunggu%201%20menit.')
  }

  const { headers } = await import('next/headers')
  const headerList = await headers()
  const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Cek email Anda untuk verifikasi pendaftaran')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
