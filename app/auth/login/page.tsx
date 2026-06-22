'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { useAppDispatch } from '@/lib/hooks'
import { setUser, setLoading, setError } from '@/lib/slices/authSlice'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { authApi, getApiError, saveSession } from '@/lib/api'

let googleScriptPromise: Promise<void> | null = null
let googleInitializedClientId = ''
let googlePromptInFlight = false
let googlePromptAttempt = 0
let googleCredentialHandler: ((credential: string) => void) | null = null

function loadGoogleIdentity() {
  if ((window as any).google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    const script = existing || document.createElement('script')
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Could not load Google sign-in')), { once: true })
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.googleIdentity = 'true'
      document.head.appendChild(script)
    }
  }).catch(error => {
    googleScriptPromise = null
    throw error
  })
  return googleScriptPromise
}

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    dispatch(setLoading(true))
    try {
      const response = await authApi.login(data)
      const payload = response.data.data
      const user = { ...payload.user, id: payload.user.id || payload.user._id || '' }
      saveSession(payload)
      dispatch(setUser(user))
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error) {
      const message = getApiError(error, 'Login failed')
      dispatch(setError(message))
      toast.error(message)
    } finally {
      setIsSubmitting(false)
      dispatch(setLoading(false))
    }
  }
  const handleGoogle = async () => {
    const clientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if(!clientId)return toast.error('Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in')
    if (googlePromptInFlight) return

    const attempt = ++googlePromptAttempt
    const finish = () => { if (attempt !== googlePromptAttempt) return; googlePromptInFlight = false; setIsGoogleSubmitting(false) }
    googlePromptInFlight = true
    setIsGoogleSubmitting(true)
    try {
      await loadGoogleIdentity()
      const google=(window as any).google
      googleCredentialHandler=async(credential:string)=>{try{const claims=JSON.parse(atob(credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));const payload=(await authApi.google({email:claims.email,name:claims.name,googleIdToken:credential})).data.data;saveSession(payload);dispatch(setUser({...payload.user,id:payload.user.id||payload.user._id||''}));router.push('/dashboard')}catch(e){toast.error(getApiError(e,'Google sign-in failed'))}finally{finish()}}
      if (googleInitializedClientId !== clientId) {
        google.accounts.id.initialize({client_id:clientId,callback:({credential}:{credential:string})=>googleCredentialHandler?.(credential)})
        googleInitializedClientId = clientId
      }
      google.accounts.id.prompt((notification:any)=>{
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.() || notification.isDismissedMoment?.()) finish()
      })
      window.setTimeout(()=>{ if(googlePromptInFlight) finish() },15000)
    } catch (error) {
      finish()
      toast.error(getApiError(error,'Could not start Google sign-in'))
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome to FlowPilot</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
      <Button type="button" variant="outline" className="w-full" disabled={isGoogleSubmitting} onClick={handleGoogle}>{isGoogleSubmitting?'Opening Google...':'Continue with Google'}</Button>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
        <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:underline block">
          Forgot password?
        </Link>
      </div>
    </div>
  )
}
