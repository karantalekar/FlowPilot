'use client'

import { use, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Column, date, money, PageHeader, ResourceTable, RowAction, StatusPill } from '@/components/platform/page-kit'
import { platformConsoleApi, platformApiError, platformSession } from '@/lib/platform/api'

const primary = (value: string, secondary?: string) => <div><p className="font-semibold text-slate-900 dark:text-white">{value}</p>{secondary && <p className="mt-0.5 text-[11px] text-slate-400">{secondary}</p>}</div>
type Config = { title: string; description: string; resource: string; statuses?: string[]; columns: Column[] }
const configs: Record<string, Config> = {
  organizations: { title: 'Organizations', description: 'Manage every tenant, its lifecycle, owner and subscription access.', resource: 'organizations', statuses: ['active', 'suspended'], columns: [
    { key: 'name', label: 'Organization', render: i => primary(i.name, i.slug) }, { key: 'owner.email', label: 'Owner' }, { key: 'plan', label: 'Plan', render: i => <span className="capitalize">{i.plan}</span> }, { key: 'usage.users', label: 'Users' }, { key: 'subscriptionStatus', label: 'Subscription', render: i => <StatusPill value={i.subscriptionStatus} /> }, { key: 'platformStatus', label: 'Platform status', render: i => <StatusPill value={i.platformStatus} /> }, { key: 'createdAt', label: 'Created', render: i => date(i.createdAt) },
  ] },
  users: { title: 'Users', description: 'Search all tenant identities while preserving organization boundaries.', resource: 'users', columns: [
    { key: 'name', label: 'User', render: i => primary(i.name, i.email) }, { key: 'organization.name', label: 'Organization' }, { key: 'role', label: 'Role', render: i => <span className="capitalize">{i.role}</span> }, { key: 'provider', label: 'Provider' }, { key: 'isEmailVerified', label: 'Verification', render: i => <StatusPill value={i.isEmailVerified ? 'verified' : 'pending'} /> }, { key: 'lastLoginAt', label: 'Last login', render: i => date(i.lastLoginAt) },
  ] },
  plans: { title: 'Plans', description: 'Configure product packaging, billing cycles, trials and feature entitlements.', resource: 'plans', statuses: ['active', 'inactive'], columns: [
    { key: 'name', label: 'Plan', render: i => primary(i.name, i.code) }, { key: 'pricing.monthly', label: 'Monthly', render: i => money(i.pricing?.monthly) }, { key: 'pricing.yearly', label: 'Yearly', render: i => money(i.pricing?.yearly) }, { key: 'trialDays', label: 'Trial' , render: i => `${i.trialDays || 0} days` }, { key: 'features', label: 'Features', render: i => `${i.features?.filter((f: any) => f.enabled).length || 0} enabled` }, { key: 'status', label: 'Status', render: i => <StatusPill value={i.status} /> },
  ] },
  subscriptions: { title: 'Subscriptions', description: 'Control renewals, expiry, plan changes and subscription lifecycle.', resource: 'subscriptions', statuses: ['trialing', 'active', 'expired', 'suspended', 'canceled'], columns: [
    { key: 'organization.name', label: 'Organization', render: i => primary(i.organization?.name || 'Unknown', i.organization?.slug) }, { key: 'plan.name', label: 'Plan' }, { key: 'billingCycle', label: 'Billing cycle', render: i => <span className="capitalize">{i.billingCycle}</span> }, { key: 'status', label: 'Status', render: i => <StatusPill value={i.status} /> }, { key: 'startsAt', label: 'Started', render: i => date(i.startsAt) }, { key: 'expiresAt', label: 'Expires', render: i => date(i.expiresAt) },
  ] },
  payments: { title: 'Payments', description: 'Review transactions, payment proof and verification status.', resource: 'payments', statuses: ['pending', 'verified', 'rejected'], columns: [
    { key: 'transactionId', label: 'Transaction', render: i => primary(i.transactionId, i.method) }, { key: 'organization.name', label: 'Organization' }, { key: 'amount', label: 'Amount', render: i => money(i.amount) }, { key: 'status', label: 'Status', render: i => <StatusPill value={i.status} /> }, { key: 'createdAt', label: 'Submitted', render: i => date(i.createdAt) }, { key: 'verifiedAt', label: 'Reviewed', render: i => date(i.verifiedAt) },
  ] },
  'payment-verification': { title: 'Payment verification', description: 'Focused review queue for uploaded payment proof and UTR details.', resource: 'payments', statuses: ['pending'], columns: [
    { key: 'transactionId', label: 'UTR / Transaction ID', render: i => primary(i.transactionId, i.proof?.originalName || 'No proof attached') }, { key: 'organization.name', label: 'Organization' }, { key: 'amount', label: 'Amount', render: i => money(i.amount) }, { key: 'method', label: 'Method' }, { key: 'status', label: 'Status', render: i => <StatusPill value={i.status} /> }, { key: 'createdAt', label: 'Uploaded', render: i => date(i.createdAt) },
  ] },
  invoices: { title: 'Invoices', description: 'Track billing documents and reconcile paid and unpaid balances.', resource: 'invoices', statuses: ['draft', 'issued', 'paid', 'unpaid', 'void'], columns: [
    { key: 'number', label: 'Invoice', render: i => primary(i.number, date(i.createdAt)) }, { key: 'organization.name', label: 'Organization' }, { key: 'total', label: 'Total', render: i => money(i.total) }, { key: 'dueAt', label: 'Due date', render: i => date(i.dueAt) }, { key: 'status', label: 'Status', render: i => <StatusPill value={i.status} /> },
  ] },
  'activity-logs': { title: 'Activity logs', description: 'Immutable trail of sensitive platform actions and access events.', resource: 'activity-logs', columns: [
    { key: 'action', label: 'Event', render: i => primary(i.action?.replaceAll('_', ' '), i.entity) }, { key: 'actor.email', label: 'Actor' }, { key: 'ip', label: 'IP address' }, { key: 'createdAt', label: 'Timestamp', render: i => date(i.createdAt) }, { key: 'requestId', label: 'Request ID' },
  ] },
}

