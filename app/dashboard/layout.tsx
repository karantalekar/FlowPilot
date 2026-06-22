import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { ProtectedRoute } from '@/components/protected-route'
import { TrialGate } from '@/components/trial-gate'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col lg:ml-64">
        <Navbar />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <TrialGate>{children}</TrialGate>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  )
}
