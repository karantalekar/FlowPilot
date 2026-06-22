'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Loader2 } from 'lucide-react'
import { backendApi, getApiError } from '@/lib/api'
import toast from 'react-hot-toast'
import { useAppSelector } from '@/lib/hooks'
import { ConfirmDialog } from '@/components/confirm-dialog'

type Lead = { _id: string; name: string; email?: string; phone?: string; company?: string; status: string; value?: number }
const emptyLead = { name: '', email: '', phone: '', company: '', value: '' }
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-yellow-100 text-yellow-800', qualified: 'bg-green-100 text-green-800',
  proposal: 'bg-purple-100 text-purple-800', won: 'bg-emerald-100 text-emerald-800', lost: 'bg-red-100 text-red-800',
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyLead)
  const [saving, setSaving] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead>()
  const [leadToDelete, setLeadToDelete] = useState<Lead>()
  const role = useAppSelector(s=>s.auth.user?.role)

  const loadLeads = async () => {
    try { setLeads((await backendApi.leads()).data.data) }
    catch (error) { toast.error(getApiError(error, 'Could not load leads')) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadLeads() }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.company.trim() && { company: form.company.trim() }),
        ...(form.value !== '' && { value: Number(form.value) }),
      }
      await backendApi.createLead(payload)
      setForm(emptyLead); setShowForm(false); await loadLeads(); toast.success('Lead created')
    } catch (error) { toast.error(getApiError(error, 'Could not create lead')) }
    finally { setSaving(false) }
  }

  const filtered = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.email} ${lead.company}`.toLowerCase().includes(search.toLowerCase())), [leads, search])
  const viewLead=async(id:string)=>{try{setSelectedLead((await backendApi.lead(id)).data.data)}catch(e){toast.error(getApiError(e))}}
  const updateStatus=async(lead:Lead,status:string)=>{try{await backendApi.updateLead(lead._id,{status});setLeads(xs=>xs.map(x=>x._id===lead._id?{...x,status}:x));toast.success('Lead updated')}catch(e){toast.error(getApiError(e))}}
  const remove=async(id:string)=>{try{await backendApi.deleteLead(id);setLeads(xs=>xs.filter(x=>x._id!==id));toast.success('Lead deleted')}catch(e){toast.error(getApiError(e))}}

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">CRM</h1><p className="text-muted-foreground">Manage live leads from your workspace</p></div>{role!=='employee'&&<Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New Lead</Button>}</div>
    {showForm && <Card><CardHeader><CardTitle>Create lead</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      {(['name','email','phone','company','value'] as const).map((field) => <input key={field} required={field === 'name'} min={field === 'value' ? 0 : undefined} type={field === 'email' ? 'email' : field === 'value' ? 'number' : 'text'} placeholder={field[0].toUpperCase()+field.slice(1)} value={form[field]} onChange={(e) => setForm({...form,[field]:e.target.value})} className="rounded-lg border bg-background px-4 py-2" />)}
      <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save lead</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
    </form></CardContent></Card>}
    {selectedLead&&<Card className="border-primary"><CardHeader><CardTitle>{selectedLead.name}</CardTitle><CardDescription>{selectedLead.email} · {selectedLead.phone||'No phone'}</CardDescription></CardHeader><CardContent className="flex justify-between"><span>{selectedLead.company||'No company'} · ${(selectedLead.value||0).toLocaleString()}</span><Button variant="outline" onClick={()=>setSelectedLead(undefined)}>Close</Button></CardContent></Card>}
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>All Leads</CardTitle><CardDescription>{leads.length} records from the backend</CardDescription></div><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search leads..." className="rounded-lg border bg-background py-2 pl-10 pr-4"/></div></div></CardHeader><CardContent>
      {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div> : filtered.length === 0 ? <p className="py-10 text-center text-muted-foreground">No leads found. Create your first lead.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b">{['Company','Contact','Phone','Status','Value','Actions'].map(x=><th key={x} className="px-4 py-3 text-left">{x}</th>)}</tr></thead><tbody>{filtered.map(lead=><tr key={lead._id} className="border-b"><td className="px-4 py-3 font-medium">{lead.company || '—'}</td><td className="px-4 py-3">{lead.name}<div className="text-xs text-muted-foreground">{lead.email}</div></td><td className="px-4 py-3">{lead.phone || '—'}</td><td className="px-4 py-3">{role==='employee'?<span className={`rounded-full px-2 py-1 text-xs ${statusColors[lead.status]||'bg-muted'}`}>{lead.status}</span>:<select value={lead.status} onChange={e=>updateStatus(lead,e.target.value)} className="rounded border bg-background p-1">{Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}</select>}</td><td className="px-4 py-3">${(lead.value || 0).toLocaleString()}</td><td className="px-4 py-3"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={()=>viewLead(lead._id)}>View</Button>{(role==='admin'||role==='super_admin')&&<Button size="sm" variant="outline" onClick={()=>setLeadToDelete(lead)}>Delete</Button>}</div></td></tr>)}</tbody></table></div>}
    </CardContent></Card>
    <ConfirmDialog open={Boolean(leadToDelete)} title="Delete lead?" description={`This will permanently delete ${leadToDelete?.name || 'this lead'}.`} confirmLabel="Delete lead" onOpenChange={open => !open && setLeadToDelete(undefined)} onConfirm={() => leadToDelete && remove(leadToDelete._id)} />
  </div>
}
