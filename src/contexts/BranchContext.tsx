import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const BRANCHES = [
  { id: 'manama', name: 'Manama Branch', color: 'from-blue-500 to-blue-600' },
  { id: 'seef', name: 'Seef Branch', color: 'from-purple-500 to-purple-600' },
  { id: 'saar', name: 'Saar Branch', color: 'from-green-500 to-green-600' },
  { id: 'amwaj-island', name: 'Amwaj Island Branch', color: 'from-orange-500 to-orange-600' },
] as const;

export type BranchId = typeof BRANCHES[number]['id'];

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
    const loadBranch = () => {
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

  const getBranchName = (branchId: string | BranchId) => {
    return BRANCHES.find(b => b.id === branchId)?.name || branchId;
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
