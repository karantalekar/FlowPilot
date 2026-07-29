'use client'

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { PlatformAdmin, PlatformSession } from './types'

const baseURL = `${(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')}/platform`

export const platformSession = {
  access: () => typeof window === 'undefined' ? null : sessionStorage.getItem('platform_access_token'),
  refresh: () => typeof window === 'undefined' ? null : sessionStorage.getItem('platform_refresh_token'),
  save: (session: PlatformSession) => {
    sessionStorage.setItem('platform_access_token', session.accessToken)
    if (session.refreshToken) sessionStorage.setItem('platform_refresh_token', session.refreshToken)
    sessionStorage.setItem('platform_admin', JSON.stringify(session.admin))
  },
  admin: (): PlatformAdmin | null => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(sessionStorage.getItem('platform_admin') || 'null') } catch { return null }
  },
  clear: () => {
    sessionStorage.removeItem('platform_access_token')
    sessionStorage.removeItem('platform_refresh_token')
    sessionStorage.removeItem('platform_admin')
  },
}

const platformApi = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'X-Console': 'platform' },
})

platformApi.interceptors.request.use(config => {
  const token = platformSession.access()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshRequest: Promise<string> | null = null
platformApi.interceptors.response.use(response => response, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _platformRetry?: boolean }) | undefined
  const refreshToken = platformSession.refresh()
  if (error.response?.status === 401 && request && !request._platformRetry && refreshToken && !request.url?.includes('/auth/refresh')) {
    request._platformRetry = true
    refreshRequest ??= axios.post(`${baseURL}/auth/refresh`, { refreshToken }).then(({ data }) => {
      const token = data.data.accessToken as string
      sessionStorage.setItem('platform_access_token', token)
      return token
    }).finally(() => { refreshRequest = null })
    try {
      request.headers.Authorization = `Bearer ${await refreshRequest}`
      return platformApi(request)
    } catch { platformSession.clear() }
  }
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    platformSession.clear()
    window.location.replace('/platform/login')
  }
  return Promise.reject(error)
})

export const platformAuthApi = {
  login: (input: { email: string; password: string }) => platformApi.post<{ data: PlatformSession }>('/auth/login', input),
  me: () => platformApi.get<{ data: PlatformAdmin }>('/auth/me'),
  logout: () => platformApi.post('/auth/logout'),
}

export const platformConsoleApi = {
  overview: () => platformApi.get('/overview'),
  list: (resource: string, params?: Record<string, string | number>) => platformApi.get(`/${resource}`, { params }),
  get: (resource: string, id: string) => platformApi.get(`/${resource}/${id}`),
  create: (resource: string, input: unknown) => platformApi.post(`/${resource}`, input),
  update: (resource: string, id: string, input: unknown) => platformApi.patch(`/${resource}/${id}`, input),
  remove: (resource: string, id: string) => platformApi.delete(`/${resource}/${id}`),
  organizationStatus: (id: string, status: 'active' | 'suspended', reason?: string) => platformApi.patch(`/organizations/${id}/status`, { status, reason }),
  subscriptionAction: (id: string, input: Record<string, unknown>) => platformApi.patch(`/subscriptions/${id}/action`, input),
  paymentDecision: (id: string, decision: 'verified' | 'rejected', reason?: string) => platformApi.patch(`/payments/${id}/decision`, { decision, reason }),
  invoiceStatus: (id: string, status: 'paid' | 'unpaid' | 'void') => platformApi.patch(`/invoices/${id}/status`, { status }),
  setting: (key: string, value: unknown) => platformApi.put('/settings', { key, value }),
}

export const platformApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: { message?: string } } | undefined
    if (!error.response) return 'The platform service is unavailable. Check the API connection.'
    return data?.message || data?.error?.message || 'The request could not be completed.'
  }
  return error instanceof Error ? error.message : 'The request could not be completed.'
}

export default platformApi
