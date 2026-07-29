'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock, FolderKanban, TrendingUp, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { backendApi, getApiError } from '@/lib/api'
import { useAppSelector } from '@/lib/hooks'

const DashboardCharts = dynamic(
  () => import('@/components/dashboard-charts').then(module => module.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map(index => <div key={index} className="h-[390px] animate-pulse rounded-xl bg-muted" />)}
      </div>
    ),
  },
)

const ProjectOverviewCharts = dynamic(
  () => import('@/components/project-overview-charts').then(module => module.ProjectOverviewCharts),
  {
    ssr: false,
    loading: () => <div className="h-[390px] animate-pulse rounded-xl bg-muted" />,
  },
)

export default function DashboardPage() {
  const role = useAppSelector(state => state.auth.user?.role)
  const [analytics, setAnalytics] = useState<Record<string, number>>({})
  const [projectStatuses, setProjectStatuses] = useState<Array<{ _id: string; count: number }>>([])
  const [dashboardChartData, setDashboardChartData] = useState<{ leadsByMonth: Array<{ _id: string; count: number }>; customersByMonth: Array<{ _id: string; count: number }>; projectsByMonth: Array<{ _id: string; count: number }>; tasksByMonth: Array<{ _id: string; count: number }> }>({ leadsByMonth: [], customersByMonth: [], projectsByMonth: [], tasksByMonth: [] })
  const limitedDashboard = role === 'employee' || role === 'manager'

  useEffect(() => {
    const controller = new AbortController()
    const request = limitedDashboard
      ? Promise.all([backendApi.dashboard({ signal: controller.signal }), backendApi.projectAnalytics()])
          .then(([dashboard, projects]) => {
            setAnalytics(dashboard.data.data)
            setProjectStatuses(projects.data.data.byStatus)
          })
      : Promise.all([backendApi.dashboard({ signal: controller.signal }), backendApi.crmAnalytics(), backendApi.projectAnalytics()]).then(([dashboard, crm, projects]) => {
          setAnalytics(dashboard.data.data)
          setProjectStatuses(projects.data.data.byStatus)
          setDashboardChartData({ leadsByMonth: crm.data.data.leadsByMonth, customersByMonth: crm.data.data.customersByMonth, projectsByMonth: projects.data.data.projectsByMonth, tasksByMonth: projects.data.data.tasksByMonth })
        })
    request
      .catch(error => {
        if (error?.code !== 'ERR_CANCELED') toast.error(getApiError(error, 'Could not load analytics'))
      })
    return () => controller.abort()
  }, [limitedDashboard])

  const metrics = [
    { icon: Users, label: 'Customers', value: analytics.customers || 0, prefix: '', suffix: '' },
    { icon: FolderKanban, label: 'Project Completion', value: analytics.projectCompletionRate || 0, prefix: '', suffix: '%' },
    { icon: TrendingUp, label: 'Revenue', value: Math.round((analytics.revenue || 0) / 100), prefix: '$', suffix: '' },
    { icon: Clock, label: 'Team Productivity', value: analytics.teamProductivity || 0, prefix: '', suffix: '%' },
  ]

  if (limitedDashboard) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-1 text-muted-foreground">Your project overview</p></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Project Completion</CardTitle><CardDescription>Completed projects across your workspace</CardDescription></CardHeader>
            <CardContent><p className="text-5xl font-bold text-primary">{analytics.projectCompletionRate || 0}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Project Status</CardTitle><CardDescription>Current projects by stage</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {projectStatuses.length ? projectStatuses.map(status => <div key={status._id} className="flex items-center justify-between rounded-lg bg-muted p-3"><span className="capitalize">{status._id.replaceAll('_', ' ')}</span><strong>{status.count}</strong></div>) : <p className="text-muted-foreground">No projects yet.</p>}
            </CardContent>
          </Card>
        </div>
        <ProjectOverviewCharts statuses={projectStatuses} completionRate={analytics.projectCompletionRate || 0} />
        <Link href="/dashboard/projects" className={buttonVariants()}>View Projects</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s your business overview</p>
        </div>
        <Link href="/dashboard/projects" className={buttonVariants()}>New Project</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.prefix}{metric.value.toLocaleString()}{metric.suffix}</div>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">Live workspace metric</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DashboardCharts monthly={dashboardChartData} projectStatuses={projectStatuses} />
    </div>
  )
}
