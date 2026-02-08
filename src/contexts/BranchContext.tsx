import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const BRANCHES = [
  { id: 'dubai', name: 'Dubai', color: 'from-blue-500 to-blue-600' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', color: 'from-purple-500 to-purple-600' },
  { id: 'sharjah', name: 'Sharjah', color: 'from-green-500 to-green-600' },
  { id: 'ajman', name: 'Ajman', color: 'from-orange-500 to-orange-600' },
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
    const stored = localStorage.getItem('selectedBranch') as BranchId | null;
    if (stored && BRANCHES.some(b => b.id === stored)) {
      setSelectedBranchState(stored);
    }
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