function PlanDialog({ close }: { close: () => void }) {
  const [saving, setSaving] = useState(false)
  const submit = async (formData: FormData) => {
    setSaving(true)
    try { await platformConsoleApi.create('plans', { name: formData.get('name'), code: formData.get('code'), description: formData.get('description'), status: 'active', pricing: { monthly: Number(formData.get('monthly')), yearly: Number(formData.get('yearly')), currency: 'INR' }, trialDays: Number(formData.get('trialDays')), features: [] }); toast.success('Plan created'); close(); location.reload() } catch (e) { toast.error(platformApiError(e)); setSaving(false) }
  }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><form action={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><h2 className="text-lg font-semibold">Create plan</h2><p className="mt-1 text-xs text-slate-500">Add pricing and trial configuration. Features can be expanded later.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{[['name','Plan name','Business'],['code','Unique code','business'],['monthly','Monthly price','2999'],['yearly','Yearly price','29990'],['trialDays','Trial days','14']].map(([name,label,placeholder]) => <label key={name} className="text-xs font-medium">{label}<input required name={name} type={['monthly','yearly','trialDays'].includes(name) ? 'number' : 'text'} placeholder={placeholder} className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950" /></label>)}<label className="text-xs font-medium sm:col-span-2">Description<textarea name="description" className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Creating…' : 'Create plan'}</button></div></form></div>
}

export default function PlatformSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params)
  const [planOpen, setPlanOpen] = useState(false)
  if (section === 'profile') {
    const admin = platformSession.admin()
    return <><PageHeader title="Profile" description="Your isolated Platform Super Admin identity." /><div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="grid size-16 place-items-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{admin?.name?.split(' ').map(v => v[0]).join('')}</div><h2 className="mt-4 text-xl font-semibold">{admin?.name}</h2><p className="text-sm text-slate-500">{admin?.email}</p><div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-950">Role: Platform Super Admin · Independent of all organizations</div></div></>
  }
  if (section === 'settings') return <SettingsPage />
  if (section === 'reports') return <ReportsPage />
  const config = configs[section]
  if (!config) return <><PageHeader title="Module unavailable" description="This platform module is not configured." /></>
  const actions: RowAction[] = []
  if (section === 'organizations') actions.push(
    { label: 'Suspend organization', tone: 'danger', when: i => i.platformStatus !== 'suspended', run: i => platformConsoleApi.organizationStatus(i._id, 'suspended', 'Suspended by platform owner').then(() => undefined) },
    { label: 'Activate organization', tone: 'success', when: i => i.platformStatus === 'suspended', run: i => platformConsoleApi.organizationStatus(i._id, 'active').then(() => undefined) },
    { label: 'Delete organization', tone: 'danger', run: i => platformConsoleApi.remove('organizations', i._id).then(() => undefined) },
  )
  if (section === 'subscriptions') actions.push(
    { label: 'Renew 30 days', tone: 'success', run: i => platformConsoleApi.subscriptionAction(i._id, { action: 'renew', days: 30 }).then(() => undefined) },
    { label: 'Extend 7 days', run: i => platformConsoleApi.subscriptionAction(i._id, { action: 'extend', days: 7 }).then(() => undefined) },
    { label: 'Suspend', tone: 'danger', run: i => platformConsoleApi.subscriptionAction(i._id, { action: 'suspend' }).then(() => undefined) },
    { label: 'Cancel', tone: 'danger', run: i => platformConsoleApi.subscriptionAction(i._id, { action: 'cancel' }).then(() => undefined) },
  )
  if (section === 'payments' || section === 'payment-verification') actions.push(
    { label: 'Verify payment', tone: 'success', when: i => i.status === 'pending', run: i => platformConsoleApi.paymentDecision(i._id, 'verified').then(() => undefined) },
    { label: 'Reject payment', tone: 'danger', when: i => i.status === 'pending', run: i => platformConsoleApi.paymentDecision(i._id, 'rejected', 'Payment proof could not be verified').then(() => undefined) },
  )
  if (section === 'invoices') actions.push(
    { label: 'Mark paid', tone: 'success', run: i => platformConsoleApi.invoiceStatus(i._id, 'paid').then(() => undefined) },
    { label: 'Mark unpaid', tone: 'danger', run: i => platformConsoleApi.invoiceStatus(i._id, 'unpaid').then(() => undefined) },
  )
  return <><PageHeader eyebrow="Platform control" title={config.title} description={config.description} action={section === 'plans' ? <button onClick={() => setPlanOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> Create plan</button> : undefined} /><ResourceTable resource={config.resource} columns={config.columns} statuses={config.statuses} actions={actions} />{planOpen && <PlanDialog close={() => setPlanOpen(false)} />}</>
}

function ReportsPage() {
  return <><PageHeader eyebrow="Business intelligence" title="Reports & analytics" description="Revenue, renewal and subscription trends prepared for export." action={<button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"><Download className="size-4" /> Export report</button>} /><ResourceTable resource="reports" columns={[{ key: '_id.month', label: 'Month' }, { key: '_id.year', label: 'Year' }, { key: 'revenue', label: 'Verified revenue', render: i => money(i.revenue) }, { key: 'payments', label: 'Payments' }]} /></>
}
function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const submit = async (data: FormData) => { setSaving(true); try { await platformConsoleApi.setting('platform.general', { supportEmail: data.get('supportEmail'), timezone: data.get('timezone'), maintenanceMode: data.get('maintenanceMode') === 'on' }); toast.success('Platform settings updated') } catch (e) { toast.error(platformApiError(e)) } finally { setSaving(false) } }
  return <><PageHeader title="Platform settings" description="Global service policy. Every change is recorded in the platform audit log." /><form action={submit} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="space-y-5"><label className="block text-xs font-medium">Support email<input name="supportEmail" type="email" defaultValue="support@flowpilot.app" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950" /></label><label className="block text-xs font-medium">Reporting timezone<select name="timezone" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950"><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option></select></label><label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"><span><span className="block text-sm font-medium">Maintenance mode</span><span className="mt-1 block text-xs text-slate-500">Prevent tenant sign-ins during scheduled maintenance.</span></span><input name="maintenanceMode" type="checkbox" className="size-4 accent-indigo-600" /></label></div><button disabled={saving} className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">{saving ? 'Saving…' : 'Save settings'}</button></form></>
}
