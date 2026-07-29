'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity, BarChart3, Bell, Building2, ChevronDown, CreditCard, FileCheck2,
  FileText, LayoutDashboard, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen,
  Receipt, Search, Settings, Sun, UserCircle, Users, WalletCards, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { platformAuthApi, platformSession } from '@/lib/platform/api'

const nav = [
  { label: 'Dashboard', href: '/platform', icon: LayoutDashboard },
  { label: 'Organizations', href: '/platform/organizations', icon: Building2 },
  { label: 'Users', href: '/platform/users', icon: Users },
  { label: 'Plans', href: '/platform/plans', icon: WalletCards },
  { label: 'Subscriptions', href: '/platform/subscriptions', icon: CreditCard },
  { label: 'Payments', href: '/platform/payments', icon: Receipt },
  { label: 'Invoices', href: '/platform/invoices', icon: FileText },
  { label: 'Payment verification', href: '/platform/payment-verification', icon: FileCheck2 },
  { label: 'Reports & analytics', href: '/platform/reports', icon: BarChart3 },
  { label: 'Activity logs', href: '/platform/activity-logs', icon: Activity },
  { label: 'Settings', href: '/platform/settings', icon: Settings },
]

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const admin = platformSession.admin()

  useEffect(() => {
    const saved = localStorage.getItem('platform_theme')
    const enabled = saved === 'dark'
    setDark(enabled)
    document.documentElement.classList.toggle('dark', enabled)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('platform_theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  const logout = async () => {
    try { await platformAuthApi.logout() } catch { /* local revocation still applies */ }
    platformSession.clear()
    toast.success('Platform session ended')
    router.replace('/platform/login')
  }

  return (
    <div className="platform-surface min-h-screen bg-[#f5f7fb] text-slate-950 dark:bg-[#0c111d] dark:text-slate-100">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-[#0f172a] text-white transition-all duration-300 dark:border-slate-800 ${collapsed ? 'w-[76px]' : 'w-[260px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/platform" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
              <Image src="/favicon.png" alt="FlowPilot" width={44} height={44} priority className="size-10 object-contain drop-shadow-md" />
            </span>
            {!collapsed && <span><span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200 bg-clip-text text-base font-bold tracking-tight text-transparent">FlowPilot</span><span className="block text-[9px] font-semibold uppercase tracking-[.22em] text-slate-500">Platform control</span></span>}
          </Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
        </div>
        {!collapsed && <div className="px-5 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Platform</div>}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {nav.map(item => {
            const active = pathname === item.href || (item.href !== '/platform' && pathname.startsWith(item.href))
            const Icon = item.icon
            return <Link title={collapsed ? item.label : undefined} key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${active ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {active && <span className="absolute -left-3 h-5 w-0.5 rounded-r bg-indigo-300" />}
              <Icon className="size-[18px] shrink-0" />{!collapsed && <span>{item.label}</span>}
              {item.label === 'Payment verification' && !collapsed && <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-300">28</span>}
            </Link>
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/platform/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-500 text-xs font-bold">{admin?.name?.split(' ').map(v => v[0]).slice(0,2).join('') || 'PS'}</span>
            {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{admin?.name || 'Platform Owner'}</span><span className="block truncate text-[10px] text-slate-500">{admin?.email || 'owner@flowpilot.app'}</span></span>}
          </Link>
          <button onClick={logout} className={`mt-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? 'justify-center' : ''}`}><LogOut className="size-4" />{!collapsed && 'Sign out'}</button>
        </div>
      </aside>

      <div className={`transition-[margin] duration-300 ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#111827]/90 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:block" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button>
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-indigo-950" placeholder="Search organizations, payments, users..." />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">⌘ K</kbd>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={toggleTheme} className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <button className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900" /></button>
            <span className="mx-2 hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            <Link href="/platform/profile" className="hidden items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><UserCircle className="size-5" /></span>
              <span className="text-left"><span className="block text-xs font-semibold">{admin?.name || 'Platform Owner'}</span><span className="block text-[10px] text-slate-500">Super admin</span></span><ChevronDown className="size-3 text-slate-400" />
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  )
}
