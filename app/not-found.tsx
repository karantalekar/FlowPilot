import Link from 'next/link'

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center p-6"><div className="space-y-4 text-center"><p className="text-sm font-semibold text-primary">404</p><h1 className="text-3xl font-bold">Page not found</h1><p className="text-muted-foreground">The page may have moved or no longer exists.</p><Link href="/" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Return home</Link></div></main>
}
