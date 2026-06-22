'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, FolderKanban, BarChart3, Shield, Sparkles, CheckCircle2, Moon, Sun } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setTheme } from '@/lib/slices/uiSlice'

const features = [
  {
    icon: Users,
    title: 'CRM Management',
    description: 'Track leads, manage pipelines, and close more deals with intelligent customer insights.',
    color: 'from-purple-200 to-blue-200',
  },
  {
    icon: FolderKanban,
    title: 'Project Management',
    description: 'Organize tasks, collaborate with your team, and deliver projects on time.',
    color: 'from-green-200 to-emerald-200',
  },
  {
    icon: Zap,
    title: 'AI Assistant',
    description: 'Get intelligent recommendations and automate repetitive business tasks.',
    color: 'from-pink-200 to-orange-200',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Gain actionable insights into your business performance with real-time analytics.',
    color: 'from-blue-200 to-cyan-200',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Keep your entire team aligned with integrated communication tools.',
    color: 'from-purple-200 to-pink-200',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security to protect your business-critical data.',
    color: 'from-slate-200 to-gray-200',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const floatingVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export function LandingPage() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)
  const themeInitialized = useRef(false)

  useEffect(() => {
    if (!themeInitialized.current) {
      themeInitialized.current = true
      const savedTheme = window.localStorage.getItem('flowpilot-theme')
      const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : preferredTheme

      if (initialTheme !== theme) {
        dispatch(setTheme(initialTheme))
        return
      }
    }

    const htmlElement = document.documentElement
    htmlElement.classList.remove('light', 'dark')
    htmlElement.classList.add(theme)
    htmlElement.style.colorScheme = theme
    window.localStorage.setItem('flowpilot-theme', theme)
  }, [dispatch, theme])

  const toggleTheme = () => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))

  return (
    <div className="landing-shell min-h-screen [--background:#f7f5ff] [--foreground:#0f172a] [--primary:#6d28d9] [--primary-foreground:#ffffff] [--accent:#c2410c] [--accent-foreground:#ffffff] [--secondary:#047857] [--secondary-foreground:#ffffff]">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 50, 0],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -50, 0],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-40 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 50, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-40 border-b border-violet-200/80 bg-white/90 text-slate-950 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:text-white"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
            <Image src="/favicon.png" alt="FlowPilot logo" width={56} height={56} priority className="h-14 w-14 shrink-0 object-contain" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FlowPilot</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <motion.a
              href="#features"
              className="font-medium text-slate-800 hover:text-violet-700 transition dark:text-slate-200 dark:hover:text-violet-300"
              whileHover={{ y: -2 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#pricing"
              className="font-medium text-slate-800 hover:text-violet-700 transition dark:text-slate-200 dark:hover:text-violet-300"
              whileHover={{ y: -2 }}
            >
              Pricing
            </motion.a>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link href="/auth/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-violet-50 hover:text-violet-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:hover:text-violet-300">Sign in</Button>
              </motion.div>
            </Link>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button>Get Started</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <motion.div className="text-center space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div
            className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> New: AI-powered insights
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground text-balance leading-tight">
              Manage Your Business with{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                FlowPilot
              </span>
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            All-in-one platform for CRM, project management, and team collaboration. Grow your business faster with intelligent automation.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-4 flex-wrap">
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent text-foreground hover:shadow-lg transition-shadow">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="glass">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating Dashboard Preview */}
        <motion.div
          className="relative mt-16 md:mt-20"
          variants={floatingVariants}
          initial="hidden"
          animate={['visible', 'float']}
        >
          <div className="relative mx-auto max-w-5xl px-2 [perspective:1400px] sm:px-8">
            <div className="absolute inset-x-16 bottom-0 top-10 rounded-[3rem] bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 blur-3xl" />

            {/* Floating context cards make the dashboard feel dimensional. */}
            <motion.div
              className="absolute -left-1 top-14 z-20 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3"
              animate={{ y: [0, -8, 0], rotate: [-2, 0, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700"><CheckCircle2 className="h-5 w-5" /></span>
              <span className="pr-2 text-left"><span className="block text-xs text-slate-500">Task completed</span><span className="block text-sm font-semibold text-slate-900">Website launch</span></span>
            </motion.div>

            <motion.div
              className="absolute -right-1 bottom-16 z-20 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3"
              animate={{ y: [0, 9, 0], rotate: [2, 0, 2] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><Zap className="h-5 w-5" /></span>
              <span className="pr-2 text-left"><span className="block text-xs text-slate-500">AI assistant</span><span className="block text-sm font-semibold text-slate-900">3 insights ready</span></span>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-2 shadow-[0_35px_80px_-25px_rgba(76,29,149,0.4)] [transform-style:preserve-3d]"
              initial={{ opacity: 0, rotateX: 10, rotateY: -8, y: 35 }}
              animate={{ opacity: 1, rotateX: [4, 2, 4], rotateY: [-5, -2, -5], y: [0, -6, 0] }}
              transition={{ opacity: { duration: 0.7 }, rotateX: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.015, transition: { duration: 0.35 } }}
            >
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-3 rounded-md bg-white px-3 py-1 text-[10px] font-medium text-slate-400 shadow-sm">app.flowpilot.io/dashboard</span>
              </div>

              <div className="grid min-h-72 grid-cols-[54px_1fr] bg-slate-50/80 sm:grid-cols-[150px_1fr]">
                <div className="border-r border-slate-200 bg-white p-3">
                  <div className="mb-5 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">F</span><span className="hidden sm:inline">FlowPilot</span></div>
                  <div className="space-y-2">
                    {[BarChart3, Users, FolderKanban, Zap].map((Icon, index) => (
                      <div key={index} className={`flex items-center gap-2 rounded-lg p-2 text-[11px] font-medium ${index === 0 ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>
                        <Icon className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">{['Overview', 'Customers', 'Projects', 'AI Assistant'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 p-4 text-left sm:p-5">
                  <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-medium text-slate-400">MONDAY, 16 JUNE</p><h3 className="text-base font-bold text-slate-900 sm:text-lg">Business overview</h3></div><div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 ring-2 ring-white" /></div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      ['Revenue', '$48.2K', '+12.5%'],
                      ['New leads', '128', '+8.2%'],
                      ['Projects', '24', '6 active'],
                    ].map(([label, value, change], index) => (
                      <motion.div key={label} className={`${index === 2 ? 'hidden sm:block' : ''} rounded-xl border border-slate-200 bg-white p-3 shadow-sm`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + index * 0.12 }}>
                        <p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p><p className="text-[9px] font-semibold text-green-600">{change}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-slate-800">Performance</p><p className="text-[9px] text-slate-400">This week</p></div>
                      <div className="mt-4 flex h-20 items-end gap-1.5">
                        {[35, 52, 44, 68, 60, 82, 94].map((height, index) => <motion.div key={index} className="flex-1 rounded-t bg-gradient-to-t from-purple-600 to-purple-300" initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 0.65 + index * 0.07, duration: 0.55, ease: 'easeOut' }} />)}
                      </div>
                    </div>
                    <div className="hidden rounded-xl bg-slate-900 p-3 text-white shadow-sm sm:block">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300"><Sparkles className="h-4 w-4" /></span>
                      <p className="mt-3 text-[11px] font-semibold">Smart insight</p><p className="mt-1 text-[9px] leading-4 text-slate-300">Your conversion rate is up 18% this week.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Powerful Features</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Everything you need to run your business efficiently
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`p-6 rounded-2xl border border-border hover:border-primary/40 bg-gradient-to-br ${feature.color} to-white/40 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl p-12 md:p-16 text-center space-y-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to get started?</h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Join thousands of businesses using FlowPilot to streamline their operations and drive growth.
            </p>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="gap-2 bg-white text-foreground hover:bg-white/90">
                  Start Your Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer-gradient mt-20 border-t border-violet-200 text-slate-950 shadow-[0_-12px_40px_rgba(109,40,217,0.08)] dark:border-slate-800 dark:text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/favicon.png" alt="FlowPilot logo" width={80} height={80} className="h-20 w-20 object-contain" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">FlowPilot</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">&copy; 2024 FlowPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
