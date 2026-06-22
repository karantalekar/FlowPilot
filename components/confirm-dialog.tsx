'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  onOpenChange: (open: boolean) => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onOpenChange }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onOpenChange(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [busy, onOpenChange, open])
  if (!open) return null
  const confirm = async () => { setBusy(true); try { await onConfirm(); onOpenChange(false) } finally { setBusy(false) } }
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" onMouseDown={() => !busy && onOpenChange(false)}><div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl" onMouseDown={event => event.stopPropagation()}><h2 id="confirm-title" className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button><Button variant="destructive" onClick={confirm} disabled={busy}>{busy ? 'Please wait...' : confirmLabel}</Button></div></div></div>
}
