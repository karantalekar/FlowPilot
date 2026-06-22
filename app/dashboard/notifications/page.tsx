'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { backendApi, getApiError } from '@/lib/api'

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    backendApi
      .notifications()
      .then((response) => setItems(response.data.data))
      .catch((error) => toast.error(getApiError(error)))
  }, [])

  const read = async (id: string) => {
    await backendApi.readNotification(id)
    setItems((currentItems) =>
      currentItems.map((item) =>
        item._id === id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    )
  }

  const markAllAsRead = async () => {
    await backendApi.readAllNotifications()
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, readAt: new Date().toISOString() })),
    )
  }

  const respondToInvitation = async (notification: any, status: 'accepted' | 'rejected') => {
    try {
      await backendApi.respondToProjectInvite(notification.metadata.projectId, notification.metadata.invitationId, status)
      setItems(currentItems => currentItems.map(item => item._id === notification._id ? { ...item, readAt: new Date().toISOString(), metadata: { ...item.metadata, status } } : item))
      toast.success(status === 'accepted' ? 'Project invitation accepted' : 'Project invitation rejected')
    } catch (error) { toast.error(getApiError(error, 'Could not respond to invitation')) }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Workspace alerts and reminders</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark all read
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No notifications.
          </CardContent>
        </Card>
      ) : (
        items.map((notification) => (
          <Card
            key={notification._id}
            className={notification.readAt ? 'opacity-70' : 'border-primary'}
          >
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {notification.metadata?.kind === 'project_invitation' && notification.metadata?.status === 'pending' && <><Button size="sm" onClick={() => respondToInvitation(notification, 'accepted')}>Accept</Button><Button size="sm" variant="outline" onClick={() => respondToInvitation(notification, 'rejected')}>Reject</Button></>}
                {notification.metadata?.kind === 'project_invitation' && notification.metadata?.status !== 'pending' && <span className="self-center text-sm capitalize text-muted-foreground">{notification.metadata.status}</span>}
                {!notification.readAt && notification.metadata?.kind !== 'project_invitation' && <Button size="sm" onClick={() => read(notification._id)}>Mark read</Button>}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
