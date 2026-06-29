import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <Image src="/favicon.png" alt="FlowPilot logo" width={72} height={72} priority className="h-[72px] w-[72px] object-contain" />
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">FlowPilot</span>
        </Link>
        {children}
      </div>
    </div>
  )
}
