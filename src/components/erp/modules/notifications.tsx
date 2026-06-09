'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Ship,
  DollarSign,
  Shield,
  FolderOpen,
  Settings,
  Eye,
  Trash2,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn, API_BASE_URL } from '@/lib/utils';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';

interface NotificationRecord {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null } | null;
}

const typeColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  info: { bg: 'bg-teal/10', text: 'text-teal', icon: Info },
  warning: { bg: 'bg-amber/10', text: 'text-amber', icon: AlertTriangle },
  error: { bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertCircle },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle2 },
};

const categoryIcons: Record<string, React.ElementType> = {
  shipment: Ship,
  payment: DollarSign,
  customs: Shield,
  document: FolderOpen,
  system: Settings,
};

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function NotificationsModule() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (filterType !== 'all') params.set('type', filterType);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      const res = await fetch(`/api/notifications?${params}`);
      const json = await res.json();
      if (json.data) {
        setNotifications(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silent
    }
  };

  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const criticalCount = notifications.filter((n) => n.type === 'error').length;

  const stats = [
    {
      title: 'Total Notifications',
      value: totalNotifications,
      icon: Bell,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    },
    {
      title: 'Unread',
      value: unreadCount,
      icon: BellOff,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
    },
    {
      title: 'Read',
      value: readCount,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Critical',
      value: criticalCount,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  // Group notifications by date
  const grouped = groupNotifications(notifications);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar + Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Notifications</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="shipment">Shipment</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark All Read
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-72 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications found</p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-5 py-2 bg-muted/40 sticky top-0 z-10">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {group}
                      </span>
                    </div>
                    <AnimatePresence>
                      {items.map((notification, i) => {
                        const typeConfig = typeColors[notification.type] || typeColors.info;
                        const TypeIcon = typeConfig.icon;
                        const CategoryIcon = categoryIcons[notification.category] || Settings;
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10, height: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.2 }}
                            className={cn(
                              'flex items-start gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors border-b border-border/50',
                              !notification.isRead && 'bg-teal/[0.03]'
                            )}
                          >
                            {/* Type Icon */}
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                typeConfig.bg
                              )}
                            >
                              <TypeIcon className={cn('h-4 w-4', typeConfig.text)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    'text-sm truncate',
                                    !notification.isRead ? 'font-semibold' : 'font-medium'
                                  )}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-teal shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-5 gap-1 px-1.5"
                                >
                                  <CategoryIcon className="h-2.5 w-2.5" />
                                  {formatCategory(notification.category)}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleMarkRead(notification.id)}
                                  title="Mark as read"
                                >
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDismiss(notification.id)}
                                title="Dismiss"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function groupNotifications(
  notifications: NotificationRecord[]
): Record<string, NotificationRecord[]> {
  const groups: Record<string, NotificationRecord[]> = {};
  const now = new Date();
  const thisWeekStart = subDays(now, 7);

  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    let group: string;
    if (isToday(date)) {
      group = 'Today';
    } else if (isYesterday(date)) {
      group = 'Yesterday';
    } else if (isAfter(date, thisWeekStart)) {
      group = 'This Week';
    } else {
      group = 'Earlier';
    }
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });

  const orderedGroups: Record<string, NotificationRecord[]> = {};
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
  order.forEach((key) => {
    if (groups[key]) orderedGroups[key] = groups[key];
  });

  return orderedGroups;
}
