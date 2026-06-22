'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Clock3, LockKeyhole } from 'lucide-react'
import { backendApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type TrialStatus = {
  plan: 'free' | 'pro' | 'business'
  trialExpired: boolean
  trialDaysRemaining: number | null
  trialEndsAt: string
}

export function TrialGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    backendApi.subscription()
      .then(({ data }) => setStatus(data.data as TrialStatus))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Checking workspace access…</div>

  if (status?.trialExpired && pathname !== '/dashboard/billing') {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12">
        <Card className="w-full border-amber-300/60 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><LockKeyhole className="h-7 w-7" /></div>
            <CardTitle>Your free trial has ended</CardTitle>
            <CardDescription>The seven-day trial is complete. Upgrade the workspace to restore CRM, projects, analytics, AI, and team functionality.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard/billing" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">View upgrade options</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {status?.plan === 'free' && status.trialDaysRemaining !== null && ['/dashboard/notifications', '/dashboard/billing'].includes(pathname) && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-200 md:mx-6 lg:mx-8">
          <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" /><strong>{status.trialDaysRemaining} day{status.trialDaysRemaining === 1 ? '' : 's'}</strong> left in your free trial</span>
          <Link href="/dashboard/billing" className="shrink-0 font-semibold underline-offset-4 hover:underline">Upgrade</Link>
        </div>
      )}
      {children}
    </>
  )
}
