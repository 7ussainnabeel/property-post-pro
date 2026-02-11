import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { BRANCHES, getBranchName } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, TrendingUp, DollarSign, FileText, Users, Calendar, PieChart, BarChart3, LogOut } from 'lucide-react';
import { Receipt } from '@/types/receipt';

export default function ReceiptAnalysis() {
  const { user, signOut, isAdmin, isAccountant } = useAuth();
  const { selectedBranch, getBranchName } = useBranch();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  const canViewAllBranches = isAdmin || isAccountant;

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    let query = supabase
      .from('receipts' as any)
      .select('*')
      .is('deleted_at', null);

    if (!canViewAllBranches && selectedBranch) {
      query = query.eq('branch', selectedBranch);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load receipts');
      console.error(error);
    } else {
      setReceipts((data || []) as unknown as Receipt[]);
    }
    setLoading(false);
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      // Month filter
      if (selectedMonth !== 'all') {
        const receiptDate = new Date(receipt.payment_date || receipt.created_at);
        const receiptMonth = `${receiptDate.getFullYear()}-${String(receiptDate.getMonth() + 1).padStart(2, '0')}`;
        if (receiptMonth !== selectedMonth) return false;
      }

      // Branch filter
      if (filterBranch !== 'all' && receipt.branch !== filterBranch) return false;

      return true;
    });
  }, [receipts, selectedMonth, filterBranch]);

  const analytics = useMemo(() => {
    const totalReceipts = filteredReceipts.length;
    const commissionReceipts = filteredReceipts.filter(r => r.receipt_type === 'commission');
    const depositReceipts = filteredReceipts.filter(r => r.receipt_type === 'deposit');

    const totalRevenue = filteredReceipts.reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0);
    const commissionRevenue = commissionReceipts.reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0);
    const depositRevenue = depositReceipts.reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0);

    // Payment method breakdown
    const paymentMethods = filteredReceipts.reduce((acc, r) => {
      const method = r.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Branch breakdown
    const branchStats = filteredReceipts.reduce((acc, r) => {
      const branch = r.branch || 'Unknown';
      if (!acc[branch]) {
        acc[branch] = { count: 0, revenue: 0 };
      }
      acc[branch].count += 1;
      acc[branch].revenue += r.amount_paid_bd || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Agent performance
    const agentStats = filteredReceipts.reduce((acc, r) => {
      const agent = r.agent_name || 'Unknown';
      if (!acc[agent]) {
        acc[agent] = { count: 0, revenue: 0 };
      }
      acc[agent].count += 1;
      acc[agent].revenue += r.amount_paid_bd || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Property type breakdown
    const propertyTypes = filteredReceipts.reduce((acc, r) => {
      const type = r.property_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average receipt value
    const avgReceiptValue = totalReceipts > 0 ? totalRevenue / totalReceipts : 0;

    // Monthly trend (last 6 months) - filtered by selected branch
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthReceipts = filteredReceipts.filter(r => {
        const receiptDate = new Date(r.payment_date || r.created_at);
        const receiptMonth = `${receiptDate.getFullYear()}-${String(receiptDate.getMonth() + 1).padStart(2, '0')}`;
        return receiptMonth === monthKey;
      });

      return {
        month: monthName,
        count: monthReceipts.length,
        revenue: monthReceipts.reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0)
      };
    }).reverse();

    return {
      totalReceipts,
      commissionCount: commissionReceipts.length,
      depositCount: depositReceipts.length,
      totalRevenue,
      commissionRevenue,
      depositRevenue,
      avgReceiptValue,
      paymentMethods,
      branchStats,
      agentStats,
      propertyTypes,
      monthlyData
    };
  }, [filteredReceipts, receipts]);

  // Generate month options for filter (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Time' }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

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
                  <TrendingUp className="h-5 w-5 md:h-7 md:w-7 shrink-0" />
                  <span className="truncate">Receipt Analytics</span>
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0">
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl py-6 px-4">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canViewAllBranches && (
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReceipts}</div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">{analytics.commissionCount} Commission</span> • <span className="text-secondary">{analytics.depositCount} Deposit</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)} BD</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {analytics.avgReceiptValue.toFixed(2)} BD
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commission Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{analytics.commissionRevenue.toFixed(2)} BD</div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.commissionCount} receipts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Deposit Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{analytics.depositRevenue.toFixed(2)} BD</div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.depositCount} receipts
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trend (Last 6 Months)
              </CardTitle>
              <CardDescription>
                {filterBranch === 'all' ? 'All Branches' : getBranchName(filterBranch)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyData.map((month, idx) => {
                  const maxRevenue = Math.max(...analytics.monthlyData.map(m => m.revenue), 1);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{month.month}</span>
                        <span className="font-semibold">{month.revenue.toFixed(2)} BD ({month.count})</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${month.revenue > 0 ? Math.max(5, (month.revenue / maxRevenue) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.paymentMethods)
                  .sort(([, a], [, b]) => b - a)
                  .map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm">{method}</span>
                      <Badge variant="outline">{count} receipts</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Branch Performance */}
          {canViewAllBranches && Object.keys(analytics.branchStats).length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Branch Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.branchStats)
                    .sort(([, a], [, b]) => b.revenue - a.revenue)
                    .map(([branch, stats]) => (
                      <div key={branch} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{getBranchName(branch)}</span>
                          <span className="text-muted-foreground">{stats.revenue.toFixed(2)} BD</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.count} receipts</span>
                          <span>Avg: {(stats.revenue / stats.count).toFixed(2)} BD</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.agentStats)
                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                  .slice(0, 10)
                  .map(([agent, stats]) => (
                    <div key={agent} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate max-w-[60%]">{agent}</span>
                        <span className="text-muted-foreground">{stats.revenue.toFixed(2)} BD</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{stats.count} receipts</span>
                        <span>Avg: {(stats.revenue / stats.count).toFixed(2)} BD</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Property Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.propertyTypes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.toLowerCase()}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
