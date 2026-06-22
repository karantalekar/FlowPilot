'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authApi, getApiError, saveSession } from '@/lib/api'
import { useAppDispatch } from '@/lib/hooks'
import { setUser } from '@/lib/slices/authSlice'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function AcceptInvitePage() {
  const [token,setToken]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [saving,setSaving]=useState(false); const [error,setError]=useState('')
  const [showPassword,setShowPassword]=useState(false); const [showConfirm,setShowConfirm]=useState(false)
  const router=useRouter(); const dispatch=useAppDispatch()
  useEffect(()=>setToken((new URLSearchParams(window.location.search).get('token')||'').trim()),[])
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');if(password.length<8){setError('Password must be at least 8 characters.');return}if(password!==confirm){setError('Passwords do not match.');return}setSaving(true);try{const payload=(await authApi.acceptInvite(token,password)).data.data;saveSession(payload);dispatch(setUser({...payload.user,id:payload.user.id||payload.user._id||''}));toast.success('Welcome to your workspace');router.replace('/dashboard')}catch(caught){const message=getApiError(caught,'Could not accept invitation');setError(message);toast.error(message)}finally{setSaving(false)}}
  return <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-lg"><div><h1 className="text-2xl font-bold">Accept invitation</h1><p className="text-sm text-muted-foreground">Create your password to join as a Manager or Member.</p></div>{!token?<p className="text-destructive">This invitation link is missing its token. Ask your workspace admin for a new invitation.</p>:<form onSubmit={submit} className="space-y-4"><div className="relative"><input required minLength={8} type={showPassword?'text':'password'} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password (at least 8 characters)" className="w-full rounded-lg border bg-background py-2 pl-4 pr-11"/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">{showPassword?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div><div className="relative"><input required minLength={8} type={showConfirm?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-lg border bg-background py-2 pl-4 pr-11"/><button type="button" onClick={()=>setShowConfirm(value=>!value)} aria-label={showConfirm?'Hide confirmation password':'Show confirmation password'} aria-pressed={showConfirm} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">{showConfirm?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div>{error&&<div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"><p>{error}</p>{error.toLowerCase().includes('expired')&&<p className="mt-2">The link may already have been used. <Link href="/auth/login" className="font-medium underline">Try logging in</Link>, or ask your admin for a new invitation.</p>}</div>}<Button type="submit" className="w-full" disabled={saving}>{saving?'Joining workspace...':'Join workspace'}</Button></form>}</div>
}
