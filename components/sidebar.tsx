'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { toggleSidebar } from '@/lib/slices/uiSlice'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  UserPlus,
  Contact,
  BarChart3,
  Bell,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authApi, clearSession } from '@/lib/api'
import { clearUser } from '@/lib/slices/authSlice'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { visibleRoutes } from '@/lib/permissions'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', href: '/dashboard/crm', icon: Users },
  { name: 'Customers', href: '/dashboard/customers', icon: Contact },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Zap },
  { name: 'Team', href: '/dashboard/team', icon: UserPlus },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Platform Admin', href: '/dashboard/admin', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)
  const user = useAppSelector((state) => state.auth.user)
  const allowedRoutes = visibleRoutes(user?.role)

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* Clear the local session even if the API is unavailable. */ }
    clearSession()
    dispatch(clearUser())
    toast.success('Signed out')
    router.replace('/auth/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => dispatch(toggleSidebar())}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border pt-16 lg:pt-0 transition-transform duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/" className="mb-7 mt-3 flex items-center gap-2">
            <Image src="/favicon.png" alt="FlowPilot logo" width={68} height={68} priority className="h-[68px] w-[68px] shrink-0 object-contain" />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">FlowPilot</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5" aria-label="Dashboard navigation">
            {navigation.filter(item => allowedRoutes.includes(item.href)).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/75 hover:translate-x-0.5 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <span className={`absolute inset-y-2 left-0 w-1 rounded-r-full bg-sidebar-primary-foreground transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-sidebar-foreground/75 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring dark:hover:text-red-400">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
    </>
  )
}
