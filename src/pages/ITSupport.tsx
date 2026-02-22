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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ChevronLeft, Shield, Users, Settings, FileText, LogOut, Search, Save, Key, Mail, UserCog, UserPlus, Trash2, Phone } from 'lucide-react';

interface UserProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  branch: string | null;
  phone_number: string | null;
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
  const [editForm, setEditForm] = useState({ fullName: '', email: '', branch: '', phoneNumber: '', role: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', branch: '', phoneNumber: '', role: 'user', password: '' });
  const [creating, setCreating] = useState(false);

  // Delete user state
  const [deleting, setDeleting] = useState(false);

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
      phone_number: p.phone_number,
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
      phoneNumber: u.phone_number || '',
      role: u.roles.find(r => r !== 'user') || 'user',
      newPassword: '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);

    try {
      // Update profile (name, branch, and phone number)
      console.log('Sending phone number:', editForm.phoneNumber);
      const { error: profileErr } = await supabase.functions.invoke('admin-update-user', {
        body: { 
          action: 'update_profile', 
          targetUserId: editUser.user_id, 
          fullName: editForm.fullName, 
          branch: editForm.branch || null,
          phoneNumber: editForm.phoneNumber || null
        },
      });
      console.log('Profile update response:', profileErr);
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

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.branch) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!createForm.email.endsWith('@icarlton.com')) {
      toast.error('Only @icarlton.com email addresses are allowed');
      return;
    }

    setCreating(true);

    try {
      // Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            full_name: createForm.fullName,
            branch: createForm.branch,
            phone_number: createForm.phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast.success('User created successfully!');
      setCreateDialogOpen(false);
      setCreateForm({ fullName: '', email: '', branch: '', phoneNumber: '', role: 'user', password: '' });
      fetchUsers();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create user';
      toast.error(msg);
    }

    setCreating(false);
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setDeleting(true);
    try {
      console.log('Attempting to delete user:', userId, userEmail);
      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: { action: 'delete_user', targetUserId: userId },
      });

      console.log('Delete response:', { data, error });

      if (error) {
        console.error('Delete user error:', error);
        throw new Error(error.message || 'Edge function error');
      }

      if (data?.error) {
        console.error('Delete user data error:', data.error);
        throw new Error(data.error);
      }

      toast.success(`User ${userEmail} deleted successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error('Delete user exception:', err);
      const msg = err?.message || 'Failed to delete user';
      toast.error(msg);
    }
    setDeleting(false);
  };

  const handleWhatsAppReset = (phoneNumber: string, userName: string) => {
    if (!phoneNumber) {
      toast.error('Phone number not available for this user');
      return;
    }

    // Remove any non-digit characters and ensure it starts without country code
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${userName},\n\nYour password has been reset by IT Support. Please check your email for the new password.\n\nBest regards,\niCarlton IT Support`
    );

    // Open WhatsApp with Bahrain country code (+973)
    const whatsappUrl = `https://wa.me/973${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.branch?.toLowerCase().includes(q) ||
      u.phone_number?.toLowerCase().includes(q)
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, branch, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
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
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                            <UserCog className="h-4 w-4 mr-1" /> Manage
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={deleting || u.user_id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user account for <strong>{u.email}</strong> and remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(u.user_id, u.email || 'Unknown')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
              <Label><Phone className="h-3 w-3 inline mr-1" />Phone Number (WhatsApp)</Label>
              <Input 
                type="tel" 
                placeholder="e.g., 33123456" 
                value={editForm.phoneNumber} 
                onChange={(e) => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} 
              />
              <p className="text-xs text-muted-foreground">Enter number without +973 (Bahrain code)</p>
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
            <div className="flex gap-2">
              <Button onClick={handleSaveUser} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                onClick={() => handleWhatsAppReset(editForm.phoneNumber, editForm.fullName || 'User')} 
                variant="outline" 
                disabled={!editForm.phoneNumber}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input value={createForm.fullName} onChange={(e) => setCreateForm(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label><Mail className="h-3 w-3 inline mr-1" />Email <span className="text-destructive">*</span></Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="user@icarlton.com" />
              <p className="text-xs text-muted-foreground">Must be @icarlton.com</p>
            </div>
            <div className="space-y-2">
              <Label>Branch <span className="text-destructive">*</span></Label>
              <Select value={createForm.branch} onValueChange={(v) => setCreateForm(p => ({ ...p, branch: v }))}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label><Phone className="h-3 w-3 inline mr-1" />Phone Number (WhatsApp)</Label>
              <Input 
                type="tel" 
                placeholder="e.g., 33123456" 
                value={createForm.phoneNumber} 
                onChange={(e) => setCreateForm(p => ({ ...p, phoneNumber: e.target.value }))} 
              />
              <p className="text-xs text-muted-foreground">Enter number without +973 (Bahrain code)</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm(p => ({ ...p, role: v }))}>
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
              <Label><Key className="h-3 w-3 inline mr-1" />Password <span className="text-destructive">*</span></Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" />
            </div>
            <Button onClick={handleCreateUser} disabled={creating} className="w-full">
              {creating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
