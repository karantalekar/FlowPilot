'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authApi, getApiError } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage(){
 const[token,setToken]=useState('');const[password,setPassword]=useState('');const[done,setDone]=useState(false)
 useEffect(()=>setToken(new URLSearchParams(window.location.search).get('token')||''),[])
 const submit=async(e:FormEvent)=>{e.preventDefault();try{await authApi.resetPassword(token,password);setDone(true);toast.success('Password reset')}catch(error){toast.error(getApiError(error))}}
 return <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-lg"><h1 className="text-2xl font-bold">Reset password</h1>{done?<Link href="/auth/login"><Button className="w-full">Continue to login</Button></Link>:<form onSubmit={submit} className="space-y-4"><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border bg-background px-4 py-2"/><Button type="submit" className="w-full" disabled={!token}>Set new password</Button></form>}</div>
}
