'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Copy, Mail, MoreVertical, Plus, Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiUser, backendApi, getApiError } from '@/lib/api'
import { useAppSelector } from '@/lib/hooks'
import { ConfirmDialog } from '@/components/confirm-dialog'

type EditableRole = 'admin' | 'manager' | 'employee'
type EditingMember = { id: string; name: string; email: string; role: ApiUser['role'] }
type TeamGroup = 'admins' | 'members' | 'employees'

export default function TeamPage() {
  const currentRole = useAppSelector(state => state.auth.user?.role)
  const canManage = currentRole === 'admin' || currentRole === 'super_admin'
  const canInvite = currentRole === 'manager' || canManage
  const [teamMembers, setTeamMembers] = useState<ApiUser[]>([])
  const [activeGroup, setActiveGroup] = useState<TeamGroup>('admins')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<EditableRole>('employee')
  const [lastInviteUrl, setLastInviteUrl] = useState('')
  const [lastInviteRecipient, setLastInviteRecipient] = useState<{ name: string; email: string }>()
  const [inviting, setInviting] = useState(false)
  const [editingMember, setEditingMember] = useState<EditingMember>()
  const [savingMember, setSavingMember] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState('')

  const loadMembers = useCallback(() => {
    backendApi.members()
      .then(response => setTeamMembers(response.data.data))
      .catch(error => toast.error(getApiError(error, 'Could not load team')))
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault()
    setInviting(true)
    const invitedName = inviteName.trim()
    const invitedEmail = inviteEmail.trim()
    try {
      const result = (await backendApi.inviteMember({ name: invitedName, email: invitedEmail, role: inviteRole })).data.data
      setInviteEmail('')
      setInviteName('')
      setShowInviteForm(false)
      setLastInviteUrl(result.emailSent ? '' : result.inviteUrl || '')
      setLastInviteRecipient(result.emailSent ? undefined : { name: invitedName, email: invitedEmail })
      loadMembers()
      toast.success(result.emailSent ? 'Invitation email sent' : 'Invitation created')
    } catch (error) {
      toast.error(getApiError(error, 'Could not invite member'))
    } finally {
      setInviting(false)
    }
  }

  const saveMember = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingMember) return
    setSavingMember(true)
    try {
      const updated = (await backendApi.updateMember(editingMember.id, {
        name: editingMember.name.trim(),
        email: editingMember.email.trim(),
        role: editingMember.role as EditableRole,
      })).data.data
      setTeamMembers(members => members.map(member => (member.id || member._id) === editingMember.id ? updated : member))
      setEditingMember(undefined)
      toast.success('Member information updated')
    } catch (error) {
      toast.error(getApiError(error, 'Could not update member'))
    } finally {
      setSavingMember(false)
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      await backendApi.removeMember(memberId)
      setTeamMembers(members => members.filter(member => (member.id || member._id) !== memberId))
      setEditingMember(undefined)
      toast.success('Member removed')
    } catch (error) {
      toast.error(getApiError(error, 'Could not remove member'))
    }
  }

  const teamGroups: Array<{ key: TeamGroup; label: string; description: string; members: ApiUser[] }> = [
    { key: 'admins', label: 'Admins', description: 'Owners and administrators', members: teamMembers.filter(member => member.role === 'admin' || member.role === 'super_admin') },
    { key: 'members', label: 'Members', description: 'Managers and team leads', members: teamMembers.filter(member => member.role === 'manager') },
    { key: 'employees', label: 'Employees', description: 'Project and task contributors', members: teamMembers.filter(member => member.role === 'employee') },
  ]
  const selectedGroup = teamGroups.find(group => group.key === activeGroup) || teamGroups[0]
  const inviteMailtoHref = lastInviteRecipient && lastInviteUrl
    ? `mailto:${encodeURIComponent(lastInviteRecipient.email)}?subject=${encodeURIComponent('Your FlowPilot invitation')}&body=${encodeURIComponent(`Hi ${lastInviteRecipient.name},\n\nYou have been invited to join FlowPilot. Open this link to accept your invitation:\n\n${lastInviteUrl}\n\nThanks.`)}`
    : ''

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Team Members</h1><p className="mt-1 text-muted-foreground">Manage your team and permissions</p></div>
        {canInvite && <Button className="gap-2" onClick={() => setShowInviteForm(open => !open)}><Plus className="h-4 w-4" />Invite Member</Button>}
      </div>

      {showInviteForm && <Card className="border-primary/50 bg-primary/5"><CardHeader><CardTitle>Invite Team Member</CardTitle><CardDescription>{currentRole === 'manager' ? 'Managers can invite Employees only.' : 'Invite an Employee, Manager, or Admin.'}</CardDescription></CardHeader><CardContent><form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-3"><input required minLength={2} value={inviteName} onChange={event => setInviteName(event.target.value)} placeholder="Full name" className="rounded-lg border bg-background px-4 py-2"/><input required type="email" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="colleague@example.com" className="rounded-lg border bg-background px-4 py-2"/><select value={inviteRole} onChange={event => setInviteRole(event.target.value as EditableRole)} disabled={currentRole === 'manager'} className="rounded-lg border bg-background px-4 py-2"><option value="employee">Employee</option>{currentRole !== 'manager' && <><option value="manager">Manager</option><option value="admin">Admin</option></>}</select><div className="flex gap-2 md:col-span-3"><Button type="submit" disabled={inviting}>{inviting ? 'Sending...' : 'Send Invite'}</Button><Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>Cancel</Button></div></form></CardContent></Card>}

      {lastInviteUrl && <Card className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><CardHeader><CardTitle>Invitation link created</CardTitle><CardDescription className="text-amber-800 dark:text-amber-200">Email delivery is unavailable. Send this link from your email app.</CardDescription></CardHeader><CardContent><div className="flex flex-col gap-3 sm:flex-row"><input readOnly value={lastInviteUrl} className="min-w-0 flex-1 rounded-lg border bg-background px-4 py-2 text-foreground"/>{inviteMailtoHref && <a href={inviteMailtoHref} className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"><Mail className="h-4 w-4"/>Email link</a>}<Button type="button" className="gap-2" onClick={() => { navigator.clipboard.writeText(lastInviteUrl); toast.success('Invite link copied') }}><Copy className="h-4 w-4"/>Copy link</Button></div></CardContent></Card>}

      {editingMember && <Card className="border-primary/50"><CardHeader><CardTitle>Edit Team Member</CardTitle><CardDescription>Update this Manager or Employee&apos;s information.</CardDescription></CardHeader><CardContent><form onSubmit={saveMember} className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><label htmlFor="member-name" className="text-sm font-medium">Full name</label><input id="member-name" required minLength={2} value={editingMember.name} onChange={event => setEditingMember({...editingMember, name: event.target.value})} className="w-full rounded-lg border bg-background px-4 py-2"/></div><div className="space-y-2"><label htmlFor="member-email" className="text-sm font-medium">Email</label><input id="member-email" required type="email" value={editingMember.email} onChange={event => setEditingMember({...editingMember, email: event.target.value})} className="w-full rounded-lg border bg-background px-4 py-2"/></div><div className="space-y-2"><label htmlFor="member-role" className="text-sm font-medium">Role</label><select id="member-role" value={editingMember.role} onChange={event => setEditingMember({...editingMember, role: event.target.value as EditableRole})} className="w-full rounded-lg border bg-background px-4 py-2"><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div><div className="flex flex-wrap gap-2 md:col-span-3"><Button type="submit" disabled={savingMember}>{savingMember ? 'Saving...' : 'Save changes'}</Button><Button type="button" variant="outline" onClick={() => setEditingMember(undefined)}>Cancel</Button><Button type="button" variant="destructive" onClick={() => setRemoveMemberId(editingMember.id)}><Trash2 className="mr-2 h-4 w-4"/>Remove member</Button></div></form></CardContent></Card>}

      <div className="grid gap-3 sm:grid-cols-3">
        {teamGroups.map(group => <button key={group.key} type="button" onClick={() => setActiveGroup(group.key)} className={`rounded-xl border p-4 text-left transition-all ${activeGroup === group.key ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20' : 'bg-card hover:border-primary/40 hover:bg-secondary/30'}`}><div className="flex items-center justify-between"><span className="font-semibold">{group.label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${activeGroup === group.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{group.members.length}</span></div><p className="mt-1 text-xs text-muted-foreground">{group.description}</p></button>)}
      </div>

      <Card><CardHeader><CardTitle>{selectedGroup.label}</CardTitle><CardDescription>{selectedGroup.members.length} {selectedGroup.label.toLowerCase()} in your workspace</CardDescription></CardHeader><CardContent>{selectedGroup.members.length === 0 ? <div className="rounded-xl border border-dashed py-12 text-center"><p className="font-medium">No {selectedGroup.label.toLowerCase()} yet</p><p className="mt-1 text-sm text-muted-foreground">Invited users will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead><tbody>{selectedGroup.members.map(member => {
        const memberId = member.id || member._id || ''
        const editable = canManage && (member.role === 'manager' || member.role === 'employee')
        return <tr key={memberId} className="border-b transition-colors hover:bg-secondary/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{member.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div><span className="font-medium">{member.name}</span></div></td><td className="px-4 py-3">{member.email}</td><td className="px-4 py-3"><div className="flex items-center gap-1">{member.role === 'admin' && <Shield className="h-4 w-4 text-primary"/>}<span className="capitalize">{member.role.replace('_', ' ')}</span></div></td><td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">active</span></td><td className="px-4 py-3">{editable ? <Button aria-label={`Edit ${member.name}`} variant="ghost" size="icon" onClick={() => setEditingMember({id: memberId, name: member.name, email: member.email, role: member.role})}><MoreVertical className="h-4 w-4"/></Button> : <span className="text-muted-foreground">—</span>}</td></tr>
      })}</tbody></table></div>}</CardContent></Card>
      <ConfirmDialog open={Boolean(removeMemberId)} title="Remove team member?" description="This removes the member from the workspace. This action cannot be undone." confirmLabel="Remove member" onOpenChange={open => !open && setRemoveMemberId('')} onConfirm={() => removeMember(removeMemberId)} />
    </div>
  )
}
