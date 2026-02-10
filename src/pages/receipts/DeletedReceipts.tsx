import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { BRANCHES } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChevronLeft, FileText, RotateCcw, Trash2, LogOut, Search, Filter, Archive, FileCheck, Eye, X, Download } from 'lucide-react';
import { Receipt } from '@/types/receipt';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeletedReceipts() {
  const { user, signOut } = useAuth();
  const { selectedBranch, getBranchName } = useBranch();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'commission' | 'deposit'>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);

  const fetchDeletedReceipts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts' as any)
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      toast.error('Failed to load deleted receipts');
      console.error(error);
    } else {
      setReceipts((data || []) as unknown as Receipt[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedReceipts();
  }, []);

  const handleRestore = async (id: string) => {
    const { error } = await supabase
      .from('receipts' as any)
      .update({ deleted_at: null, deleted_by: null } as any)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to restore receipt');
      console.error(error);
    } else {
      toast.success('Receipt restored successfully');
      fetchDeletedReceipts();
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const { error } = await supabase
      .from('receipts' as any)
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to permanently delete receipt');
      console.error(error);
    } else {
      toast.success('Receipt permanently deleted');
      fetchDeletedReceipts();
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        receipt.client_name?.toLowerCase().includes(searchLower) ||
        receipt.receipt_number?.toLowerCase().includes(searchLower) ||
        receipt.agent_name?.toLowerCase().includes(searchLower) ||
        receipt.invoice_number?.toLowerCase().includes(searchLower);

      const matchesType = filterType === 'all' || receipt.receipt_type === filterType;
      
      // Branch filter for admin
      const matchesBranch = filterBranch === 'all' || receipt.branch === filterBranch;

      return matchesSearch && matchesType && matchesBranch;
    });
  }, [receipts, searchQuery, filterType, filterBranch]);

  const getFileType = (url: string): 'image' | 'pdf' | 'word' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'heic'].includes(extension || '')) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    return 'unknown';
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
                  <Archive className="h-5 w-5 md:h-7 md:w-7 shrink-0" />
                  <span className="truncate">Deleted Receipts</span>
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 truncate">
                  {user?.email} • Admin View
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={signOut} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl py-6 px-4">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deleted receipts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || filterType !== 'all' || filterBranch !== 'all') && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredReceipts.length} of {receipts.length} deleted receipts
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading deleted receipts...</p>
        ) : filteredReceipts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {receipts.length === 0 ? 'No Deleted Receipts' : 'No Matching Deleted Receipts'}
              </h3>
              <p className="text-muted-foreground">
                {receipts.length === 0 
                  ? 'Deleted receipts will appear here.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow border-destructive/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={receipt.receipt_type === 'commission' ? 'default' : 'secondary'}>
                          {receipt.receipt_type === 'commission' ? 'Commission' : 'Deposit'}
                        </Badge>
                        {receipt.receipt_number && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-muted-foreground">#{receipt.receipt_number}</span>
                            {receipt.branch && (
                              <Badge variant="outline" className="text-xs">
                                {getBranchName(receipt.branch)}
                              </Badge>
                            )}
                          </div>
                        )}
                        <Badge variant="destructive" className="text-xs">Deleted</Badge>
                        {receipt.payment_receipt_url && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <FileCheck className="h-3 w-3 mr-1" /> Receipt Uploaded
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-1 truncate">{receipt.client_name || 'No Client Name'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {receipt.amount_paid_bd ? `${receipt.amount_paid_bd} BD` : 'No amount'} • 
                        {receipt.payment_date ? ` ${new Date(receipt.payment_date).toLocaleDateString()}` : ' No date'} •
                        {receipt.agent_name ? ` ${receipt.agent_name}` : ''}
                      </p>
                      {receipt.deleted_at && (
                        <p className="text-xs text-destructive mt-1">
                          Deleted {new Date(receipt.deleted_at).toLocaleDateString()} 
                          {receipt.deleted_by && ` by ${receipt.deleted_by}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {receipt.payment_receipt_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPreviewReceipt(receipt)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRestore(receipt.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" /> Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Permanently Delete Receipt?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the receipt
                              for {receipt.client_name || 'this client'} from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentDelete(receipt.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Permanently Delete
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
      </main>

      {/* Payment Receipt Preview Dialog */}
      <Dialog open={!!previewReceipt} onOpenChange={(open) => !open && setPreviewReceipt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Payment Receipt - {previewReceipt?.client_name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {previewReceipt?.payment_receipt_url && (() => {
              const fileType = getFileType(previewReceipt.payment_receipt_url);
              
              if (fileType === 'image') {
                return (
                  <img 
                    src={previewReceipt.payment_receipt_url} 
                    alt="Payment Receipt" 
                    className="w-full h-auto rounded-lg"
                  />
                );
              }
              
              if (fileType === 'pdf') {
                return (
                  <iframe 
                    src={previewReceipt.payment_receipt_url} 
                    className="w-full h-[70vh] rounded-lg border"
                    title="Payment Receipt PDF"
                  />
                );
              }
              
              if (fileType === 'word') {
                return (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">Word Document</p>
                    <p className="text-muted-foreground mb-4">Preview not available for Word documents</p>
                    <Button asChild>
                      <a href={previewReceipt.payment_receipt_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download Document
                      </a>
                    </Button>
                  </div>
                );
              }
              
              return (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">File Preview Unavailable</p>
                  <Button asChild>
                    <a href={previewReceipt.payment_receipt_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </a>
                  </Button>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
