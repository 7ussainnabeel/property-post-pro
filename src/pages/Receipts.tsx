import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { BRANCHES } from '@/lib/branches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, ChevronLeft, FileText, Edit, Trash2, Download, LogOut, Search, Filter, Archive, Upload, FileCheck, Eye, X, TrendingUp } from 'lucide-react';
import { Receipt } from '@/types/receipt';
import ReceiptFormDialog from '@/components/receipts/ReceiptFormDialog';
import { generateReceiptPDF, generateReceiptPDFPreview } from '@/utils/pdfGenerator';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Receipts() {
  const { user, signOut, isAdmin, isAccountant } = useAuth();
  const { selectedBranch, getBranchName } = useBranch();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'commission' | 'deposit'>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewReceipt, setPdfPreviewReceipt] = useState<Receipt | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  useThemeColor(heroRef);

  const canViewAllBranches = isAdmin || isAccountant;

  // Check if a receipt can be edited
  const canEditReceipt = (receipt: Receipt): boolean => {
    // Admin can always edit
    if (isAdmin) return true;

    // Check if receipt was created within the last 3 days
    const createdAt = new Date(receipt.created_at);
    const now = new Date();
    const daysDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDifference <= 3;
  };

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('receipts' as any)
      .select('*')
      .is('deleted_at', null);

    // Regular users only see receipts from their selected branch
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
  }, [canViewAllBranches, selectedBranch]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleDelete = (id: string) => {
    setReceiptToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!receiptToDelete) return;
    
    const { error } = await supabase
      .from('receipts' as any)
      .update({ deleted_at: new Date().toISOString(), deleted_by: user?.email } as any)
      .eq('id', receiptToDelete);
    
    if (error) {
      toast.error('Failed to delete receipt');
    } else {
      toast.success('Receipt deleted');
      fetchReceipts();
    }
    
    setDeleteConfirmOpen(false);
    setReceiptToDelete(null);
  };

  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingReceipt(null);
    setDialogOpen(true);
  };

  const handleExportPDF = async (receipt: Receipt) => {
    try {
      console.log('� Exporting PDF for receipt:', receipt.receipt_number || receipt.id.slice(0, 8), 'Type:', receipt.receipt_type);
      await generateReceiptPDF(receipt);
      toast.success('PDF downloaded successfully!');
      console.log('✅ PDF exported successfully');
    } catch (err) {
      console.error('❌ PDF export failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Failed to generate PDF: ${errorMsg}`);
    }
  };

  const handlePreviewPDF = async (receipt: Receipt) => {
    try {
      console.log('📄 Generating preview for receipt:', receipt.id, 'Type:', receipt.receipt_type);
      const pdfBytes = await generateReceiptPDFPreview(receipt);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setPdfPreviewReceipt(receipt);
      console.log('✅ Preview generated successfully');
    } catch (error: any) {
      console.error('❌ Preview generation failed:', error);
      toast.error(error.message || 'Failed to generate PDF preview');
    }
  };

  const closePdfPreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl(null);
    setPdfPreviewReceipt(null);
  };

  const handleUploadReceipt = async (receiptId: string, file: File) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/heic',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPEG, HEIC, PDF, or Word document.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingId(receiptId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${receiptId}-${Date.now()}.${fileExt}`;
      const filePath = `payment-receipts/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Update receipt record
      const { error: updateError } = await supabase
        .from('receipts' as any)
        .update({ payment_receipt_url: publicUrl } as any)
        .eq('id', receiptId);

      if (updateError) throw updateError;

      toast.success('Payment receipt uploaded successfully!');
      fetchReceipts();
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      
      if (errorMsg.includes('Bucket not found')) {
        toast.error('Storage bucket not set up. Please run the database migration first. Check APPLY_MIGRATION.md file.');
      } else {
        toast.error(`Failed to upload: ${errorMsg}`);
      }
    } finally {
      setUploadingId(null);
    }
  };

  const triggerFileInput = (receiptId: string) => {
    const input = document.getElementById(`file-input-${receiptId}`) as HTMLInputElement;
    if (input) input.click();
  };

  const getFileType = (url: string): 'image' | 'pdf' | 'word' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'heic'].includes(extension || '')) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    return 'unknown';
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        receipt.client_name?.toLowerCase().includes(searchLower) ||
        receipt.receipt_number?.toLowerCase().includes(searchLower) ||
        receipt.agent_name?.toLowerCase().includes(searchLower) ||
        receipt.invoice_number?.toLowerCase().includes(searchLower);

      // Receipt type filter
      const matchesType = filterType === 'all' || receipt.receipt_type === filterType;

      // Payment method filter
      const matchesPaymentMethod = filterPaymentMethod === 'all' || receipt.payment_method === filterPaymentMethod;

      // Branch filter (only for admin/accountant)
      const matchesBranch = !canViewAllBranches || filterBranch === 'all' || receipt.branch === filterBranch;

      return matchesSearch && matchesType && matchesPaymentMethod && matchesBranch;
    });
  }, [receipts, searchQuery, filterType, filterPaymentMethod, filterBranch, canViewAllBranches]);

  return (
    <div className="min-h-screen bg-background">
      <header ref={heroRef} className="gradient-hero py-4 md:py-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link to="/">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0">
                  <ChevronLeft className="h-4 w-4 md:mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-primary-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 md:h-7 md:w-7 shrink-0" />
                  <span className="truncate">Receipt Management</span>
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Link to="/receipt-analysis">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <TrendingUp className="h-4 w-4 mr-1" /> Analysis
                    </Button>
                  </Link>
                  <Link to="/deleted-receipts">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Archive className="h-4 w-4 mr-1" /> Deleted
                    </Button>
                  </Link>
                </>
              )}
              <Button onClick={handleCreate} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="h-4 w-4 mr-1" /> New Receipt
              </Button>
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
                  placeholder="Search by client name, receipt #, agent, or invoice #..."
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
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="BENEFIT">Benefit</SelectItem>
                  <SelectItem value="BANK TT">Bank TT</SelectItem>
                </SelectContent>
              </Select>
              {canViewAllBranches && (
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
              )}
            </div>
            {(searchQuery || filterType !== 'all' || filterPaymentMethod !== 'all' || (canViewAllBranches && filterBranch !== 'all')) && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredReceipts.length} of {receipts.length} receipts
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading receipts...</p>
        ) : filteredReceipts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {receipts.length === 0 ? 'No Receipts Yet' : 'No Matching Receipts'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {receipts.length === 0 
                  ? 'Create your first receipt to get started.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {receipts.length === 0 && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" /> Create Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePreviewPDF(receipt)}>
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
                    </div>
                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        id={`file-input-${receipt.id}`}
                        type="file"
                        accept=".png,.jpg,.jpeg,.heic,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadReceipt(receipt.id, file);
                          e.target.value = '';
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreviewPDF(receipt)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Preview Receipt PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {receipt.payment_receipt_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPreviewReceipt(receipt)}
                          className="text-green-600 hover:text-green-700"
                          title="View Uploaded Payment Receipt"
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => triggerFileInput(receipt.id)}
                        disabled={uploadingId === receipt.id}
                        className={receipt.payment_receipt_url ? 'text-green-600 hover:text-green-700' : ''}
                        title="Upload Payment Receipt"
                      >
                        {uploadingId === receipt.id ? (
                          <span className="h-4 w-4 animate-spin">⏳</span>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportPDF(receipt)}
                        title="Download Receipt PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEditReceipt(receipt) ? (
                        <Button variant="outline" size="sm" onClick={() => handleEdit(receipt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled title="Only admin can edit receipts older than 3 days">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(receipt.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ReceiptFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        receipt={editingReceipt}
        onSaved={fetchReceipts}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this receipt? This action will move the receipt to the deleted section where it can be restored or permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReceiptToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generated PDF Preview Dialog */}
      <Dialog open={!!pdfPreviewReceipt} onOpenChange={(open) => !open && closePdfPreview()}>
        <DialogContent className="max-w-6xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>
              {pdfPreviewReceipt?.receipt_type === 'commission' ? 'Commission' : 'Deposit'} Receipt - {pdfPreviewReceipt?.client_name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {pdfPreviewUrl && (
              <iframe 
                src={pdfPreviewUrl}
                className="w-full h-[75vh] rounded-lg border"
                title="Receipt PDF Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
