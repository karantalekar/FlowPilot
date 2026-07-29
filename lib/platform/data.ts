import type { Organization, Payment } from './types'

export const overviewStats = [
  { label: 'Total organizations', value: '1,284', change: '+8.2%', tone: 'indigo' },
  { label: 'Active organizations', value: '1,096', change: '+5.4%', tone: 'emerald' },
  { label: 'Suspended', value: '42', change: '-1.8%', tone: 'amber' },
  { label: 'Total users', value: '48,920', change: '+12.1%', tone: 'blue' },
  { label: 'Active subscriptions', value: '1,041', change: '+6.9%', tone: 'violet' },
  { label: 'Expired subscriptions', value: '71', change: '-3.2%', tone: 'rose' },
  { label: 'Pending payments', value: '28', change: '₹3.8L', tone: 'orange' },
  { label: 'Monthly revenue', value: '₹42.8L', change: '+14.2%', tone: 'cyan' },
]

export const organizations: Organization[] = [
  { id: 'ORG-1048', name: 'Acme Systems', domain: 'acme.io', plan: 'Enterprise', status: 'active', users: 248, owner: 'Maya Shah', renewal: '12 Aug 2026', revenue: 148000 },
  { id: 'ORG-1047', name: 'Northstar Labs', domain: 'northstarlabs.com', plan: 'Business', status: 'active', users: 91, owner: 'Lucas Martin', renewal: '18 Aug 2026', revenue: 72000 },
  { id: 'ORG-1046', name: 'Greenline Retail', domain: 'greenline.in', plan: 'Pro', status: 'trial', users: 34, owner: 'Neha Kumar', renewal: '22 Aug 2026', revenue: 24000 },
  { id: 'ORG-1045', name: 'Pinnacle Health', domain: 'pinnacle.health', plan: 'Enterprise', status: 'suspended', users: 386, owner: 'Aaron Blake', renewal: 'Expired', revenue: 196000 },
  { id: 'ORG-1044', name: 'Orbit Finance', domain: 'orbitfin.co', plan: 'Business', status: 'active', users: 118, owner: 'Sara Khan', renewal: '03 Sep 2026', revenue: 86000 },
  { id: 'ORG-1043', name: 'CloudPeak', domain: 'cloudpeak.dev', plan: 'Pro', status: 'active', users: 49, owner: 'Jon Bell', renewal: '09 Sep 2026', revenue: 36000 },
]

export const payments: Payment[] = [
  { id: 'PAY-89142', organization: 'Acme Systems', amount: 148000, method: 'Bank transfer', transactionId: 'UTR9838291032', status: 'verified', date: '29 Jul, 10:42' },
  { id: 'PAY-89141', organization: 'Orbit Finance', amount: 86000, method: 'UPI', transactionId: '429101837201', status: 'pending', date: '29 Jul, 09:18' },
  { id: 'PAY-89140', organization: 'Northstar Labs', amount: 72000, method: 'Card', transactionId: 'TXN_38AP19K2', status: 'verified', date: '28 Jul, 18:04' },
  { id: 'PAY-89139', organization: 'Pinnacle Health', amount: 196000, method: 'Bank transfer', transactionId: 'UTR8301937291', status: 'rejected', date: '28 Jul, 16:32' },
  { id: 'PAY-89138', organization: 'CloudPeak', amount: 36000, method: 'UPI', transactionId: '429018283901', status: 'pending', date: '28 Jul, 12:10' },
]

export const revenueData = [
  { month: 'Feb', revenue: 28, subscriptions: 790 }, { month: 'Mar', revenue: 31, subscriptions: 835 },
  { month: 'Apr', revenue: 29, subscriptions: 872 }, { month: 'May', revenue: 35, subscriptions: 921 },
  { month: 'Jun', revenue: 38, subscriptions: 978 }, { month: 'Jul', revenue: 43, subscriptions: 1041 },
]
