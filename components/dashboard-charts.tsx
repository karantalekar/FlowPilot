'use client'

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Count = { _id: string; count: number }
interface Props { monthly: { leadsByMonth: Count[]; customersByMonth: Count[]; projectsByMonth: Count[]; tasksByMonth: Count[] }; projectStatuses: Count[] }
const tooltipStyle = { backgroundColor: 'rgb(var(--color-card) / 1)', border: '1px solid rgb(var(--color-border) / 1)' }

function months() {
  return Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (5 - index)); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; return { key, month: date.toLocaleString('en', { month: 'short' }) } })
}
const value = (items: Count[], key: string) => items.find(item => item._id === key)?.count || 0

export function DashboardCharts({ monthly, projectStatuses }: Props) {
  const trend = months().map(({ key, month }) => ({ month, leads: value(monthly.leadsByMonth, key), customers: value(monthly.customersByMonth, key), projects: value(monthly.projectsByMonth, key), tasks: value(monthly.tasksByMonth, key) }))
  const statuses = projectStatuses.map(item => ({ status: item._id.replaceAll('_', ' '), projects: item.count }))
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>Business Activity</CardTitle><CardDescription>Real records created over the last six months</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis allowDecimals={false}/><Tooltip contentStyle={tooltipStyle}/><Legend/><Line type="monotone" dataKey="leads" stroke="#7c3aed" strokeWidth={2}/><Line type="monotone" dataKey="customers" stroke="#ea580c" strokeWidth={2}/><Line type="monotone" dataKey="projects" stroke="#059669" strokeWidth={2}/><Line type="monotone" dataKey="tasks" stroke="#2563eb" strokeWidth={2}/></LineChart></ResponsiveContainer></CardContent></Card>
    <Card><CardHeader><CardTitle>Projects by Status</CardTitle><CardDescription>Current live project distribution</CardDescription></CardHeader><CardContent>{statuses.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={statuses}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="status"/><YAxis allowDecimals={false}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="projects" fill="#7c3aed" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer> : <div className="flex h-[300px] items-center justify-center text-muted-foreground">No project data yet.</div>}</CardContent></Card>
  </div>
}
