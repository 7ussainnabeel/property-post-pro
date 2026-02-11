import { useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { BRANCHES, type BranchId } from '@/lib/branches';
import { useBranch } from '@/contexts/BranchContext';

export default function BranchSelection() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSelectedBranch: setContextBranch } = useBranch();
  useThemeColor(undefined, '#f5f7fa', '#f5f7fa');

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    // Update context branch
    const branch = BRANCHES.find(b => b.id === branchId);
    if (branch) {
      setContextBranch(branch.id as BranchId);
      toast.success(`Welcome! You've selected ${branch.name}`);
      
      // Navigate to home page after selection
      setTimeout(() => {
        navigate('/');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
              Property Post Pro
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Select your branch to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRANCHES.map((branch) => (
            <Card
              key={branch.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                selectedBranch === branch.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleBranchSelect(branch.id)}
            >
              <CardHeader>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${branch.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">{branch.name}</CardTitle>
                <CardDescription>
                  Access {branch.name} branch dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant={selectedBranch === branch.id ? "default" : "outline"}
                >
                  Select Branch
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Your generated descriptions will be tagged with your selected branch
          </p>
        </div>
      </div>
    </div>
  );
}
