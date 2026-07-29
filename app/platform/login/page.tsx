'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { platformAuthApi, platformApiError, platformSession } from '@/lib/platform/api'

function PlatformLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (platformSession.access()) router.replace('/platform') }, [router])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await platformAuthApi.login({ email, password })
      platformSession.save(data.data)
      const next = params.get('next')
      router.replace(next?.startsWith('/platform') && next !== '/platform/login' ? next : '/platform')
    } catch (e) { setError(platformApiError(e)) } finally { setLoading(false) }
  }
  return <main className="relative grid min-h-screen overflow-hidden bg-[#070b14] text-white lg:grid-cols-[1.05fr_.95fr]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(79,70,229,.25),transparent_30rem),radial-gradient(circle_at_90%_82%,rgba(124,58,237,.16),transparent_32rem)]" />
    <section className="relative hidden flex-col justify-between border-r border-white/10 p-12 lg:flex xl:p-20">
      <div className="flex items-center gap-3"><span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/30"><Image src="/favicon.png" alt="FlowPilot" width={56} height={56} priority className="size-13 object-contain drop-shadow-lg" /></span><div><p className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200 bg-clip-text text-xl font-bold tracking-tight text-transparent">FlowPilot</p><p className="text-[9px] font-semibold uppercase tracking-[.24em] text-slate-500">Platform control</p></div></div>
      <div className="max-w-xl"><p className="mb-5 text-xs font-semibold uppercase tracking-[.2em] text-indigo-400">Restricted system</p><h1 className="text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">The control plane for your entire SaaS.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Manage tenants, subscriptions, revenue, billing and platform policy from one isolated, audited console.</p></div>
      <div className="flex items-center gap-3 text-xs text-slate-500"><LockKeyhole className="size-4" /> Every access attempt is rate-limited and audited.</div>
    </section>
    <section className="relative grid place-items-center p-6"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.055] p-7 shadow-2xl backdrop-blur-xl sm:p-10">
      <span className="mb-8 grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-xl lg:hidden"><Image src="/favicon.png" alt="FlowPilot" width={64} height={64} priority className="size-14 object-contain" /></span>
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-400">Platform owner</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h2><p className="mt-2 text-sm text-slate-400">Use your separate platform credentials to continue.</p>
      {error && <div role="alert" className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
      <label className="mt-7 block text-xs font-medium text-slate-300">Email address<input required autoComplete="username" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15" placeholder="owner@company.com" /></label>
      <label className="mt-5 block text-xs font-medium text-slate-300">Password<span className="relative mt-2 block"><input required minLength={12} autoComplete="current-password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15" placeholder="••••••••••••" /><button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
      <button disabled={loading} className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-500 text-sm font-semibold shadow-lg shadow-indigo-950 transition hover:bg-indigo-400 disabled:opacity-60">{loading ? <LoaderCircle className="size-5 animate-spin" /> : 'Access platform console'}</button>
      <p className="mt-6 text-center text-[11px] leading-5 text-slate-600">This console is isolated from organization accounts.<br />Unauthorized access is prohibited.</p>
    </form></section>
  </main>
}

export default function PlatformLoginPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#070b14] text-indigo-400"><LoaderCircle className="size-6 animate-spin" /></div>}><PlatformLoginForm /></Suspense>
}
