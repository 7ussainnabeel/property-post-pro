import { useState, useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { BRANCHES, type BranchId } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, LogIn, UserPlus, MapPin } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { selectedBranch, setSelectedBranch } = useBranch();
  const navigate = useNavigate();
  useThemeColor(undefined, '#f5f7fa', '#f5f7fa');

  // If user is already logged in, show branch selection
  useEffect(() => {
    if (user && selectedBranch) {
      navigate('/receipts');
    }
  }, [user, selectedBranch, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        // If branch already selected, go to receipts
        if (localStorage.getItem('selectedBranch')) {
          navigate('/receipts');
        }
        // Otherwise stay on page to select branch
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

  const handleBranchSelect = (branchId: string) => {
    const b = BRANCHES.find(br => br.id === branchId);
    if (b) {
      setSelectedBranch(b.id as BranchId);
      toast.success(`Branch set to ${b.name}`);
      setTimeout(() => navigate('/receipts'), 300);
    }
  };

  // If logged in but no branch selected, show branch selection
  if (user && !selectedBranch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <img src="/LOGO.png" alt="Carlton Real Estate" className="h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
              Select Your Branch
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4 mt-2">
              Welcome, {user.email}! Select your branch to continue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BRANCHES.map((b) => (
              <Card
                key={b.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleBranchSelect(b.id)}
              >
                <CardHeader>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${b.color} flex items-center justify-center mb-2 sm:mb-3`}>
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{b.name}</CardTitle>
                  <CardDescription>Access {b.name} dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Select Branch</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If logged in and branch selected, redirect
  if (user && selectedBranch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md sm:max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/LOGO.png" alt="Carlton Real Estate" className="h-10" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-display">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to manage receipts' : 'Register with your @icarlton.com email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required={!isLogin}
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? (
                <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
