'use client'

import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setTheme } from '@/lib/slices/uiSlice'
import { Bell, Search, Moon, Sun, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { visibleRoutes } from '@/lib/permissions'

const searchableDestinations = [
  { label: 'Dashboard', href: '/dashboard', terms: 'overview home metrics' },
  { label: 'CRM', href: '/dashboard/crm', terms: 'leads deals sales' },
  { label: 'Customers', href: '/dashboard/customers', terms: 'contacts clients' },
  { label: 'Projects', href: '/dashboard/projects', terms: 'tasks kanban work' },
  { label: 'AI Assistant', href: '/dashboard/ai', terms: 'chat reports documents' },
  { label: 'Team', href: '/dashboard/team', terms: 'members invite people' },
  { label: 'Analytics', href: '/dashboard/analytics', terms: 'charts performance' },
  { label: 'Notifications', href: '/dashboard/notifications', terms: 'alerts reminders' },
  { label: 'Billing', href: '/dashboard/billing', terms: 'subscription payments plan' },
  { label: 'Settings', href: '/dashboard/settings', terms: 'profile workspace password theme' },
]

export function Navbar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const theme = useAppSelector((state) => state.ui.theme)
  const user = useAppSelector((state) => state.auth.user)
  const themeInitialized = useRef(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const allowedRoutes = visibleRoutes(user?.role)

  const results = searchableDestinations.filter((destination) =>
    allowedRoutes.includes(destination.href) && `${destination.label} ${destination.terms}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )

  const navigate = (href: string) => {
    setCommandOpen(false)
    setQuery('')
    router.push(href)
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const firstResult = results[0]
    if (query.trim() && firstResult) navigate(firstResult.href)
  }

  useEffect(() => {
    if (!themeInitialized.current) {
      themeInitialized.current = true
      const savedTheme = window.localStorage.getItem('flowpilot-theme')

      if ((savedTheme === 'light' || savedTheme === 'dark') && savedTheme !== theme) {
        dispatch(setTheme(savedTheme))
        return
      }
    }

    const htmlElement = document.documentElement
    htmlElement.classList.remove('light', 'dark')
    htmlElement.classList.add(theme)
    htmlElement.style.colorScheme = theme
    window.localStorage.setItem('flowpilot-theme', theme)
  }, [dispatch, theme])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (commandOpen) window.setTimeout(() => searchInput.current?.focus(), 0)
  }, [commandOpen])

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between pl-16 pr-4 lg:px-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <form className="relative" onSubmit={submitSearch}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, leads, tasks..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 ml-4">
          {/* Command Palette */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Command className="h-4 w-4 mr-2" />
            <span className="text-xs">⌘K</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open notifications"
            onClick={() => router.push('/dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {commandOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center bg-black/50 px-4 pt-24"
          onMouseDown={() => setCommandOpen(false)}
        >
          <div
            className="h-fit w-full max-w-lg rounded-xl border bg-background p-3 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Go to a dashboard section..."
                className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mt-2 max-h-80 overflow-y-auto">
              {results.length ? (
                results.map((destination) => (
                  <button
                    key={destination.href}
                    type="button"
                    onClick={() => navigate(destination.href)}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {destination.label}
                  </button>
                ))
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No dashboard section found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
