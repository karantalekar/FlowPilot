export type PlatformAdmin = {
  id: string
  name: string
  email: string
  role: 'platform_super_admin'
  avatar?: string
  lastLoginAt?: string
}

export type PlatformSession = {
  admin: PlatformAdmin
  accessToken: string
  refreshToken?: string
}

export type OrganizationStatus = 'active' | 'suspended' | 'trial'
export type PaymentStatus = 'verified' | 'pending' | 'rejected'

export type Organization = {
  id: string
  name: string
  domain: string
  plan: string
  status: OrganizationStatus
  users: number
  owner: string
  renewal: string
  revenue: number
}

export type Payment = {
  id: string
  organization: string
  amount: number
  method: string
  transactionId: string
  status: PaymentStatus
  date: string
  proofUrl?: string
}

export type Pagination = { page: number; limit: number; total: number; pages: number }
export type Paginated<T> = { items: T[]; pagination: Pagination }
export type Overview = {
  totalOrganizations: number; activeOrganizations: number; suspendedOrganizations: number
  totalUsers: number; totalAdmins: number; totalManagers: number; totalEmployees: number
  activeSubscriptions: number; expiredSubscriptions: number; pendingPayments: number
  verifiedPayments: number; rejectedPayments: number; monthlyRevenue: number; yearlyRevenue: number
}
