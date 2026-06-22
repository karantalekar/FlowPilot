'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectOverviewChartsProps {
  statuses: Array<{ _id: string; count: number }>
  completionRate: number
}

const tooltipStyle = {
  backgroundColor: 'rgb(var(--color-card) / 1)',
  border: '1px solid rgb(var(--color-border) / 1)',
}

export function ProjectOverviewCharts({ statuses, completionRate }: ProjectOverviewChartsProps) {
  const statusData = statuses.map(status => ({
    name: status._id.replaceAll('_', ' '),
    projects: status.count,
  }))
  const completionData = [
    { name: 'Completed', percentage: completionRate },
    { name: 'Remaining', percentage: Math.max(0, 100 - completionRate) },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Projects by Status</CardTitle><CardDescription>Number of projects in each stage</CardDescription></CardHeader>
        <CardContent>
          {statusData.length ? <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border) / 1)" />
              <XAxis dataKey="name" className="capitalize" stroke="rgb(var(--color-muted-foreground) / 1)" />
              <YAxis allowDecimals={false} stroke="rgb(var(--color-muted-foreground) / 1)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="projects" fill="rgb(var(--color-primary) / 1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <div className="flex h-[300px] items-center justify-center text-muted-foreground">No project data available.</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Project Completion</CardTitle><CardDescription>Completed versus remaining percentage</CardDescription></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border) / 1)" />
              <XAxis dataKey="name" stroke="rgb(var(--color-muted-foreground) / 1)" />
              <YAxis domain={[0, 100]} unit="%" stroke="rgb(var(--color-muted-foreground) / 1)" />
              <Tooltip contentStyle={tooltipStyle} formatter={value => [`${value}%`, 'Percentage']} />
              <Bar dataKey="percentage" fill="rgb(var(--color-accent) / 1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
