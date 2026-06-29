'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { authApi, getApiError } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword(email)
      setSubmitted(true)
      toast.success('Check your email for reset instructions')
    } catch (error) {
      toast.error(getApiError(error, 'Failed to send reset email'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
        <p className="text-muted-foreground">
          {submitted
            ? 'Check your email for a password reset link. It expires in 30 minutes.'
            : 'Enter your email address and we&apos;ll send you instructions to reset your password'}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            If an account exists with this email, you&apos;ll receive a password reset link shortly. The link expires in 30 minutes.
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Didn&apos;t receive an email? Check your spam folder or try another email address.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Return to login
            </Button>
          </Link>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
