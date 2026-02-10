/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BRANCHES, BranchId, getBranchName } from '@/lib/branches';

interface BranchContextType {
  selectedBranch: BranchId | null;
  setSelectedBranch: (branch: BranchId) => void;
  getBranchName: (branchId: string | BranchId) => string;
  showAllBranches: boolean;
  setShowAllBranches: (show: boolean) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranchState] = useState<BranchId | null>(null);
  const [showAllBranches, setShowAllBranches] = useState(false);

  useEffect(() => {
    const loadBranch = async () => {
      // First check if user has a branch in their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('branch')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.branch && BRANCHES.some(b => b.id === profile.branch)) {
          setSelectedBranchState(profile.branch as BranchId);
          localStorage.setItem('selectedBranch', profile.branch);
          return;
        }
      }

      // Fall back to localStorage if no profile branch
      const stored = localStorage.getItem('selectedBranch') as BranchId | null;
      if (stored && BRANCHES.some(b => b.id === stored)) {
        setSelectedBranchState(stored);
      } else if (stored) {
        // Clear invalid branch selection
        localStorage.removeItem('selectedBranch');
      }
    };

    loadBranch();

    // Listen for storage changes from other tabs/pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedBranch') {
        loadBranch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setSelectedBranch = (branch: BranchId) => {
    setSelectedBranchState(branch);
    localStorage.setItem('selectedBranch', branch);
  };

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        getBranchName,
        showAllBranches,
        setShowAllBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
