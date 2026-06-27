import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flowpilot-be.onrender.com/api/v1'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta?: { pagination?: { page: number; limit: number; total: number; pages: number } }
}

export interface ApiUser {
  _id?: string
  id?: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'manager' | 'employee'
  organization?: string
}

export interface AuthPayload {
  user: ApiUser
  accessToken: string
  refreshToken: string
  organization?: unknown
}

export interface AIUsage {
  limit: number
  used: number
  remaining: number
  resetsAt: string
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

const tokenStore = {
  access: () => (typeof window === 'undefined' ? null : localStorage.getItem('auth_token')),
  refresh: () => (typeof window === 'undefined' ? null : localStorage.getItem('refresh_token')),
  save: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('auth_token', accessToken)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
  },
  clear: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
  },
}

api.interceptors.request.use((config) => {
  const token = tokenStore.access()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshRequest: Promise<string> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const refreshToken = tokenStore.refresh()

    if (error.response?.status === 401 && original && !original._retry && refreshToken && !original.url?.includes('/auth/refresh-token')) {
      original._retry = true
      refreshRequest ??= axios
        .post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(`${API_BASE_URL}/auth/refresh-token`, { refreshToken })
        .then(({ data }) => {
          tokenStore.save(data.data.accessToken, data.data.refreshToken)
          return data.data.accessToken
        })
        .finally(() => { refreshRequest = null })

      try {
        const accessToken = await refreshRequest
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        tokenStore.clear()
      }
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      tokenStore.clear()
      if (!window.location.pathname.startsWith('/auth/')) window.location.assign('/auth/login')
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: { message?: string } } | undefined
    if (!error.response) return `Cannot reach the backend at ${API_BASE_URL}`
    return data?.message || data?.error?.message || error.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

export function saveSession(payload: AuthPayload) {
  tokenStore.save(payload.accessToken, payload.refreshToken)
  localStorage.setItem('auth_user', JSON.stringify(payload.user))
}

export function clearSession() {
  tokenStore.clear()
}

export const authApi = {
  login: (input: { email: string; password: string }) => api.post<ApiEnvelope<AuthPayload>>('/auth/login', input),
  register: (input: { name: string; email: string; password: string; organizationName?: string }) => api.post<ApiEnvelope<AuthPayload>>('/auth/register', input),
  me: () => api.get<ApiEnvelope<ApiUser>>('/auth/me'),
  updateMe: (name: string) => api.patch<ApiEnvelope<ApiUser>>('/auth/me', { name }),
  changePassword: (currentPassword: string, newPassword: string) => api.post<ApiEnvelope<null>>('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) => api.post<ApiEnvelope<null>>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post<ApiEnvelope<null>>('/auth/reset-password', { token, password }),
  acceptInvite: (token: string, password: string) => api.post<ApiEnvelope<AuthPayload>>('/auth/accept-invite', { token, password }),
  google: (input: { email: string; name: string; googleIdToken?: string }) => api.post<ApiEnvelope<AuthPayload>>('/auth/google', input),
  logout: () => api.post<ApiEnvelope<null>>('/auth/logout'),
}

export const backendApi = {
  dashboard: (config?: { signal?: AbortSignal }) => api.get<ApiEnvelope<Record<string, number>>>('/analytics/dashboard', config),
  crmAnalytics: () => api.get<ApiEnvelope<{ byStatus: Array<{ _id: string; count: number }>; leadsByMonth: Array<{ _id: string; count: number }>; customersByMonth: Array<{ _id: string; count: number }> }>>('/analytics/crm'),
  projectAnalytics: () => api.get<ApiEnvelope<{ byStatus: Array<{ _id: string; count: number }>; tasksByStatus: Array<{ _id: string; count: number }>; projectsByMonth: Array<{ _id: string; count: number }>; tasksByMonth: Array<{ _id: string; count: number }> }>>('/analytics/projects'),
  leads: (params?: Record<string, string>) => api.get<ApiEnvelope<any[]>>('/leads', { params }),
  lead: (id: string) => api.get<ApiEnvelope<any>>(`/leads/${id}`),
  createLead: (input: Record<string, unknown>) => api.post<ApiEnvelope<any>>('/leads', input),
  updateLead: (id: string, input: Record<string, unknown>) => api.patch<ApiEnvelope<any>>(`/leads/${id}`, input),
  deleteLead: (id: string) => api.delete<ApiEnvelope<null>>(`/leads/${id}`),
  customers: () => api.get<ApiEnvelope<any[]>>('/customers'),
  createCustomer: (input: Record<string, unknown>) => api.post<ApiEnvelope<any>>('/customers', input),
  updateCustomer: (id: string, input: Record<string, unknown>) => api.patch<ApiEnvelope<any>>(`/customers/${id}`, input),
  deleteCustomer: (id: string) => api.delete<ApiEnvelope<null>>(`/customers/${id}`),
  projects: () => api.get<ApiEnvelope<any[]>>('/projects'),
  project: (id: string) => api.get<ApiEnvelope<any>>(`/projects/${id}`),
  kanban: (id: string) => api.get<ApiEnvelope<any>>(`/projects/${id}/kanban`),
  createProject: (input: Record<string, unknown>) => api.post<ApiEnvelope<any>>('/projects', input),
  updateProject: (id: string, input: Record<string, unknown>) => api.patch<ApiEnvelope<any>>(`/projects/${id}`, input),
  deleteProject: (id: string) => api.delete<ApiEnvelope<null>>(`/projects/${id}`),
  projectAssignments: (id: string) => api.get<ApiEnvelope<{ members: ApiUser[]; invitations: Array<{ _id: string; user: ApiUser; status: 'pending' | 'accepted' | 'rejected' }> }>>(`/projects/${id}/members`),
  inviteToProject: (id: string, userId: string) => api.post<ApiEnvelope<any>>(`/projects/${id}/invitations`, { userId }),
  revokeProjectAccess: (id: string, userId: string) => api.delete<ApiEnvelope<null>>(`/projects/${id}/members/${userId}`),
  respondToProjectInvite: (projectId: string, invitationId: string, status: 'accepted' | 'rejected') => api.patch<ApiEnvelope<any>>(`/projects/${projectId}/invitations/${invitationId}/respond`, { status }),
  tasks: (project?: string) => api.get<ApiEnvelope<any[]>>('/tasks', { params: project ? { project } : undefined }),
  createTask: (input: Record<string, unknown>) => api.post<ApiEnvelope<any>>('/tasks', input),
  updateTask: (id: string, input: Record<string, unknown>) => api.patch<ApiEnvelope<any>>(`/tasks/${id}`, input),
  chat: (message: string, conversationId?: string) => api.post<ApiEnvelope<{ answer: string; conversationId: string }>>('/ai/chat', { message, conversationId }),
  aiUsage: () => api.get<ApiEnvelope<AIUsage>>('/ai/usage'),
  conversations: () => api.get<ApiEnvelope<any[]>>('/ai/conversations'),
  uploadDocument: (document: File) => { const body = new FormData(); body.append('document', document); return api.post<ApiEnvelope<any>>('/ai/documents/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  askDocument: (question: string, documentId?: string) => api.post<ApiEnvelope<any>>('/ai/documents/ask', { question, documentId }),
  generateReport: (type: string, prompt?: string) => api.post<ApiEnvelope<any>>('/ai/reports/generate', { type, prompt }),
  createOrganization: (name: string) => api.post<ApiEnvelope<any>>('/organizations', { name }),
  organization: () => api.get<ApiEnvelope<any>>('/organizations/current'),
  updateOrganization: (id: string, name: string) => api.patch<ApiEnvelope<any>>(`/organizations/${id}`, { name }),
  members: () => api.get<ApiEnvelope<ApiUser[]>>('/organizations/current/members'),
  inviteMember: (input: { name: string; email: string; role: string }) => api.post<ApiEnvelope<{ user: ApiUser; emailSent: boolean; inviteUrl?: string }>>('/organizations/current/members', input),
  updateMember: (id: string, input: { name?: string; email?: string; role?: 'admin' | 'manager' | 'employee' }) => api.patch<ApiEnvelope<ApiUser>>(`/organizations/current/members/${id}`, input),
  removeMember: (id: string) => api.delete<ApiEnvelope<null>>(`/organizations/current/members/${id}`),
  notifications: () => api.get<ApiEnvelope<any[]>>('/notifications'),
  readNotification: (id: string) => api.patch<ApiEnvelope<any>>(`/notifications/${id}/read`),
  readAllNotifications: () => api.patch<ApiEnvelope<any>>('/notifications/read-all'),
  subscription: () => api.get<ApiEnvelope<any>>('/billing/subscription'),
  payments: () => api.get<ApiEnvelope<any[]>>('/billing/payment-history'),
  createSubscription: (plan: 'pro' | 'business') => api.post<ApiEnvelope<{ keyId: string; subscriptionId: string; name: string; description: string }>>('/billing/create-subscription', { plan }),
  verifyPayment: (input: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => api.post<ApiEnvelope<{ verified: boolean; plan: string }>>('/billing/verify-payment', input),
  adminStats: () => api.get<ApiEnvelope<any>>('/admin/stats'),
  adminUsers: () => api.get<ApiEnvelope<any[]>>('/admin/users'),
  adminOrganizations: () => api.get<ApiEnvelope<any[]>>('/admin/organizations'),
  adminSubscriptions: () => api.get<ApiEnvelope<any[]>>('/admin/subscriptions'),
  adminAuditLogs: () => api.get<ApiEnvelope<any[]>>('/admin/audit-logs'),
}

export default api
