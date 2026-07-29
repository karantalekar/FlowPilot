'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, LoaderCircle, MoreHorizontal, Search, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { platformConsoleApi, platformApiError } from '@/lib/platform/api'

export type Column = { key: string; label: string; render?: (item: Record<string, any>) => React.ReactNode }
export type RowAction = { label: string; tone?: 'danger' | 'success'; run: (item: Record<string, any>) => Promise<void>; when?: (item: Record<string, any>) => boolean }

const valueAt = (item: Record<string, any>, key: string) => key.split('.').reduce((value, part) => value?.[part], item)
export const StatusPill = ({ value }: { value: string }) => {
  const positive = ['active', 'verified', 'paid', 'issued'].includes(value)
  const negative = ['suspended', 'rejected', 'expired', 'canceled', 'unpaid'].includes(value)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${positive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : negative ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}`}>{value?.replaceAll('_', ' ')}</span>
}
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)
export const date = (value?: string) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : '—'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p></div>{action}</div>
}

export function ResourceTable({ resource, columns, statuses = [], actions = [] }: { resource: string; columns: Column[]; statuses?: string[]; actions?: RowAction[] }) {
  const [items, setItems] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [menu, setMenu] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  useEffect(() => { const id = setTimeout(() => { setDebounced(search); setPage(1) }, 350); return () => clearTimeout(id) }, [search])
  useEffect(() => {
    let active = true; setLoading(true)
    platformConsoleApi.list(resource, { page, limit: 10, ...(debounced ? { search: debounced } : {}), ...(status ? { status } : {}) })
      .then(({ data }) => { if (!active) return; setItems(data.data.items || data.data); setPages(data.data.pagination?.pages || 1); setTotal(data.data.pagination?.total || data.data.length) })
      .catch(error => toast.error(platformApiError(error))).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [resource, page, debounced, status, version])
  const run = async (action: RowAction, item: Record<string, any>) => {
    setMenu(null)
    if (action.tone === 'danger' && !window.confirm(`Confirm “${action.label}”? This action will be recorded in the audit log.`)) return
    try { await action.run(item); toast.success(`${action.label} completed`); setVersion(v => v + 1) } catch (error) { toast.error(platformApiError(error)) }
  }
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${resource.replaceAll('-', ' ')}…`} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950" /></label>
      {statuses.length > 0 && <label className="relative"><Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="h-10 min-w-44 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>}
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">{columns.map(c => <th key={c.key} className="px-5 py-3 font-semibold">{c.label}</th>)}{actions.length > 0 && <th className="px-5 py-3 text-right">Actions</th>}</tr></thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={columns.length + 1} className="h-64 text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-indigo-500" /><span className="mt-3 block text-xs text-slate-500">Loading secure platform data…</span></td></tr> : items.length === 0 ? <tr><td colSpan={columns.length + 1} className="h-64 text-center"><ShieldAlert className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-medium">No records found</p><p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters.</p></td></tr> : items.map(item => <tr key={item._id || item.id} className="text-sm hover:bg-slate-50/70 dark:hover:bg-slate-800/40">{columns.map(c => <td key={c.key} className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">{c.render ? c.render(item) : String(valueAt(item, c.key) ?? '—')}</td>)}{actions.length > 0 && <td className="relative px-5 py-4 text-right"><button onClick={() => setMenu(menu === (item._id || item.id) ? null : (item._id || item.id))} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal className="size-4" /></button>{menu === (item._id || item.id) && <div className="absolute right-6 top-12 z-20 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl dark:border-slate-700 dark:bg-slate-800">{actions.filter(a => !a.when || a.when(item)).map(a => <button key={a.label} onClick={() => run(a, item)} className={`block w-full rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ${a.tone === 'danger' ? 'text-rose-600' : a.tone === 'success' ? 'text-emerald-600' : ''}`}>{a.label}</button>)}</div>}</td>}</tr>)}</tbody></table></div>
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-slate-800"><span>{total.toLocaleString()} records</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30 dark:border-slate-700"><ChevronLeft className="size-3.5" /></button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30 dark:border-slate-700"><ChevronRight className="size-3.5" /></button></div></div>
  </section>
}
