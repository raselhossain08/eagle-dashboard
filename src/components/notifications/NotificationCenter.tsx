'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useMarkAsRead, useUnreadCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead: markAsReadInStore 
  } = useNotificationsStore();
  const { mutate: markAsRead } = useMarkAsRead();
  const { data: liveUnreadCount } = useUnreadCount();

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    markAsReadInStore(id);
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach(notification => {
      markAsRead(notification.id);
    });
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#notification-center') && !target.closest('#notification-bell')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" id="notification-center">
      {/* Notification Bell */}
      <Button
        id="notification-bell"
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {(unreadCount > 0 || (liveUnreadCount && liveUnreadCount > 0)) && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {Math.max(unreadCount, liveUnreadCount || 0)}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 sm:w-96 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {unreadNotifications.length} unread messages
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {unreadNotifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark all
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                        'hover:bg-muted/50 border',
                        !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      )}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <Badge 
                            variant="secondary" 
                            className="text-xs capitalize ml-2 flex-shrink-0"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/dashboard/notifications">
                    View all notifications
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}