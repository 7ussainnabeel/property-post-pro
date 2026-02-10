import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Receipt } from '@/types/receipt';
import { Save } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onSaved: () => void;
}

export default function ReceiptFormDialog({ open, onOpenChange, receipt, onSaved }: Props) {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [saving, setSaving] = useState(false);
  const [receiptType, setReceiptType] = useState<'commission' | 'deposit'>('commission');

  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (receipt) {
      setForm({ ...receipt });
      setReceiptType(receipt.receipt_type as 'commission' | 'deposit');
    } else {
      setForm({ branch: selectedBranch || '' });
      setReceiptType('commission');
    }
  }, [receipt, open, selectedBranch]);

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, deleted_at, deleted_by, ...rest } = form;
    const payload = {
      ...rest,
      receipt_type: receiptType,
      user_id: user?.id,
      branch: form.branch || selectedBranch,
    };

    let error;
    if (receipt) {
      ({ error } = await supabase
        .from('receipts' as any)
        .update(payload as any)
        .eq('id', receipt.id));
    } else {
      ({ error } = await supabase
        .from('receipts' as any)
        .insert(payload as any));
    }

    if (error) {
      toast.error('Failed to save receipt: ' + error.message);
      console.error(error);
    } else {
      toast.success(receipt ? 'Receipt updated!' : 'Receipt created!');
      onOpenChange(false);
      onSaved();
    }
    setSaving(false);
  };

  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={form[field] || ''}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {receipt ? 'Edit Receipt' : 'New Receipt'}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label className="text-xs mb-1 block">Receipt Type</Label>
          <Select value={receiptType} onValueChange={(v) => setReceiptType(v as any)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commission">Commission Receipt</SelectItem>
              <SelectItem value="deposit">Deposit Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="client" className="text-xs">Client & Payment</TabsTrigger>
              <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
              <TabsTrigger value="other" className="text-xs">Other Details</TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Client Name" field="client_name" />
                <Field label="CPR / Passport / CR No." field="client_id_number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Amount Due (BD)" field="full_amount_due_bd" type="number" />
                <Field label="Amount Paid (BD)" field="amount_paid_bd" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Balance Amount (BD)" field="balance_amount_bd" type="number" />
                <Field label="Payment Date" field="payment_date" type="date" />
              </div>
              <Field label="Amount Paid in Words" field="amount_paid_words" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Receipt No." field="receipt_number" />
                <div className="space-y-1">
                  <Label className="text-xs">Payment Method</Label>
                  <Select value={form.payment_method || ''} onValueChange={(v) => update('payment_method', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BENEFIT">BENEFIT</SelectItem>
                      <SelectItem value="BANK TT">Bank TT</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.payment_method === 'CHEQUE' && (
                <Field label="Cheque No." field="cheque_number" />
              )}
              {receiptType === 'commission' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Invoice Number" field="invoice_number" />
                    <Field label="Invoice Date" field="invoice_date" type="date" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Paid By</Label>
                    <Select value={form.paid_by || ''} onValueChange={(v) => update('paid_by', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUYER">Buyer</SelectItem>
                        <SelectItem value="SELLER">Seller</SelectItem>
                        <SelectItem value="LANDLORD">Landlord</SelectItem>
                        <SelectItem value="LANDLORD REP.">Landlord Rep.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {receiptType === 'deposit' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Transaction Type</Label>
                    <Select value={form.transaction_type || ''} onValueChange={(v) => update('transaction_type', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOLDING DEPOSIT">Holding Deposit</SelectItem>
                        <SelectItem value="PARTIAL PAYMENT">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Reservation Amount" field="reservation_amount" type="number" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="property" className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Property Type</Label>
                <Select value={form.property_type || ''} onValueChange={(v) => update('property_type', v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAND">Land</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                    <SelectItem value="BUILDING">Building</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {receiptType === 'commission' && (
                <div className="space-y-1">
                  <Label className="text-xs">Transaction Details</Label>
                  <Textarea
                    value={form.transaction_details || ''}
                    onChange={(e) => update('transaction_details', e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                </div>
              )}

              {receiptType === 'deposit' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Property Details" field="property_details" />
                    <Field label="Title No." field="title_number" />
                    <Field label="Case No." field="case_number" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Plot No." field="plot_number" />
                    <Field label="Property Size" field="property_size" />
                    <Field label="Size in M²" field="size_m2" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Size in F²" field="size_f2" />
                    <Field label="No. of Roads" field="number_of_roads" />
                    <Field label="Price per F²" field="price_per_f2" />
                  </div>
                  <Field label="Total Sales Price" field="total_sales_price" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Property Address" field="property_address" />
                    <Field label="Unit No." field="unit_number" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Bldg No." field="building_number" />
                    <Field label="Road No." field="road_number" />
                    <Field label="Block No." field="block_number" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Property Location" field="property_location" />
                    <Field label="Land No." field="land_number" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Project Name" field="project_name" />
                    <Field label="Area Name" field="area_name" />
                  </div>
                  <Field label="Buyer Commission (BD)" field="buyer_commission_bd" />
                </>
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-3">
              <Field label="Agent Name" field="agent_name" />
              <div className="space-y-1">
                <Label className="text-xs">Branch</Label>
                <Select value={form.branch || ''} onValueChange={(v) => update('branch', v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manama">Manama</SelectItem>
                    <SelectItem value="seef">Seef</SelectItem>
                    <SelectItem value="saar">Saar</SelectItem>
                    <SelectItem value="amwaj-island">Amwaj Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Special Note</Label>
                <Textarea
                  value={form.special_note || ''}
                  onChange={(e) => update('special_note', e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : receipt ? 'Update Receipt' : 'Create Receipt'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
