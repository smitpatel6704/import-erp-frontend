'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Activity, Server, Database, Clock, HardDrive, Wifi, WifiOff, Plus, Search, Shield, Cpu, Mail, Building2, ToggleLeft, Ship, Trash2, Box, FileText, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ImporterCompanyManagement } from './companies';
import UserManagement from './user-management';
const roleColors = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    manager: 'bg-amber/10 text-amber border-amber/20',
    user: 'bg-teal/10 text-teal border-teal/20',
    viewer: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};
const actionColors = {
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
const mockUsers = [
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: _jsxs(Tabs, { value: mainTab, onValueChange: setMainTab, children: [_jsxs(TabsList, { className: "h-10 mb-4 bg-transparent border-b border-border/50 rounded-none w-full justify-start space-x-2", children: [_jsxs(TabsTrigger, { value: "admin", className: "text-sm px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal rounded-none data-[state=active]:shadow-none", children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), " Admin Settings"] }), _jsxs(TabsTrigger, { value: "shipment", className: "text-sm px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal rounded-none data-[state=active]:shadow-none", children: [_jsx(Ship, { className: "h-4 w-4 mr-2" }), " Shipment Settings"] })] }), _jsx(TabsContent, { value: "admin", className: "mt-0", children: _jsxs(Tabs, { value: adminTab, onValueChange: setAdminTab, children: [_jsxs(TabsList, { className: "h-9", children: [_jsxs(TabsTrigger, { value: "users", className: "text-xs px-4", children: [_jsx(Users, { className: "h-3.5 w-3.5 mr-1.5" }), " Users"] }), _jsxs(TabsTrigger, { value: "system", className: "text-xs px-4", children: [_jsx(Server, { className: "h-3.5 w-3.5 mr-1.5" }), " System"] }), _jsxs(TabsTrigger, { value: "audit", className: "text-xs px-4", children: [_jsx(Activity, { className: "h-3.5 w-3.5 mr-1.5" }), " Audit Log"] }), _jsxs(TabsTrigger, { value: "config", className: "text-xs px-4", children: [_jsx(Settings, { className: "h-3.5 w-3.5 mr-1.5" }), " Configuration"] })] }), _jsx(TabsContent, { value: "users", className: "mt-4", children: _jsx(UserManagement, {}) }), _jsx(TabsContent, { value: "system", className: "mt-4", children: _jsx(SystemTab, {}) }), _jsx(TabsContent, { value: "audit", className: "mt-4", children: _jsx(AuditLogTab, {}) }), _jsx(TabsContent, { value: "config", className: "mt-4", children: _jsx(ConfigurationTab, {}) })] }) }), _jsx(TabsContent, { value: "shipment", className: "mt-0", children: _jsx(ShipmentSettingsTab, {}) })] }) })] }));
}
function UsersTab({ onAddUser }) {
    const [search, setSearch] = useState('');
    const filteredUsers = mockUsers.filter((u) => {
        var _a;
        return u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            ((_a = u.department) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase()));
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                    { label: 'Total Users', value: mockUsers.length, color: 'text-teal', bgColor: 'bg-teal/10' },
                    { label: 'Active', value: mockUsers.filter((u) => u.isActive).length, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
                    { label: 'Admins', value: mockUsers.filter((u) => u.role === 'admin').length, color: 'text-red-500', bgColor: 'bg-red-500/10' },
                    { label: 'Inactive', value: mockUsers.filter((u) => !u.isActive).length, color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
                ].map((stat, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { className: "shadow-sm", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] text-muted-foreground uppercase tracking-wider", children: stat.label }), _jsx("p", { className: "text-xl font-bold mt-1", children: stat.value })] }), _jsx("div", { className: cn('rounded-lg p-2', stat.bgColor), children: _jsx(Users, { className: cn('h-4 w-4', stat.color) }) })] }) }) }) }, stat.label))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "User Management" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), _jsx(Input, { placeholder: "Search users...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-8 w-48 pl-8 text-xs" })] }), _jsxs(Button, { size: "sm", className: "h-8 text-xs", onClick: onAddUser, children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add User"] })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "Name" }), _jsx(TableHead, { className: "text-xs", children: "Email" }), _jsx(TableHead, { className: "text-xs", children: "Role" }), _jsx(TableHead, { className: "text-xs", children: "Department" }), _jsx(TableHead, { className: "text-xs", children: "Status" }), _jsx(TableHead, { className: "text-xs", children: "Last Login" })] }) }), _jsx(TableBody, { children: filteredUsers.map((user) => (_jsxs(TableRow, { className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 text-teal text-[10px] font-semibold", children: user.name.split(' ').map((n) => n[0]).join('') }), _jsx("span", { className: "text-xs font-medium", children: user.name })] }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: user.email }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px] font-semibold', roleColors[user.role] || ''), children: user.role.charAt(0).toUpperCase() + user.role.slice(1) }) }), _jsx(TableCell, { className: "text-xs", children: user.department || '-' }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px]', user.isActive
                                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'), children: user.isActive ? 'Active' : 'Inactive' }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: user.lastLoginAt
                                                            ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                                                            : 'Never' })] }, user.id))) })] }) }) })] }) })] }));
}
function SystemTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: systemInfo.map((info, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.3 }, children: _jsx(Card, { className: "shadow-sm", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wider", children: info.label }), _jsx("p", { className: "text-sm font-bold", children: info.value })] }), _jsx("div", { className: "rounded-lg p-2 bg-muted/50", children: _jsx(info.icon, { className: cn('h-4 w-4', info.color) }) })] }) }) }) }, info.label))) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "API Health Status" }), _jsx(CardDescription, { className: "text-xs", children: "Real-time endpoint monitoring" })] }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "divide-y divide-border", children: apiEndpoints.map((api, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.3 + i * 0.05, duration: 0.2 }, className: "flex items-center justify-between px-5 py-3.5 hover:bg-accent/30 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-lg', api.status === 'healthy' ? 'bg-emerald-500/10' : 'bg-amber/10'), children: api.status === 'healthy' ? (_jsx(Wifi, { className: "h-4 w-4 text-emerald-600" })) : (_jsx(WifiOff, { className: "h-4 w-4 text-amber" })) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium", children: api.name }), _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["Latency: ", api.latency] })] })] }), _jsx(Badge, { variant: "outline", className: cn('text-[10px]', api.status === 'healthy'
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                : 'bg-amber/10 text-amber border-amber/20'), children: api.status === 'healthy' ? 'Healthy' : 'Degraded' })] }, api.name))) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Environment Details" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                    { label: 'Runtime', value: 'Node.js 20.x' },
                                    { label: 'Framework', value: 'Next.js 16' },
                                    { label: 'ORM', value: 'Prisma 6.x' },
                                    { label: 'Region', value: 'US-East-1' },
                                    { label: 'Last Deploy', value: format(new Date(Date.now() - 86400000), 'MMM dd, yyyy HH:mm') },
                                    { label: 'Build', value: '#2847' },
                                ].map((item) => (_jsxs("div", { children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: item.label }), _jsx("p", { className: "text-sm font-medium mt-0.5", children: item.value })] }, item.label))) }) })] }) })] }));
}
function AuditLogTab() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('all');
    const [filterEntity, setFilterEntity] = useState('all');
    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ limit: '50' });
            if (filterAction !== 'all')
                params.set('action', filterAction);
            if (filterEntity !== 'all')
                params.set('entity', filterEntity);
            const res = await fetch(`/api/activities?${params}`);
            const json = await res.json();
            if (json.data)
                setActivities(json.data);
        }
        catch (_a) {
            // silent
        }
        finally {
            setLoading(false);
        }
    }, [filterAction, filterEntity]);
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);
    return (_jsx("div", { className: "space-y-4", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Audit Log" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: filterAction, onValueChange: setFilterAction, children: [_jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: _jsx(SelectValue, { placeholder: "Action" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Actions" }), _jsx(SelectItem, { value: "create", children: "Create" }), _jsx(SelectItem, { value: "update", children: "Update" }), _jsx(SelectItem, { value: "delete", children: "Delete" }), _jsx(SelectItem, { value: "login", children: "Login" }), _jsx(SelectItem, { value: "view", children: "View" }), _jsx(SelectItem, { value: "export", children: "Export" })] })] }), _jsxs(Select, { value: filterEntity, onValueChange: setFilterEntity, children: [_jsx(SelectTrigger, { className: "h-8 w-32 text-xs", children: _jsx(SelectValue, { placeholder: "Entity" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Entities" }), _jsx(SelectItem, { value: "shipment", children: "Shipment" }), _jsx(SelectItem, { value: "container", children: "Container" }), _jsx(SelectItem, { value: "invoice", children: "Invoice" }), _jsx(SelectItem, { value: "customs", children: "Customs" }), _jsx(SelectItem, { value: "document", children: "Document" }), _jsx(SelectItem, { value: "user", children: "User" })] })] })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto max-h-[600px] overflow-y-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-xs", children: "User" }), _jsx(TableHead, { className: "text-xs", children: "Action" }), _jsx(TableHead, { className: "text-xs", children: "Entity" }), _jsx(TableHead, { className: "text-xs", children: "Details" }), _jsx(TableHead, { className: "text-xs", children: "Timestamp" })] }) }), _jsx(TableBody, { children: loading ? (Array.from({ length: 8 }).map((_, i) => (_jsx(TableRow, { children: Array.from({ length: 5 }).map((_, j) => (_jsx(TableCell, { children: _jsx("div", { className: "h-4 w-24 bg-muted animate-pulse rounded" }) }, j))) }, i)))) : activities.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground text-sm", children: "No activity logs found" }) })) : (activities.map((activity) => {
                                            var _a, _b;
                                            return (_jsxs(TableRow, { className: "hover:bg-accent/30 transition-colors", children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-teal/10 text-teal text-[9px] font-semibold", children: ((_a = activity.user) === null || _a === void 0 ? void 0 : _a.name)
                                                                        ? activity.user.name.split(' ').map((n) => n[0]).join('')
                                                                        : '?' }), _jsx("span", { className: "text-xs font-medium", children: ((_b = activity.user) === null || _b === void 0 ? void 0 : _b.name) || 'System' })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: cn('text-[10px]', actionColors[activity.action] || ''), children: activity.action.charAt(0).toUpperCase() + activity.action.slice(1) }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", className: "text-[10px]", children: activity.entity }) }), _jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[200px] truncate", children: activity.details || '-' }), _jsx(TableCell, { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) })] }, activity.id));
                                        })) })] }) }) })] }) }) }));
}
function ConfigurationTab() {
    const [config, setConfig] = useState({
        companyName: 'Nexport ERP International',
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4 text-teal" }), "Company Settings"] }), _jsx(CardDescription, { className: "text-xs", children: "General company and regional settings" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Company Name" }), _jsx(Input, { value: config.companyName, onChange: (e) => setConfig(Object.assign(Object.assign({}, config), { companyName: e.target.value })), className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Default Currency" }), _jsxs(Select, { value: config.defaultCurrency, onValueChange: (v) => setConfig(Object.assign(Object.assign({}, config), { defaultCurrency: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-xs mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD - US Dollar" }), _jsx(SelectItem, { value: "EUR", children: "EUR - Euro" }), _jsx(SelectItem, { value: "GBP", children: "GBP - British Pound" }), _jsx(SelectItem, { value: "INR", children: "INR - Indian Rupee" }), _jsx(SelectItem, { value: "CNY", children: "CNY - Chinese Yuan" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Timezone" }), _jsxs(Select, { value: config.timezone, onValueChange: (v) => setConfig(Object.assign(Object.assign({}, config), { timezone: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-xs mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "America/New_York", children: "Eastern Time (ET)" }), _jsx(SelectItem, { value: "America/Chicago", children: "Central Time (CT)" }), _jsx(SelectItem, { value: "America/Los_Angeles", children: "Pacific Time (PT)" }), _jsx(SelectItem, { value: "Europe/London", children: "Greenwich Mean Time (GMT)" }), _jsx(SelectItem, { value: "Asia/Shanghai", children: "China Standard Time (CST)" }), _jsx(SelectItem, { value: "Asia/Kolkata", children: "India Standard Time (IST)" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Language" }), _jsx(Input, { value: "English (US)", disabled: true, className: "h-8 text-xs mt-1" })] })] }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4 text-amber" }), "Email Settings"] }), _jsx(CardDescription, { className: "text-xs", children: "Configure email notifications and SMTP" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "From Email" }), _jsx(Input, { value: config.emailFrom, onChange: (e) => setConfig(Object.assign(Object.assign({}, config), { emailFrom: e.target.value })), className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "SMTP Server" }), _jsx(Input, { value: config.emailSmtp, onChange: (e) => setConfig(Object.assign(Object.assign({}, config), { emailSmtp: e.target.value })), className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "SMTP Port" }), _jsx(Input, { value: config.emailPort, onChange: (e) => setConfig(Object.assign(Object.assign({}, config), { emailPort: e.target.value })), className: "h-8 text-xs mt-1" })] })] }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(ToggleLeft, { className: "h-4 w-4 text-orange-500" }), "Feature Toggles"] }), _jsx(CardDescription, { className: "text-xs", children: "Enable or disable system features" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                    { key: 'enableNotifications', label: 'Email Notifications', desc: 'Send email alerts for important events' },
                                    { key: 'enableAutoBackup', label: 'Auto Backup', desc: 'Automatically backup database daily' },
                                    { key: 'enableTwoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all users' },
                                    { key: 'enableAuditLog', label: 'Audit Logging', desc: 'Track all user actions and system events' },
                                    { key: 'enableDarkMode', label: 'Dark Mode Support', desc: 'Allow users to switch to dark theme' },
                                    { key: 'enableApiAccess', label: 'API Access', desc: 'Enable external API access with API keys' },
                                ].map((feature) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-border/50 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: feature.label }), _jsx("p", { className: "text-xs text-muted-foreground", children: feature.desc })] }), _jsx(Switch, { checked: config[feature.key], onCheckedChange: (checked) => setConfig(Object.assign(Object.assign({}, config), { [feature.key]: checked })) })] }, feature.key))) }) })] }) }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { className: "text-xs", children: [_jsx(Shield, { className: "h-3.5 w-3.5 mr-1.5" }), " Save Configuration"] }) })] }));
}
function AddUserForm({ onClose }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'user',
        department: '',
    });
    return (_jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            onClose();
        }, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Full Name" }), _jsx(Input, { value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })), placeholder: "John Doe", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx(Label, { className: "text-xs", children: "Email Address" }), _jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { email: e.target.value })), placeholder: "john@importerp.com", className: "h-8 text-xs mt-1" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Role" }), _jsxs(Select, { value: form.role, onValueChange: (v) => setForm(Object.assign(Object.assign({}, form), { role: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-xs mt-1", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "manager", children: "Manager" }), _jsx(SelectItem, { value: "user", children: "User" }), _jsx(SelectItem, { value: "viewer", children: "Viewer" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-xs", children: "Department" }), _jsx(Input, { value: form.department, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { department: e.target.value })), placeholder: "Operations", className: "h-8 text-xs mt-1" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", size: "sm", children: "Add User" })] })] }));
}
function ConfigurableList({ category, title, icon: Icon }) {
    const [options, setOptions] = useState([]);
    const [newValue, setNewValue] = useState('');
    const fetchOptions = useCallback(async () => {
        try {
            const res = await fetch(`/api/settings/options?category=${category}`);
            const json = await res.json();
            if (json.data)
                setOptions(json.data);
        }
        catch (error) {
            console.error(error);
        }
    }, [category]);
    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);
    const handleAdd = async () => {
        if (!newValue.trim())
            return;
        try {
            await fetch('/api/settings/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, value: newValue, label: newValue }),
            });
            setNewValue('');
            fetchOptions();
        }
        catch (error) {
            console.error(error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/settings/options/${id}`, { method: 'DELETE' });
            fetchOptions();
        }
        catch (error) {
            console.error(error);
        }
    };
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: _jsxs(Card, { className: "shadow-sm h-full", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Icon, { className: "h-4 w-4 text-teal" }), title] }), _jsx(CardDescription, { className: "text-xs", children: "Manage dropdown options" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx(Input, { value: newValue, onChange: (e) => setNewValue(e.target.value), placeholder: `Add new...`, className: "h-8 text-xs", onKeyDown: (e) => e.key === 'Enter' && handleAdd() }), _jsxs(Button, { onClick: handleAdd, size: "sm", className: "h-8 text-xs shrink-0", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add"] })] }), _jsx("div", { className: "space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2", children: options.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground text-center py-4", children: "No options found." })) : (options.map((opt) => (_jsxs("div", { className: "flex items-center justify-between p-2 border border-border/50 rounded-md text-xs bg-muted/20", children: [_jsx("span", { className: "font-medium", children: opt.label }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10", onClick: () => handleDelete(opt.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, opt.id)))) })] })] }) }));
}
function ShipmentSettingsTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(ConfigurableList, { category: "shipping_line", title: "Shipping Lines", icon: Ship }), _jsx(ConfigurableList, { category: "container_size", title: "Container Sizes", icon: Box }), _jsx(ConfigurableList, { category: "container_type", title: "Container Types", icon: Box })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-1 gap-6", children: _jsx(ShipmentDocumentChecklistManagement, {}) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-1 gap-6", children: _jsx(ImporterCompanyManagement, {}) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: _jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(ToggleLeft, { className: "h-4 w-4 text-orange-500" }), "Workflow Automations"] }), _jsx(CardDescription, { className: "text-xs", children: "Manage rules for shipment processing" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                    { key: 'autoAssignTracking', label: 'Auto-Assign Tracking Numbers', desc: 'Automatically generate tracking IDs for new shipments' },
                                    { key: 'requireDocumentsForClearance', label: 'Require Documents for Customs', desc: 'Block customs clearance status until all documents are uploaded' },
                                    { key: 'notifyOnStatusChange', label: 'Status Change Notifications', desc: 'Notify assigned users when a shipment changes status' },
                                    { key: 'notifyOnDelay', label: 'Delay Alerts', desc: 'Send alerts when a shipment misses its ETA' },
                                ].map((feature) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-border/50 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: feature.label }), _jsx("p", { className: "text-xs text-muted-foreground", children: feature.desc })] }), _jsx(Switch, { defaultChecked: true })] }, feature.key))) }) })] }) })] }));
}
function ExporterCompanyManagement() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', contactPerson: '', email: '', mobile: '' });
    const fetchCompanies = useCallback(async () => {
        try {
            const res = await fetch('/api/exporter-companies');
            const json = await res.json();
            if (json.data)
                setCompanies(json.data);
        }
        catch (error) {
            console.error(error);
        }
    }, []);
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);
    const handleAdd = async () => {
        if (!form.name.trim())
            return;
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
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/exporter-companies/${id}`, { method: 'DELETE' });
            fetchCompanies();
        }
        catch (error) {
            console.error(error);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: [_jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3 flex flex-row items-center justify-between space-y-0", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4 text-teal" }), "Exporter Companies"] }), _jsx(CardDescription, { className: "text-xs", children: "Manage list of export partners" })] }), _jsxs(Button, { onClick: () => setOpen(true), size: "sm", className: "h-8 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add Exporter"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "rounded-md border border-border/50 overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-muted/30", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Company Name" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Contact" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: companies.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 3, className: "text-center py-4 text-xs text-muted-foreground", children: "No exporter companies found." }) })) : (companies.map((c) => (_jsxs(TableRow, { className: "group", children: [_jsxs(TableCell, { className: "py-2", children: [_jsx("p", { className: "text-xs font-medium", children: c.name }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: c.email || 'No email' })] }), _jsxs(TableCell, { className: "py-2", children: [_jsx("p", { className: "text-[10px]", children: c.contactPerson || '—' }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: c.mobile || '' })] }), _jsx(TableCell, { className: "py-2 text-right", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => handleDelete(c.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })] }, c.id)))) })] }) }) })] }), _jsx(Dialog, { open: open, onOpenChange: setOpen, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-sm", children: "Add Exporter Company" }) }), _jsxs("div", { className: "space-y-3 py-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Company Name" }), _jsx(Input, { value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })), className: "h-8 text-xs", placeholder: "ABC Exports Ltd" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Contact Person" }), _jsx(Input, { value: form.contactPerson, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { contactPerson: e.target.value })), className: "h-8 text-xs" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Email" }), _jsx(Input, { value: form.email, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { email: e.target.value })), className: "h-8 text-xs", placeholder: "contact@abc.com" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Mobile" }), _jsx(Input, { value: form.mobile, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { mobile: e.target.value })), className: "h-8 text-xs" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setOpen(false), className: "h-8 text-xs", children: "Cancel" }), _jsx(Button, { onClick: handleAdd, size: "sm", className: "h-8 text-xs", disabled: loading, children: loading ? 'Adding...' : 'Add Company' })] })] }) })] }));
}
function ShipmentDocumentChecklistManagement() {
    const [items, setItems] = useState([]);
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
            if (json.data)
                setItems(json.data);
        }
        catch (error) {
            console.error(error);
        }
    }, []);
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    const handleAdd = async () => {
        if (!form.name.trim())
            return;
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
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/shipment-documents/checklist-types/${id}`, { method: 'DELETE' });
            fetchItems();
        }
        catch (error) {
            console.error(error);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, children: [_jsxs(Card, { className: "shadow-sm", children: [_jsxs(CardHeader, { className: "pb-3 flex flex-row items-center justify-between space-y-0", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-teal" }), "Shipment Document Checklist"] }), _jsx(CardDescription, { className: "text-xs", children: "Define required documents for shipment workflow" })] }), _jsxs(Button, { onClick: () => setOpen(true), size: "sm", className: "h-8 text-xs", children: [_jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add Requirement"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "rounded-md border border-border/50 overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-muted/30", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Document Name" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Requirement" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Stage" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold", children: "Expiry" }), _jsx(TableHead, { className: "text-[10px] h-8 font-semibold text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: items.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center py-4 text-xs text-muted-foreground", children: "No checklist requirements defined." }) })) : (items.map((item) => (_jsxs(TableRow, { className: "group", children: [_jsxs(TableCell, { className: "py-2", children: [_jsx("p", { className: "text-xs font-medium", children: item.name }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: item.allowedFileTypes })] }), _jsx(TableCell, { className: "py-2", children: _jsx(Badge, { variant: "outline", className: cn("text-[9px] h-4", item.isRequired ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"), children: item.isRequired ? 'Required' : 'Optional' }) }), _jsx(TableCell, { className: "py-2", children: _jsx(Badge, { variant: "secondary", className: "text-[9px] h-4 uppercase tracking-tighter", children: item.shipmentStage }) }), _jsx(TableCell, { className: "py-2 text-[10px]", children: item.expiryRequired ? 'Yes' : 'No' }), _jsx(TableCell, { className: "py-2 text-right", children: _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity", onClick: () => handleDelete(item.id), children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })] }, item.id)))) })] }) }) })] }), _jsx(Dialog, { open: open, onOpenChange: setOpen, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "text-sm", children: "Add Checklist Requirement" }) }), _jsxs("div", { className: "space-y-3 py-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Document Name" }), _jsx(Input, { value: form.name, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { name: e.target.value })), className: "h-8 text-xs", placeholder: "e.g. Bill of Lading" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Shipment Stage" }), _jsxs(Select, { value: form.shipmentStage, onValueChange: (v) => setForm(Object.assign(Object.assign({}, form), { shipmentStage: v })), children: [_jsx(SelectTrigger, { className: "h-8 text-xs", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "booking", children: "Booking" }), _jsx(SelectItem, { value: "arrival", children: "Arrival" }), _jsx(SelectItem, { value: "clearance", children: "Customs Clearance" }), _jsx(SelectItem, { value: "delivery", children: "Final Delivery" })] })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-[11px]", children: "Allowed File Types" }), _jsx(Input, { value: form.allowedFileTypes, onChange: (e) => setForm(Object.assign(Object.assign({}, form), { allowedFileTypes: e.target.value })), className: "h-8 text-xs", placeholder: "pdf,image,excel" })] })] }), _jsxs("div", { className: "flex items-center justify-between p-2 border border-border/50 rounded-md", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-medium", children: "Required Document" }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mandatory for shipment completion" })] }), _jsx(Switch, { checked: form.isRequired, onCheckedChange: (checked) => setForm(Object.assign(Object.assign({}, form), { isRequired: checked })) })] }), _jsxs("div", { className: "flex items-center justify-between p-2 border border-border/50 rounded-md", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-medium", children: "Expiry Date Required" }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "Track document expiration" })] }), _jsx(Switch, { checked: form.expiryRequired, onCheckedChange: (checked) => setForm(Object.assign(Object.assign({}, form), { expiryRequired: checked })) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setOpen(false), className: "h-8 text-xs", children: "Cancel" }), _jsx(Button, { onClick: handleAdd, size: "sm", className: "h-8 text-xs", disabled: loading, children: loading ? 'Adding...' : 'Add Requirement' })] })] }) })] }));
}
