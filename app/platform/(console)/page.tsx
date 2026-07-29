'use client'

import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, Building2, CircleDollarSign, Clock3, CreditCard, LoaderCircle, ShieldCheck, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import toast from 'react-hot-toast'
import { PageHeader, money } from '@/components/platform/page-kit'
import { platformConsoleApi, platformApiError } from '@/lib/platform/api'
import type { Overview } from '@/lib/platform/types'
import { revenueData } from '@/lib/platform/data'

const initial: Overview = { totalOrganizations: 0, activeOrganizations: 0, suspendedOrganizations: 0, totalUsers: 0, totalAdmins: 0, totalManagers: 0, totalEmployees: 0, activeSubscriptions: 0, expiredSubscriptions: 0, pendingPayments: 0, verifiedPayments: 0, rejectedPayments: 0, monthlyRevenue: 0, yearlyRevenue: 0 }
export default function PlatformDashboard() {
  const [data, setData] = useState(initial); const [loading, setLoading] = useState(true)
  useEffect(() => { platformConsoleApi.overview().then(r => setData(r.data.data)).catch(e => toast.error(platformApiError(e))).finally(() => setLoading(false)) }, [])
  const cards = [
    ['Organizations', data.totalOrganizations, `${data.activeOrganizations} active`, Building2, 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'],
    ['Platform users', data.totalUsers, `${data.totalAdmins} admins`, Users, 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'],
    ['Active subscriptions', data.activeSubscriptions, `${data.expiredSubscriptions} expired`, CreditCard, 'text-violet-600 bg-violet-50 dark:bg-violet-950/50'],
    ['Pending payments', data.pendingPayments, `${data.verifiedPayments} verified`, Clock3, 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'],
    ['Monthly revenue', money(data.monthlyRevenue), 'Current month', CircleDollarSign, 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'],
    ['Yearly revenue', money(data.yearlyRevenue), 'Current year', Activity, 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50'],
  ] as const
  return <><PageHeader eyebrow="Platform intelligence" title="Executive overview" description="Live operational, subscription and revenue signals across every organization." action={<div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><span className="size-2 animate-pulse rounded-full bg-emerald-500" /> Systems operational</div>} />
    {loading ? <div className="grid h-56 place-items-center"><LoaderCircle className="size-6 animate-spin text-indigo-500" /></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, hint, Icon, tone]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><ArrowUpRight className="size-4 text-slate-300" /></div><p className="mt-5 text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p><p className="mt-2 text-[11px] text-slate-400">{hint}</p></div>)}</div>}
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Revenue trajectory</h2><p className="mt-1 text-xs text-slate-500">Verified revenue, last six months</p></div><span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs dark:bg-slate-800">INR lakhs</span></div><div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData}><defs><linearGradient id="platformRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity=".35" /><stop offset="1" stopColor="#6366f1" stopOpacity=".02" /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b820" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }} /><Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#platformRevenue)" /></AreaChart></ResponsiveContainer></div></section>
      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-indigo-500"><ShieldCheck className="size-5" /></span><div><h2 className="font-semibold">Tenant health</h2><p className="text-xs text-slate-500">Current organization state</p></div></div><div className="mt-8 space-y-5">{[['Active', data.activeOrganizations, 'bg-emerald-400'], ['Suspended', data.suspendedOrganizations, 'bg-rose-400'], ['Other', Math.max(0, data.totalOrganizations - data.activeOrganizations - data.suspendedOrganizations), 'bg-amber-300']].map(([label, value, color]) => <div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">{label}</span><span>{value}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${data.totalOrganizations ? Number(value) / data.totalOrganizations * 100 : 0}%` }} /></div></div>)}</div></section></div>
  </>
}
