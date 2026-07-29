'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LoaderCircle, ShieldCheck } from 'lucide-react'
import { platformAuthApi, platformSession } from '@/lib/platform/api'

export function PlatformGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    if (!platformSession.access()) {
      router.replace(`/platform/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    platformAuthApi.me().then(({ data }) => {
      if (!active) return
      sessionStorage.setItem('platform_admin', JSON.stringify(data.data))
      setReady(true)
    }).catch(() => {
      platformSession.clear()
      router.replace('/platform/login')
    })
    return () => { active = false }
  }, [pathname, router])

  if (!ready) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white"><div className="text-center"><ShieldCheck className="mx-auto mb-4 size-9 text-indigo-400" /><LoaderCircle className="mx-auto size-5 animate-spin text-slate-400" /><p className="mt-3 text-xs text-slate-500">Verifying platform session</p></div></div>
  return <>{children}</>
}
