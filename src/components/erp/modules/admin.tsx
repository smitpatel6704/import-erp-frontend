'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Users,
  Activity,
  Server,
  Database,
  Clock,
  HardDrive,
  Wifi,
  WifiOff,
  Plus,
  Search,
  Shield,
  Cpu,
  Globe,
  Mail,
  Building2,
  ToggleLeft,
  Ship,
  Trash2,
  Box,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityRecord {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null; role: string | null } | null;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  manager: 'bg-amber/10 text-amber border-amber/20',
  user: 'bg-teal/10 text-teal border-teal/20',
  viewer: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const actionColors: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  update: 'bg-teal/10 text-teal border-teal/20',
  delete: 'bg-red-500/10 text-red-500 border-red-500/20',
  login: 'bg-amber/10 text-amber border-amber/20',
  view: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  export: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

const systemInfo = [
  { label: 'Version', value: 'v2.4.1', icon: Cpu, color: 'text-teal' },
  { label: 'Database', value: 'SQLite / Prisma', icon: Database, color: 'text-amber' },
  { label: 'Uptime', value: '14d 7h 32m', icon: Clock, color: 'text-emerald-600' },
  { label: 'Storage Used', value: '2.4 GB / 10 GB', icon: HardDrive, color: 'text-orange-500' },
];

const apiEndpoints = [
  { name: 'Shipments API', status: 'healthy', latency: '45ms' },
  { name: 'Customs API', status: 'healthy', latency: '38ms' },
  { name: 'Finance API', status: 'healthy', latency: '52ms' },
  { name: 'Documents API', status: 'degraded', latency: '230ms' },
  { name: 'Notifications API', status: 'healthy', latency: '29ms' },
  { name: 'Auth API', status: 'healthy', latency: '18ms' },
];

// Mock users for display
const mockUsers: UserRecord[] = [
  { id: '1', email: 'admin@importerp.com', name: 'John Admin', role: 'admin', department: 'IT', isActive: true, lastLoginAt: new Date().toISOString(), createdAt: '2024-01-15T00:00:00Z' },
  { id: '2', email: 'sarah@importerp.com', name: 'Sarah Manager', role: 'manager', department: 'Operations', isActive: true, lastLoginAt: new Date(Date.now() - 3600000).toISOString(), createdAt: '2024-02-01T00:00:00Z' },
  { id: '3', email: 'mike@importerp.com', name: 'Mike Johnson', role: 'user', department: 'Logistics', isActive: true, lastLoginAt: new Date(Date.now() - 7200000).toISOString(), createdAt: '2024-02-15T00:00:00Z' },
  { id: '4', email: 'lisa@importerp.com', name: 'Lisa Chen', role: 'user', department: 'Finance', isActive: true, lastLoginAt: new Date(Date.now() - 86400000).toISOString(), createdAt: '2024-03-01T00:00:00Z' },
  { id: '5', email: 'tom@importerp.com', name: 'Tom Viewer', role: 'viewer', department: 'Management', isActive: false, lastLoginAt: new Date(Date.now() - 604800000).toISOString(), createdAt: '2024-03-15T00:00:00Z' },
];

