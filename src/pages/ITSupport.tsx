import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BRANCHES } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ChevronLeft, Shield, Users, Settings, FileText, LogOut, Search, Save, Key, Mail, UserCog } from 'lucide-react';

interface UserProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  branch: string | null;
  is_active: boolean | null;
  roles: string[];
}

export default function ITSupport() {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDuration, setEditDuration] = useState(3);
  const [savingDuration, setSavingDuration] = useState(false);
  
  // User edit dialog
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', branch: '', role: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load users');
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch roles for all users
    const { data: roles } = await supabase
      .from('user_roles' as any)
      .select('user_id, role');

    const roleMap: Record<string, string[]> = {};
    (roles || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const mapped = (profiles || []).map((p: any) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      branch: p.branch,
      is_active: p.is_active,
      roles: roleMap[p.user_id] || ['user'],
    }));

    setUsers(mapped);
    setLoading(false);
  };

  const fetchEditDuration = async () => {
    const { data } = await supabase
      .from('edit_duration_settings' as any)
      .select('edit_duration_days')
      .limit(1)
      .maybeSingle();
    if (data) setEditDuration((data as any).edit_duration_days);
  };

  useEffect(() => {
    fetchUsers();
    fetchEditDuration();
  }, []);

  const handleSaveDuration = async () => {
    setSavingDuration(true);
    const { error } = await supabase
      .from('edit_duration_settings' as any)
      .update({ edit_duration_days: editDuration, updated_at: new Date().toISOString(), updated_by: user?.id } as any)
      .not('id', 'is', null);
    
    if (error) {
      toast.error('Failed to update edit duration');
    } else {
      toast.success(`Edit duration updated to ${editDuration} days`);
    }
    setSavingDuration(false);
  };

  const openEditUser = (u: UserProfile) => {
    setEditUser(u);
    setEditForm({
      fullName: u.full_name || '',
      email: u.email || '',
      branch: u.branch || '',
      role: u.roles.find(r => r !== 'user') || 'user',
      newPassword: '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);

    try {
      // Update profile (name & branch)
      const { error: profileErr } = await supabase.functions.invoke('admin-update-user', {
        body: { action: 'update_profile', targetUserId: editUser.user_id, fullName: editForm.fullName, branch: editForm.branch || null },
      });
      if (profileErr) throw profileErr;

      // Update email if changed
      if (editForm.email && editForm.email !== editUser.email) {
        const { error: emailErr } = await supabase.functions.invoke('admin-update-user', {
          body: { action: 'update_email', targetUserId: editUser.user_id, newEmail: editForm.email },
        });
        if (emailErr) throw emailErr;
      }

      // Update role if changed
      const currentRole = editUser.roles.find(r => r !== 'user') || 'user';
      if (editForm.role !== currentRole) {
        const { error: roleErr } = await supabase.functions.invoke('admin-update-user', {
          body: { action: 'update_role', targetUserId: editUser.user_id, newRole: editForm.role },
        });
        if (roleErr) throw roleErr;
      }

      // Reset password if provided
      if (editForm.newPassword) {
        const { error: pwErr } = await supabase.functions.invoke('admin-update-user', {
          body: { action: 'reset_password', targetUserId: editUser.user_id, newPassword: editForm.newPassword },
        });
        if (pwErr) throw pwErr;
      }

      toast.success('User updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.message || err?.error || 'Failed to update user';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    setSaving(false);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.branch?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'it_support': return 'default' as const;
      case 'accountant': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero py-4 md:py-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link to="/receipts">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0">
                  <ChevronLeft className="h-4 w-4 md:mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-primary-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 md:h-7 md:w-7 shrink-0" />
                  <span className="truncate">IT Support Panel</span>
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl py-6 px-4">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />User Management</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading users...</p>
            ) : (
              <div className="grid gap-3">
                {filteredUsers.map((u) => (
                  <Card key={u.user_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{u.full_name || 'No Name'}</h3>
                            {u.roles.map(r => (
                              <Badge key={r} variant={getRoleBadgeVariant(r)} className="text-xs">
                                {r === 'it_support' ? 'IT Support' : r.charAt(0).toUpperCase() + r.slice(1)}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Branch: {u.branch ? BRANCHES.find(b => b.id === u.branch)?.name || u.branch : 'Not set'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                          <UserCog className="h-4 w-4 mr-1" /> Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Receipt Edit Duration
                </CardTitle>
                <CardDescription>
                  Set the number of days a regular user can edit their receipts after creation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Edit Duration (Days)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min={1}
                      max={365}
                      value={editDuration}
                      onChange={(e) => setEditDuration(parseInt(e.target.value) || 1)}
                      className="w-32"
                    />
                  </div>
                  <Button onClick={handleSaveDuration} disabled={savingDuration}>
                    <Save className="h-4 w-4 mr-2" />
                    {savingDuration ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Currently set to <strong>{editDuration} days</strong>. After this period, only IT Support and Admin can edit receipts.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label><Mail className="h-3 w-3 inline mr-1" />Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={editForm.branch} onValueChange={(v) => setEditForm(p => ({ ...p, branch: v }))}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="it_support">IT Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label><Key className="h-3 w-3 inline mr-1" />Reset Password</Label>
              <Input type="password" placeholder="Leave blank to keep current" value={editForm.newPassword} onChange={(e) => setEditForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <Button onClick={handleSaveUser} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
