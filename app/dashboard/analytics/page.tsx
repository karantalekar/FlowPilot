'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { backendApi, getApiError } from '@/lib/api'

const AnalyticsVisuals = dynamic(() => import('@/components/analytics-visuals').then(module => module.AnalyticsVisuals), { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-xl bg-muted"/> })
type View = 'overview' | 'crm' | 'projects'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>()
  const [view, setView] = useState<View>('overview')
  useEffect(() => { Promise.all([backendApi.dashboard(), backendApi.crmAnalytics(), backendApi.projectAnalytics()]).then(([dashboard, crm, projects]) => setData({dashboard: dashboard.data.data, crm: crm.data.data, projects: projects.data.data})).catch(error => toast.error(getApiError(error))) }, [])
  if (!data) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading live analytics...</div>
  const metrics = [
    ['Customers', data.dashboard.customers || 0],
    ['Team members', data.dashboard.users || 0],
    ['Lead conversion', `${data.dashboard.leadConversionRate || 0}%`],
    ['Project completion', `${data.dashboard.projectCompletionRate || 0}%`],
    ['Team productivity', `${data.dashboard.teamProductivity || 0}%`],
    ['Revenue', `$${Math.round((data.dashboard.revenue || 0) / 100).toLocaleString()}`],
  ]
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground">Interactive, real-time business and delivery insights</p></div><div className="flex rounded-lg border bg-muted p-1">{(['overview','crm','projects'] as View[]).map(option => <Button key={option} size="sm" variant={view === option ? 'default' : 'ghost'} onClick={() => setView(option)} className="capitalize">{option}</Button>)}</div></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{metrics.map(([label, value]) => <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>)}</div>
    <AnalyticsVisuals view={view} crm={data.crm} projects={data.projects}/>
  </div>
}
