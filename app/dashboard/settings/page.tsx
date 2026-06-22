'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setTheme } from '@/lib/slices/uiSlice'
import { Bell, Moon, Lock, Trash2 } from 'lucide-react'
import { authApi, backendApi, getApiError } from '@/lib/api'
import { setUser } from '@/lib/slices/authSlice'
import toast from 'react-hot-toast'

const settingsSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)
  const user = useAppSelector((state) => state.auth.user)
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [organization, setOrganization] = useState<any>()
  const [organizationName, setOrganizationName] = useState('')
  useEffect(()=>{backendApi.organization().then(r=>{setOrganization(r.data.data);setOrganizationName(r.data.data.name)}).catch(()=>undefined)},[])

  const saveProfile = async () => { try { const apiUser=(await authApi.updateMe(name)).data.data; dispatch(setUser({...apiUser,id:apiUser.id||apiUser._id||''})); localStorage.setItem('auth_user',JSON.stringify(apiUser)); toast.success('Profile updated') } catch(e){toast.error(getApiError(e))} }
  const saveOrganization = async () => { try{const updated=organization?._id?(await backendApi.updateOrganization(organization._id,organizationName)).data.data:(await backendApi.createOrganization(organizationName)).data.data;setOrganization(updated);toast.success(organization?._id?'Workspace updated':'Workspace created')}catch(e){toast.error(getApiError(e))} }
  const savePassword = async () => { if(newPassword!==confirmPassword)return toast.error('New passwords do not match'); try{await authApi.changePassword(currentPassword,newPassword);setCurrentPassword('');setNewPassword('');setConfirmPassword('');toast.success('Password updated')}catch(e){toast.error(getApiError(e))} }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e=>setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={e=>setOrganizationName(e.target.value)}
                    placeholder="Workspace name"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2"><Button onClick={saveProfile}>Save Profile</Button><Button variant="outline" onClick={saveOrganization}>Save Workspace</Button></div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Theme
                  </CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <button
                      onClick={() => dispatch(setTheme('light'))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => dispatch(setTheme('dark'))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Manage notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-foreground">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-foreground">Push notifications</span>
                  </label>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e=>setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e=>setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e=>setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button onClick={savePassword}>Update Password</Button>
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          {activeSection === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Current Plan: Professional</p>
                  <p className="text-xs text-muted-foreground mt-1">$99/month • Renews on December 20, 2024</p>
                </div>
                <Button>Upgrade Plan</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
