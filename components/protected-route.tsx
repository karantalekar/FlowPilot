'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { authApi, clearSession } from '@/lib/api'
import { clearUser, setUser } from '@/lib/slices/authSlice'
import { canAccessRoute } from '@/lib/permissions'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    const restoreSession = async () => {
      if (isAuthenticated) {
        if (active) setChecking(false)
        return
      }
      if (!localStorage.getItem('auth_token')) {
        router.replace('/auth/login')
        return
      }
      try {
        const response = await authApi.me()
        const apiUser = response.data.data
        dispatch(setUser({ ...apiUser, id: apiUser.id || apiUser._id || '' }))
      } catch {
        clearSession()
        dispatch(clearUser())
        router.replace('/auth/login')
      } finally {
        if (active) setChecking(false)
      }
    }
    restoreSession()
    return () => { active = false }
  }, [dispatch, isAuthenticated, router])

  const isAllowed = canAccessRoute(user?.role, pathname)

  useEffect(() => {
    if (!checking && isAuthenticated && user && !isAllowed) router.replace('/dashboard')
  }, [checking, isAllowed, isAuthenticated, router, user])

  if (checking || !isAuthenticated || !isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">{isAuthenticated ? 'Redirecting to your dashboard...' : 'Redirecting to login...'}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
