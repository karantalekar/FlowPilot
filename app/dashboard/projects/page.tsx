'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Send, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiUser, backendApi, getApiError } from '@/lib/api'
import { useAppSelector } from '@/lib/hooks'
import { ConfirmDialog } from '@/components/confirm-dialog'

type Project = { _id: string; name: string; description?: string; status: string }
type Task = { _id: string; title: string; status: string }
type Invitation = { _id: string; user: ApiUser; status: 'pending' | 'accepted' | 'rejected' }
const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'review', title: 'Review', color: 'bg-yellow-50 dark:bg-yellow-950' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-950' },
]

export default function ProjectsPage() {
  const role = useAppSelector(state => state.auth.user?.role)
  const canAssign = role === 'manager' || role === 'admin' || role === 'super_admin'
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [projectDetail, setProjectDetail] = useState<Project>()
  const [workspaceMembers, setWorkspaceMembers] = useState<ApiUser[]>([])
  const [assignedMembers, setAssignedMembers] = useState<ApiUser[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviting, setInviting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'project' } | { type: 'access'; member: ApiUser }>()

  const loadProjects = useCallback(async () => {
    try { const items = (await backendApi.projects()).data.data as Project[]; setProjects(items); setSelected(value => items.some(item => item._id === value) ? value : items[0]?._id || '') }
    catch (error) { toast.error(getApiError(error, 'Could not load projects')) }
    finally { setLoading(false) }
  }, [])
  const loadAssignments = useCallback(async (projectId: string) => {
    if (!canAssign) return
    const response = await backendApi.projectAssignments(projectId)
    setAssignedMembers(response.data.data.members); setInvitations(response.data.data.invitations)
  }, [canAssign])

  useEffect(() => { loadProjects() }, [loadProjects])
  useEffect(() => { if (canAssign) backendApi.members().then(response => setWorkspaceMembers(response.data.data)).catch(error => toast.error(getApiError(error))) }, [canAssign])
  useEffect(() => {
    if (!selected) { setTasks([]); setProjectDetail(undefined); setAssignedMembers([]); setInvitations([]); return }
    const requests: Promise<unknown>[] = [backendApi.tasks(selected), backendApi.project(selected), backendApi.kanban(selected)]
    if (canAssign) requests.push(loadAssignments(selected))
    Promise.all(requests).then(([taskResponse, projectResponse]) => { setTasks((taskResponse as Awaited<ReturnType<typeof backendApi.tasks>>).data.data); setProjectDetail((projectResponse as Awaited<ReturnType<typeof backendApi.project>>).data.data) }).catch(error => toast.error(getApiError(error)))
  }, [canAssign, loadAssignments, selected])

  const eligibleMembers = useMemo(() => workspaceMembers.filter(member => {
    if (role === 'manager' && member.role !== 'employee') return false
    if (role !== 'manager' && !['employee', 'manager'].includes(member.role)) return false
    const id = member.id || member._id
    return !assignedMembers.some(assigned => (assigned.id || assigned._id) === id) && !invitations.some(invitation => (invitation.user.id || invitation.user._id) === id && invitation.status === 'pending')
  }), [assignedMembers, invitations, role, workspaceMembers])

  const createProject = async (event: FormEvent) => { event.preventDefault(); try { const created = (await backendApi.createProject({name: projectName, status: 'active'})).data.data; setProjectName(''); setShowProjectForm(false); await loadProjects(); setSelected(created._id); toast.success('Project created') } catch (error) { toast.error(getApiError(error)) } }
  const createTask = async () => { if (!taskTitle.trim() || !selected) return; try { await backendApi.createTask({project: selected, title: taskTitle, status: 'todo'}); setTaskTitle(''); setTasks((await backendApi.tasks(selected)).data.data); toast.success('Task created') } catch (error) { toast.error(getApiError(error)) } }
  const moveTask = async (task: Task, status: string) => { try { await backendApi.updateTask(task._id, {status}); setTasks(items => items.map(item => item._id === task._id ? {...item, status} : item)) } catch (error) { toast.error(getApiError(error)) } }
  const updateProjectStatus = async (status: string) => { if (!selected) return; try { const updated = (await backendApi.updateProject(selected, {status})).data.data; setProjectDetail(updated); setProjects(items => items.map(item => item._id === selected ? updated : item)); toast.success('Project updated') } catch (error) { toast.error(getApiError(error)) } }
  const deleteProject = async () => { if (!selected) return; try { await backendApi.deleteProject(selected); setProjects(items => items.filter(item => item._id !== selected)); setSelected(''); toast.success('Project deleted') } catch (error) { toast.error(getApiError(error)) } }
  const invite = async () => { if (!selected || !inviteUserId) return; setInviting(true); try { await backendApi.inviteToProject(selected, inviteUserId); setInviteUserId(''); await loadAssignments(selected); toast.success('Project invitation sent') } catch (error) { toast.error(getApiError(error)) } finally { setInviting(false) } }
  const revoke = async (member: ApiUser) => { const memberId = member.id || member._id || ''; if (!selected || !memberId) return; try { await backendApi.revokeProjectAccess(selected, memberId); setAssignedMembers(current => current.filter(item => (item.id || item._id) !== memberId)); toast.success('Project access removed') } catch (error) { toast.error(getApiError(error)) } }

  const managerCount = assignedMembers.filter(member => member.role === 'manager').length
  const employeeCount = assignedMembers.filter(member => member.role === 'employee').length

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Projects</h1><p className="text-muted-foreground">Projects are visible only to accepted team members</p></div>{role !== 'employee' && <Button onClick={() => setShowProjectForm(open => !open)}><Plus className="mr-2 h-4 w-4"/>New Project</Button>}</div>
    {showProjectForm && <Card><CardContent className="pt-6"><form onSubmit={createProject} className="flex gap-2"><input required value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Project name" className="flex-1 rounded-lg border bg-background px-4 py-2"/><Button type="submit">Create</Button></form></CardContent></Card>}
    {loading ? <Loader2 className="animate-spin"/> : <><div className="flex gap-2 overflow-x-auto border-b pb-2">{projects.map(project => <button key={project._id} onClick={() => setSelected(project._id)} className={`whitespace-nowrap rounded-lg px-4 py-2 ${selected === project._id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{project.name}</button>)}</div>
    {selected ? <>
      {canAssign && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Project Access</CardTitle><CardDescription>{managerCount} managers and {employeeCount} employees currently assigned</CardDescription></CardHeader><CardContent className="space-y-5"><div className="flex flex-wrap gap-2">{assignedMembers.length ? assignedMembers.map(member => <span key={member.id || member._id} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">{member.name} <span className="text-muted-foreground">({member.role})</span>{(role !== 'manager' || member.role === 'employee') && <button onClick={() => setConfirmAction({type: 'access', member})} className="font-bold text-destructive" aria-label={`Revoke ${member.name}'s access`}>×</button>}</span>) : <p className="text-sm text-muted-foreground">No accepted members yet.</p>}</div><div className="flex flex-col gap-2 sm:flex-row"><select value={inviteUserId} onChange={event => setInviteUserId(event.target.value)} className="min-w-64 flex-1 rounded-lg border bg-background px-3 py-2"><option value="">Select {role === 'manager' ? 'an employee' : 'a manager or employee'}</option>{eligibleMembers.map(member => <option key={member.id || member._id} value={member.id || member._id}>{member.name} — {member.role}</option>)}</select><Button onClick={invite} disabled={!inviteUserId || inviting}><Send className="mr-2 h-4 w-4"/>{inviting ? 'Sending...' : 'Send invite'}</Button></div>{invitations.length > 0 && <div><p className="mb-2 text-sm font-medium">Invitation history</p><div className="grid gap-2 md:grid-cols-2">{invitations.map(invitation => <div key={invitation._id} className="flex justify-between rounded-lg border p-3 text-sm"><span>{invitation.user.name} ({invitation.user.role})</span><span className="capitalize text-muted-foreground">{invitation.status}</span></div>)}</div></div>}</CardContent></Card>}
      <div className="flex flex-wrap items-center gap-2"><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} onKeyDown={event => event.key === 'Enter' && createTask()} placeholder="Add a task to this project" className="min-w-60 flex-1 rounded-lg border bg-background px-4 py-2"/><Button onClick={createTask}>Add Task</Button>{role !== 'employee' && <select value={projectDetail?.status || 'active'} onChange={event => updateProjectStatus(event.target.value)} className="rounded-lg border bg-background px-3 py-2"><option value="planned">Planned</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="archived">Archived</option></select>}{(role === 'admin' || role === 'super_admin') && <Button variant="outline" onClick={() => setConfirmAction({type: 'project'})}>Delete</Button>}</div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{columns.map(column => <div key={column.id}><h3 className="mb-3 font-semibold">{column.title} <span className="text-muted-foreground">({tasks.filter(task => task.status === column.id).length})</span></h3><div className={`${column.color} min-h-72 space-y-3 rounded-lg p-3`}>{tasks.filter(task => task.status === column.id).map(task => <Card key={task._id}><CardHeader className="p-3"><CardTitle className="text-sm">{task.title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-1 p-3 pt-0">{columns.filter(item => item.id !== task.status).map(item => <button key={item.id} onClick={() => moveTask(task, item.id)} className="rounded border px-2 py-1 text-[10px] hover:bg-muted">Move to {item.title}</button>)}</CardContent></Card>)}</div></div>)}</div>
    </> : <Card><CardContent className="py-10 text-center text-muted-foreground">{role === 'employee' ? 'No accepted project assignments yet.' : 'Create your first project to begin.'}</CardContent></Card>}</>}
    <ConfirmDialog open={Boolean(confirmAction)} title={confirmAction?.type === 'project' ? 'Delete project?' : 'Remove project access?'} description={confirmAction?.type === 'project' ? `This will permanently delete ${projectDetail?.name || 'this project'} and its tasks.` : `This will remove ${confirmAction?.type === 'access' ? confirmAction.member.name : 'this member'} from the project.`} confirmLabel={confirmAction?.type === 'project' ? 'Delete project' : 'Remove access'} onOpenChange={open => !open && setConfirmAction(undefined)} onConfirm={() => confirmAction?.type === 'project' ? deleteProject() : confirmAction?.type === 'access' ? revoke(confirmAction.member) : undefined} />
  </div>
}
