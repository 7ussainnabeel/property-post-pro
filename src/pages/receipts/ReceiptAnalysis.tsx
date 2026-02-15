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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { ChevronLeft, TrendingUp, DollarSign, FileText, Users, Calendar, PieChart, BarChart3, LogOut } from 'lucide-react';
import { Receipt } from '@/types/receipt';

export default function ReceiptAnalysis() {
  const { user, signOut, isAdmin, isAccountant } = useAuth();
  const { selectedBranch, getBranchName } = useBranch();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  const canViewAllBranches = isAdmin || isAccountant;

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

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.payment_date || receipt.created_at);
      
      // Date range filter
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (receiptDate < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (receiptDate > to) return false;
      }

      // Branch filter
      if (filterBranch !== 'all' && receipt.branch !== filterBranch) return false;

      return true;
    });
  }, [receipts, fromDate, toDate, filterBranch]);

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

      const commissionRevenue = monthReceipts
        .filter(r => r.receipt_type === 'commission')
        .reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0);
      
      const depositRevenue = monthReceipts
        .filter(r => r.receipt_type === 'deposit')
        .reduce((sum, r) => sum + (r.amount_paid_bd || 0), 0);

      return {
        month: monthName,
        commission: commissionRevenue,
        deposit: depositRevenue
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
  }, [filteredReceipts]);

  const chartConfig = {
    commission: {
      label: "Commission",
      color: "hsl(221, 83%, 53%)", // Blue
    },
    deposit: {
      label: "Deposit",
      color: "hsl(142, 76%, 36%)", // Green
    },
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
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={!fromDate && !toDate ? "default" : "outline"}
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="h-10"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  All Time
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-date" className="text-xs font-medium">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date" className="text-xs font-medium">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                {canViewAllBranches && (
                  <div className="space-y-2">
                    <Label htmlFor="branch-filter" className="text-xs font-medium">Branch</Label>
                    <Select value={filterBranch} onValueChange={setFilterBranch}>
                      <SelectTrigger id="branch-filter" className="h-10">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {BRANCHES.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                      setFilterBranch('all');
                    }}
                    className="h-10 w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
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
          {/* Monthly Trend Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trend (Last 6 Months)
              </CardTitle>
              <CardDescription>
                Commission vs Deposit revenue by month • {filterBranch === 'all' ? 'All Branches' : getBranchName(filterBranch)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={analytics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    label={{ value: 'Revenue (BD)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const commissionValue = Number(payload[0]?.value || 0);
                        const depositValue = Number(payload[1]?.value || 0);
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(221, 83%, 53%)' }} />
                                  <span className="text-xs text-muted-foreground">Commission</span>
                                </div>
                                <span className="font-bold" style={{ color: 'hsl(221, 83%, 53%)' }}>{commissionValue.toFixed(2)} BD</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                                  <span className="text-xs text-muted-foreground">Deposit</span>
                                </div>
                                <span className="font-bold" style={{ color: 'hsl(142, 76%, 36%)' }}>{depositValue.toFixed(2)} BD</span>
                              </div>
                              <div className="flex justify-between gap-4 pt-1 border-t">
                                <span className="text-xs font-medium">Total</span>
                                <span className="font-bold">{(commissionValue + depositValue).toFixed(2)} BD</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="commission" fill="var(--color-commission)" radius={[4, 4, 0, 0]} name="Commission" />
                  <Bar dataKey="deposit" fill="var(--color-deposit)" radius={[4, 4, 0, 0]} name="Deposit" />
                </BarChart>
              </ChartContainer>
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