export function AdminModule() {
  const [mainTab, setMainTab] = useState('admin');
  const [adminTab, setAdminTab] = useState('users');
  const [addUserOpen, setAddUserOpen] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="h-10 mb-4 bg-transparent border-b border-border/50 rounded-none w-full justify-start space-x-2">
            <TabsTrigger 
              value="admin" 
              className="text-sm px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal rounded-none data-[state=active]:shadow-none"
            >
              <Shield className="h-4 w-4 mr-2" /> Admin Settings
            </TabsTrigger>
            <TabsTrigger 
              value="shipment" 
              className="text-sm px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal rounded-none data-[state=active]:shadow-none"
            >
              <Ship className="h-4 w-4 mr-2" /> Shipment Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="mt-0">
            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <TabsList className="h-9">
                <TabsTrigger value="users" className="text-xs px-4">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Users
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs px-4">
                  <Server className="h-3.5 w-3.5 mr-1.5" /> System
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-xs px-4">
                  <Activity className="h-3.5 w-3.5 mr-1.5" /> Audit Log
                </TabsTrigger>
                <TabsTrigger value="config" className="text-xs px-4">
                  <Settings className="h-3.5 w-3.5 mr-1.5" /> Configuration
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-4">
                <UsersTab onAddUser={() => setAddUserOpen(true)} />
              </TabsContent>
              <TabsContent value="system" className="mt-4">
                <SystemTab />
              </TabsContent>
              <TabsContent value="audit" className="mt-4">
                <AuditLogTab />
              </TabsContent>
              <TabsContent value="config" className="mt-4">
                <ConfigurationTab />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="shipment" className="mt-0">
            <ShipmentSettingsTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <AddUserForm onClose={() => setAddUserOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersTab({ onAddUser }: { onAddUser: () => void }) {
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: mockUsers.length, color: 'text-teal', bgColor: 'bg-teal/10' },
          { label: 'Active', value: mockUsers.filter((u) => u.isActive).length, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
          { label: 'Admins', value: mockUsers.filter((u) => u.role === 'admin').length, color: 'text-red-500', bgColor: 'bg-red-500/10' },
          { label: 'Inactive', value: mockUsers.filter((u) => !u.isActive).length, color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <Users className={cn('h-4 w-4', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">User Management</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-48 pl-8 text-xs"
                  />
                </div>
                <Button size="sm" className="h-8 text-xs" onClick={onAddUser}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 text-teal text-[10px] font-semibold">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-xs font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] font-semibold', roleColors[user.role] || '')}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            user.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          )}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.lastLoginAt
                          ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="space-y-6">
      {/* System Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemInfo.map((info, i) => (
          <motion.div
            key={info.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {info.label}
                    </p>
                    <p className="text-sm font-bold">{info.value}</p>
                  </div>
                  <div className="rounded-lg p-2 bg-muted/50">
                    <info.icon className={cn('h-4 w-4', info.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* API Health Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">API Health Status</CardTitle>
            <CardDescription className="text-xs">Real-time endpoint monitoring</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {apiEndpoints.map((api, i) => (
                <motion.div
                  key={api.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.2 }}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        api.status === 'healthy' ? 'bg-emerald-500/10' : 'bg-amber/10'
                      )}
                    >
                      {api.status === 'healthy' ? (
                        <Wifi className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-amber" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{api.name}</p>
                      <p className="text-[10px] text-muted-foreground">Latency: {api.latency}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      api.status === 'healthy'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-amber/10 text-amber border-amber/20'
                    )}
                  >
                    {api.status === 'healthy' ? 'Healthy' : 'Degraded'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional System Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Environment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Runtime', value: 'Node.js 20.x' },
                { label: 'Framework', value: 'Next.js 16' },
                { label: 'ORM', value: 'Prisma 6.x' },
                { label: 'Region', value: 'US-East-1' },
                { label: 'Last Deploy', value: format(new Date(Date.now() - 86400000), 'MMM dd, yyyy HH:mm') },
                { label: 'Build', value: '#2847' },
              ].map((item) => (
                <div key={item.label}>
                  <Label className="text-xs text-muted-foreground">{item.label}</Label>
                  <p className="text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function AuditLogTab() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (filterAction !== 'all') params.set('action', filterAction);
      if (filterEntity !== 'all') params.set('entity', filterEntity);
      const res = await fetch(`/api/activities?${params}`);
      const json = await res.json();
      if (json.data) setActivities(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">Audit Log</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEntity} onValueChange={setFilterEntity}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="shipment">Shipment</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Entity</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                    <TableHead className="text-xs">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-accent/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/10 text-teal text-[9px] font-semibold">
                              {activity.user?.name
                                ? activity.user.name.split(' ').map((n) => n[0]).join('')
                                : '?'}
                            </div>
                            <span className="text-xs font-medium">
                              {activity.user?.name || 'System'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px]', actionColors[activity.action] || '')}
                          >
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {activity.entity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {activity.details || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ConfigurationTab() {
  const [config, setConfig] = useState({
    companyName: 'ImportERP International',
    defaultCurrency: 'USD',
    timezone: 'America/New_York',
    emailFrom: 'notifications@importerp.com',
    emailSmtp: 'smtp.importerp.com',
    emailPort: '587',
    enableNotifications: true,
    enableAutoBackup: true,
    enableTwoFactor: false,
    enableAuditLog: true,
    enableDarkMode: true,
    enableApiAccess: true,
  });

  return (
    <div className="space-y-6">
      {/* System Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal" />
              Company Settings
            </CardTitle>
            <CardDescription className="text-xs">General company and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Company Name</Label>
                <Input
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Default Currency</Label>
                <Select
                  value={config.defaultCurrency}
                  onValueChange={(v) => setConfig({ ...config, defaultCurrency: v })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Timezone</Label>
                <Select
                  value={config.timezone}
                  onValueChange={(v) => setConfig({ ...config, timezone: v })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Asia/Shanghai">China Standard Time (CST)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Language</Label>
                <Input value="English (US)" disabled className="h-8 text-xs mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber" />
              Email Settings
            </CardTitle>
            <CardDescription className="text-xs">Configure email notifications and SMTP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">From Email</Label>
                <Input
                  value={config.emailFrom}
                  onChange={(e) => setConfig({ ...config, emailFrom: e.target.value })}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">SMTP Server</Label>
                <Input
                  value={config.emailSmtp}
                  onChange={(e) => setConfig({ ...config, emailSmtp: e.target.value })}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">SMTP Port</Label>
                <Input
                  value={config.emailPort}
                  onChange={(e) => setConfig({ ...config, emailPort: e.target.value })}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Toggles */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-orange-500" />
              Feature Toggles
            </CardTitle>
            <CardDescription className="text-xs">Enable or disable system features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'enableNotifications', label: 'Email Notifications', desc: 'Send email alerts for important events' },
                { key: 'enableAutoBackup', label: 'Auto Backup', desc: 'Automatically backup database daily' },
                { key: 'enableTwoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all users' },
                { key: 'enableAuditLog', label: 'Audit Logging', desc: 'Track all user actions and system events' },
                { key: 'enableDarkMode', label: 'Dark Mode Support', desc: 'Allow users to switch to dark theme' },
                { key: 'enableApiAccess', label: 'API Access', desc: 'Enable external API access with API keys' },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                  <Switch
                    checked={config[feature.key as keyof typeof config] as boolean}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, [feature.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="text-xs">
          <Shield className="h-3.5 w-3.5 mr-1.5" /> Save Configuration
        </Button>
      </div>
    </div>
  );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Full Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Email Address</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@importerp.com"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger className="h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Department</Label>
          <Input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Operations"
            className="h-8 text-xs mt-1"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Add User
        </Button>
      </DialogFooter>
    </form>
  );
}

function ConfigurableList({ category, title, icon: Icon }: { category: string, title: string, icon: React.ElementType }) {
  const [options, setOptions] = useState<any[]>([]);
  const [newValue, setNewValue] = useState('');

  const fetchOptions = useCallback(async () => {
    try {
      const res = await fetch(`/api/settings/options?category=${category}`);
      const json = await res.json();
      if (json.data) setOptions(json.data);
    } catch (error) {
      console.error(error);
    }
  }, [category]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      await fetch('/api/settings/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, value: newValue, label: newValue }),
      });
      setNewValue('');
      fetchOptions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/settings/options/${id}`, { method: 'DELETE' });
      fetchOptions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4 text-teal" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs">Manage dropdown options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Add new...`}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm" className="h-8 text-xs shrink-0">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {options.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No options found.</p>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between p-2 border border-border/50 rounded-md text-xs bg-muted/20"
                >
                  <span className="font-medium">{opt.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(opt.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ShipmentSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConfigurableList category="shipping_line" title="Shipping Lines" icon={Ship} />
        <ConfigurableList category="container_size" title="Container Sizes" icon={Box} />
        <ConfigurableList category="container_type" title="Container Types" icon={Box} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <ShipmentDocumentChecklistManagement />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <ExporterCompanyManagement />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-orange-500" />
              Workflow Automations
            </CardTitle>
            <CardDescription className="text-xs">Manage rules for shipment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'autoAssignTracking', label: 'Auto-Assign Tracking Numbers', desc: 'Automatically generate tracking IDs for new shipments' },
                { key: 'requireDocumentsForClearance', label: 'Require Documents for Customs', desc: 'Block customs clearance status until all documents are uploaded' },
                { key: 'notifyOnStatusChange', label: 'Status Change Notifications', desc: 'Notify assigned users when a shipment changes status' },
                { key: 'notifyOnDelay', label: 'Delay Alerts', desc: 'Send alerts when a shipment misses its ETA' },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
function ExporterCompanyManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', mobile: '' });

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/exporter-companies');
      const json = await res.json();
      if (json.data) setCompanies(json.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/exporter-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', contactPerson: '', email: '', mobile: '' });
      setOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/exporter-companies/${id}`, { method: 'DELETE' });
      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal" />
              Exporter Companies
            </CardTitle>
            <CardDescription className="text-xs">Manage list of export partners</CardDescription>
          </div>
          <Button onClick={() => setOpen(true)} size="sm" className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Exporter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] h-8 font-semibold">Company Name</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold">Contact</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">No exporter companies found.</TableCell>
                  </TableRow>
                ) : (
                  companies.map((c) => (
                    <TableRow key={c.id} className="group">
                      <TableCell className="py-2">
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.email || 'No email'}</p>
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-[10px]">{c.contactPerson || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{c.mobile || ''}</p>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Exporter Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Company Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-xs"
                placeholder="ABC Exports Ltd"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Contact Person</Label>
              <Input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="contact@abc.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Mobile</Label>
                <Input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={handleAdd} size="sm" className="h-8 text-xs" disabled={loading}>
              {loading ? 'Adding...' : 'Add Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function ShipmentDocumentChecklistManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    isRequired: true,
    shipmentStage: 'clearance',
    expiryRequired: false,
    allowedFileTypes: 'pdf,image',
    isActive: true
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/shipment-documents/checklist-types');
      const json = await res.json();
      if (json.data) setItems(json.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/shipment-documents/checklist-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({
        name: '',
        isRequired: true,
        shipmentStage: 'clearance',
        expiryRequired: false,
        allowedFileTypes: 'pdf,image',
        isActive: true
      });
      setOpen(false);
      fetchItems();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/shipment-documents/checklist-types/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal" />
              Shipment Document Checklist
            </CardTitle>
            <CardDescription className="text-xs">Define required documents for shipment workflow</CardDescription>
          </div>
          <Button onClick={() => setOpen(true)} size="sm" className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Requirement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] h-8 font-semibold">Document Name</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold">Requirement</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold">Stage</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold">Expiry</TableHead>
                  <TableHead className="text-[10px] h-8 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-xs text-muted-foreground">No checklist requirements defined.</TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="py-2">
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.allowedFileTypes}</p>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={cn("text-[9px] h-4", item.isRequired ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20")}>
                          {item.isRequired ? 'Required' : 'Optional'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="secondary" className="text-[9px] h-4 uppercase tracking-tighter">
                          {item.shipmentStage}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-[10px]">
                        {item.expiryRequired ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Checklist Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Document Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-xs"
                placeholder="e.g. Bill of Lading"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Shipment Stage</Label>
                <Select value={form.shipmentStage} onValueChange={(v) => setForm({ ...form, shipmentStage: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="arrival">Arrival</SelectItem>
                    <SelectItem value="clearance">Customs Clearance</SelectItem>
                    <SelectItem value="delivery">Final Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Allowed File Types</Label>
                <Input
                  value={form.allowedFileTypes}
                  onChange={(e) => setForm({ ...form, allowedFileTypes: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="pdf,image,excel"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2 border border-border/50 rounded-md">
              <div>
                <p className="text-[11px] font-medium">Required Document</p>
                <p className="text-[10px] text-muted-foreground">Mandatory for shipment completion</p>
              </div>
              <Switch 
                checked={form.isRequired} 
                onCheckedChange={(checked) => setForm({ ...form, isRequired: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-2 border border-border/50 rounded-md">
              <div>
                <p className="text-[11px] font-medium">Expiry Date Required</p>
                <p className="text-[10px] text-muted-foreground">Track document expiration</p>
              </div>
              <Switch 
                checked={form.expiryRequired} 
                onCheckedChange={(checked) => setForm({ ...form, expiryRequired: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={handleAdd} size="sm" className="h-8 text-xs" disabled={loading}>
              {loading ? 'Adding...' : 'Add Requirement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
