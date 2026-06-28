'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Info,
  Loader2,
  Mail,
  Play,
  Settings,
  Shield,
  Ship,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow, isAfter, isToday, isYesterday, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useERPStore } from '@/lib/store';

const typeColors = {
  info: { bg: 'bg-teal/10', text: 'text-teal', icon: Info },
  warning: { bg: 'bg-amber/10', text: 'text-amber', icon: AlertTriangle },
  error: { bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertCircle },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle2 },
};

const categoryIcons = {
  shipment: Ship,
  eta: Ship,
  payment: DollarSign,
  customs: Shield,
  document: FolderOpen,
  system: Settings,
};

const formatCategory = (category) =>
  String(category || 'system').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function NotificationsModule() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [emailConfig, setEmailConfig] = useState({ configured: false });
  const [busyAction, setBusyAction] = useState('');
  const [message, setMessage] = useState('');
  const refreshNotificationUnreadCount = useERPStore((state) => state.refreshNotificationUnreadCount);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (filterType !== 'all') params.set('type', filterType);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      const response = await fetch(`/api/notifications?${params}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load notifications');
      setNotifications(json.data || []);
      await refreshNotificationUnreadCount();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterType, refreshNotificationUnreadCount]);

  const fetchEmailStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/email/status');
      const json = await response.json();
      setEmailConfig(json.data || { configured: false });
    } catch {
      setEmailConfig({ configured: false });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([fetchNotifications(), fetchEmailStatus()]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchEmailStatus, fetchNotifications]);

  const handleMarkRead = async (id) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    await refreshNotificationUnreadCount();
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    await refreshNotificationUnreadCount();
  };

  const handleDismiss = async (id) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((items) => items.filter((item) => item.id !== id));
    await refreshNotificationUnreadCount();
  };

  const testEmailConnection = async () => {
    try {
      setBusyAction('test');
      setMessage('');
      const response = await fetch('/api/notifications/email/test', { method: 'POST' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'SMTP connection failed');
      setEmailConfig(json.data);
      setMessage('Gmail SMTP connection verified.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyAction('');
    }
  };

  const runReminders = async () => {
    try {
      setBusyAction('reminders');
      setMessage('');
      const response = await fetch('/api/notifications/run-reminders', { method: 'POST' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Reminder scan failed');
      setMessage(`Reminder scan complete. ${json.data.created} notification(s) created.`);
      await fetchNotifications();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyAction('');
    }
  };

  const sendEmail = async (notification) => {
    const recipients = window.prompt(
      'Email recipients (comma separated)',
      notification.emailRecipients || ''
    );
    if (recipients === null) return;

    try {
      setBusyAction(notification.id);
      setMessage('');
      const response = await fetch(`/api/notifications/${notification.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Email could not be sent');
      setNotifications((items) =>
        items.map((item) => item.id === notification.id ? { ...item, ...json.data } : item)
      );
      setMessage('Notification email sent successfully.');
    } catch (error) {
      setMessage(error.message);
      await fetchNotifications();
    } finally {
      setBusyAction('');
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const sentCount = notifications.filter((item) => item.emailStatus === 'sent').length;
  const highPriorityCount = notifications.filter((item) =>
    ['high', 'critical'].includes(item.priority)
  ).length;
  const stats = [
    { title: 'Total Notifications', value: notifications.length, icon: Bell, color: 'text-teal', bg: 'bg-teal/10' },
    { title: 'Unread', value: unreadCount, icon: BellOff, color: 'text-amber', bg: 'bg-amber/10' },
    { title: 'High Priority', value: highPriorityCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Emails Sent', value: sentCount, icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ];
  const grouped = groupNotifications(notifications);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">{stat.value}</p>
                </div>
                <div className={cn('rounded-lg p-2', stat.bg)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', emailConfig.configured ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
              <Mail className={cn('h-4 w-4', emailConfig.configured ? 'text-emerald-600' : 'text-red-500')} />
            </div>
            <div>
              <p className="text-sm font-semibold">Gmail SMTP</p>
              <p className="text-xs text-muted-foreground">
                {emailConfig.configured
                  ? `${emailConfig.host}:${emailConfig.port} configured${emailConfig.connected ? ' and connected' : ''}`
                  : 'Add SMTP_USER and SMTP_PASS to backend/.env'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={testEmailConnection} disabled={!emailConfig.configured || busyAction === 'test'}>
              {busyAction === 'test' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Mail className="h-3.5 w-3.5 mr-1" />}
              Test SMTP
            </Button>
            <Button variant="outline" size="sm" onClick={runReminders} disabled={busyAction === 'reminders'}>
              {busyAction === 'reminders' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1" />}
              Run ETA & Document Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {message}
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Notifications</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="shipment">Shipment</SelectItem>
                  <SelectItem value="eta">ETA</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="customs">Customs</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleMarkAllRead} disabled={!unreadCount}>
                <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[620px]">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-teal" /></div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No notifications found</p>
              </div>
            ) : Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="px-5 py-2 bg-muted/40 sticky top-0 z-10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group}</span>
                </div>
                <AnimatePresence>
                  {items.map((notification, index) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      index={index}
                      busy={busyAction === notification.id}
                      onMarkRead={handleMarkRead}
                      onSendEmail={sendEmail}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationRow({ notification, index, busy, onMarkRead, onSendEmail, onDismiss }) {
  const typeConfig = typeColors[notification.type] || typeColors.info;
  const TypeIcon = typeConfig.icon;
  const CategoryIcon = categoryIcons[notification.category] || Settings;
  const emailStatusColor = notification.emailStatus === 'sent'
    ? 'text-emerald-600'
    : notification.emailStatus === 'failed'
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn('flex items-start gap-3 px-5 py-3.5 border-b border-border/50', !notification.isRead && 'bg-teal/[0.03]')}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', typeConfig.bg)}>
        <TypeIcon className={cn('h-4 w-4', typeConfig.text)} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm', !notification.isRead ? 'font-semibold' : 'font-medium')}>{notification.title}</p>
          {!notification.isRead && <div className="h-2 w-2 rounded-full bg-teal" />}
          {['high', 'critical'].includes(notification.priority) && <Badge variant="destructive" className="h-5 text-[9px]">High Priority</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant="outline" className="text-[9px] h-5 gap-1 px-1.5">
            <CategoryIcon className="h-2.5 w-2.5" /> {formatCategory(notification.category)}
          </Badge>
          {notification.emailEnabled && (
            <span className={cn('text-[10px] flex items-center gap-1', emailStatusColor)} title={notification.emailError || ''}>
              <Mail className="h-3 w-3" /> Email {formatCategory(notification.emailStatus)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        {notification.emailError && <p className="text-[10px] text-red-500">{notification.emailError}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => onSendEmail(notification)} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 mr-1" />}
          {notification.emailStatus === 'sent' ? 'Send Again' : 'Send Email'}
        </Button>
        {!notification.isRead && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onMarkRead(notification.id)} title="Mark as read">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDismiss(notification.id)} title="Dismiss">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  );
}

function groupNotifications(notifications) {
  const groups = {};
  const weekStart = subDays(new Date(), 7);
  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    const group = isToday(date)
      ? 'Today'
      : isYesterday(date)
        ? 'Yesterday'
        : isAfter(date, weekStart) ? 'This Week' : 'Earlier';
    (groups[group] ||= []).push(notification);
  }
  return Object.fromEntries(
    ['Today', 'Yesterday', 'This Week', 'Earlier']
      .filter((key) => groups[key])
      .map((key) => [key, groups[key]])
  );
}
