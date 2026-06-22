'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { backendApi, getApiError } from '@/lib/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type Customer = { _id: string; name: string; email?: string; company?: string; phone?: string; lifetimeValue?: number }
const emptyForm = { name: '', email: '', company: '', phone: '', lifetimeValue: 0 }

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [editingId, setEditingId] = useState<string>()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer>()

  const load = useCallback(() => backendApi.customers().then(response => setItems(response.data.data)).catch(error => toast.error(getApiError(error))), [])
  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditingId(undefined); setForm(emptyForm); setShowForm(true) }
  const openEdit = (customer: Customer) => { setEditingId(customer._id); setForm({ name: customer.name, email: customer.email || '', company: customer.company || '', phone: customer.phone || '', lifetimeValue: customer.lifetimeValue || 0 }); setShowForm(true) }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true)
    try {
      if (editingId) await backendApi.updateCustomer(editingId, form)
      else await backendApi.createCustomer(form)
      setShowForm(false); setForm(emptyForm); setEditingId(undefined); load()
      toast.success(editingId ? 'Customer updated' : 'Customer created')
    } catch (error) { toast.error(getApiError(error, 'Could not save customer')) }
    finally { setSaving(false) }
  }
  const remove = async (id: string) => {
    try { await backendApi.deleteCustomer(id); setItems(current => current.filter(customer => customer._id !== id)); toast.success('Customer deleted') }
    catch (error) { toast.error(getApiError(error, 'Could not delete customer')) }
  }

  return <div className="space-y-6">
    <div className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">Customers</h1><p className="text-muted-foreground">View and manage complete customer details</p></div><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/>New Customer</Button></div>
    {showForm && <Card><CardHeader><CardTitle>{editingId ? 'Edit Customer' : 'New Customer'}</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><input required value={form.name} onChange={event => setForm({...form, name: event.target.value})} placeholder="Name" className="rounded-lg border bg-background px-4 py-2"/><input type="email" value={form.email} onChange={event => setForm({...form, email: event.target.value})} placeholder="Email" className="rounded-lg border bg-background px-4 py-2"/><input value={form.company} onChange={event => setForm({...form, company: event.target.value})} placeholder="Company" className="rounded-lg border bg-background px-4 py-2"/><input value={form.phone} onChange={event => setForm({...form, phone: event.target.value})} placeholder="Phone" className="rounded-lg border bg-background px-4 py-2"/><input min={0} type="number" value={form.lifetimeValue} onChange={event => setForm({...form, lifetimeValue: Number(event.target.value)})} placeholder="Lifetime value" className="rounded-lg border bg-background px-4 py-2"/><div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save customer'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div></form></CardContent></Card>}
    <Card><CardHeader><CardTitle>{items.length} Customers</CardTitle></CardHeader><CardContent>{items.length === 0 ? <p className="text-muted-foreground">No customers yet.</p> : <div className="grid gap-4 md:grid-cols-2">{items.map(customer => <div key={customer._id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{customer.name}</p><p className="text-sm text-muted-foreground">{customer.email || 'No email'}</p></div><div className="flex gap-1"><Button size="icon-sm" variant="ghost" onClick={() => openEdit(customer)} aria-label={`Edit ${customer.name}`}><Pencil/></Button><Button size="icon-sm" variant="ghost" onClick={() => setCustomerToDelete(customer)} aria-label={`Delete ${customer.name}`}><Trash2 className="text-destructive"/></Button></div></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Company</dt><dd>{customer.company || '—'}</dd></div><div><dt className="text-muted-foreground">Phone</dt><dd>{customer.phone || '—'}</dd></div><div><dt className="text-muted-foreground">Lifetime value</dt><dd>${(customer.lifetimeValue || 0).toLocaleString()}</dd></div></dl></div>)}</div>}</CardContent></Card>
    <ConfirmDialog open={Boolean(customerToDelete)} title="Delete customer?" description={`This will permanently delete ${customerToDelete?.name || 'this customer'} and cannot be undone.`} confirmLabel="Delete customer" onOpenChange={open => !open && setCustomerToDelete(undefined)} onConfirm={() => customerToDelete && remove(customerToDelete._id)} />
  </div>
}
