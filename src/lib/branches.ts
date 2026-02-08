export type BranchId = 'manama' | 'seef' | 'saar' | 'amwaj-island';

export const BRANCHES = [
  { id: 'manama' as BranchId, name: 'Manama', color: 'from-blue-500 to-blue-600' },
  { id: 'seef' as BranchId, name: 'Seef', color: 'from-emerald-500 to-emerald-600' },
  { id: 'saar' as BranchId, name: 'Saar', color: 'from-orange-500 to-orange-600' },
  { id: 'amwaj-island' as BranchId, name: 'Amwaj Island', color: 'from-purple-500 to-purple-600' },
] as const;

export const getBranchName = (branchId: string | BranchId): string => {
  const branch = BRANCHES.find(b => b.id === branchId);
  return branch?.name || 'Unknown Branch';
};

export const getBranchColor = (branchId: string | BranchId): string => {
  const branch = BRANCHES.find(b => b.id === branchId);
  return branch?.color || 'from-gray-500 to-gray-600';
};
