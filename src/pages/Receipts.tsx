import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, ChevronLeft, FileText, Edit, Trash2, Download, LogOut } from 'lucide-react';
import { Receipt } from '@/types/receipt';
import ReceiptFormDialog from '@/components/receipts/ReceiptFormDialog';
import { generateReceiptPDF } from '@/utils/pdfGenerator';

export default function Receipts() {
  const { user, signOut, isAdmin } = useAuth();
  const { selectedBranch, getBranchName } = useBranch();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  const fetchReceipts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts' as any)
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    const { error } = await supabase
      .from('receipts' as any)
      .update({ deleted_at: new Date().toISOString(), deleted_by: user?.email } as any)
      .eq('id', id);
    if (error) {
      toast.error('Failed to delete receipt');
    } else {
      toast.success('Receipt deleted');
      fetchReceipts();
    }
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
      await generateReceiptPDF(receipt);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero py-4 md:py-6 px-4">
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
        {loading ? (
          <p className="text-center text-muted-foreground">Loading receipts...</p>
        ) : receipts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Receipts Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first receipt to get started.</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" /> Create Receipt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={receipt.receipt_type === 'commission' ? 'default' : 'secondary'}>
                          {receipt.receipt_type === 'commission' ? 'Commission' : 'Deposit'}
                        </Badge>
                        {receipt.receipt_number && (
                          <span className="text-sm text-muted-foreground">#{receipt.receipt_number}</span>
                        )}
                        {receipt.branch && (
                          <Badge variant="outline">{getBranchName(receipt.branch)}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-1 truncate">{receipt.client_name || 'No Client Name'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {receipt.amount_paid_bd ? `${receipt.amount_paid_bd} BD` : 'No amount'} • 
                        {receipt.payment_date ? ` ${new Date(receipt.payment_date).toLocaleDateString()}` : ' No date'} •
                        {receipt.agent_name ? ` ${receipt.agent_name}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleExportPDF(receipt)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(receipt)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(receipt.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}
