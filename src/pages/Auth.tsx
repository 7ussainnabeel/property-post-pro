import { useState, useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BRANCHES, type BranchId } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  useThemeColor(undefined, '#f5f7fa', '#f5f7fa');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset link sent! Check your email.');
        setMode('login');
      }
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } else {
      if (!email.endsWith('@icarlton.com')) {
        toast.error('Only @icarlton.com email addresses are allowed.');
        setLoading(false);
        return;
      }
      if (!branch) {
        toast.error('Please select a branch.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, branch);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
      }
    }
    setLoading(false);
  };

  const getTitle = () => {
    if (mode === 'forgot') return 'Reset Password';
    if (mode === 'login') return 'Sign In';
    return 'Create Account';
  };

  const getDescription = () => {
    if (mode === 'forgot') return 'Enter your email to receive a password reset link';
    if (mode === 'login') return 'Sign in to manage receipts';
    return 'Register with your @icarlton.com email';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md sm:max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/LOGO.png" alt="Carlton Real Estate" className="h-10" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-display">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={branch} onValueChange={setBranch} required>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@icarlton.com"
                required
              />
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? (
                <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
              ) : mode === 'signup' ? (
                <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>
              ) : (
                <><KeyRound className="h-4 w-4 mr-2" /> Send Reset Link</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-1">
            {mode === 'login' && (
              <>
                <Button variant="link" onClick={() => setMode('forgot')} className="text-sm block mx-auto">
                  Forgot Password?
                </Button>
                <Button variant="link" onClick={() => setMode('signup')} className="text-sm block mx-auto">
                  Don't have an account? Sign up
                </Button>
              </>
            )}
            {mode === 'signup' && (
              <Button variant="link" onClick={() => setMode('login')} className="text-sm">
                Already have an account? Sign in
              </Button>
            )}
            {mode === 'forgot' && (
              <Button variant="link" onClick={() => setMode('login')} className="text-sm">
                Back to Sign In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}