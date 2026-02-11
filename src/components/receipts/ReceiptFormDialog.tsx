import { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Receipt } from '@/types/receipt';
import { Save } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onSaved: () => void;
}

interface FieldProps {
  label: string;
  field: string;
  value: string;
  onChange: (field: string, value: string) => void;
  type?: string;
  placeholder?: string;
}

const Field = memo(({ label, field, value, onChange, type = 'text', placeholder = '' }: FieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={`field-${field}`} className="text-xs font-medium">{label}</Label>
    <Input
      id={`field-${field}`}
      type={type}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={placeholder}
      className="h-10 text-sm"
      autoComplete="off"
    />
  </div>
));

Field.displayName = 'Field';

export default function ReceiptFormDialog({ open, onOpenChange, receipt, onSaved }: Props) {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [saving, setSaving] = useState(false);
  const [receiptType, setReceiptType] = useState<'commission' | 'deposit'>('commission');
  const [activeTab, setActiveTab] = useState('client');
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (receipt) {
      setForm({ ...receipt });
      setReceiptType(receipt.receipt_type as 'commission' | 'deposit');
    } else {
      setForm({});
      setReceiptType('commission');
    }
    setActiveTab('client');
  }, [receipt, open]);

  const update = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, deleted_at, deleted_by, ...rest } = form;
    const payload = {
      ...rest,
      receipt_type: receiptType,
      user_id: user?.id,
      branch: selectedBranch,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {receipt ? 'Edit Receipt' : 'New Receipt'}
          </DialogTitle>
          <DialogDescription>
            {receipt ? 'Update the receipt details below' : 'Create a new receipt by filling in the details below'}
          </DialogDescription>
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

        <div className="grid grid-cols-3 gap-2 mb-4 bg-muted p-1 rounded-md">
          <Button
            type="button"
            variant={activeTab === 'client' ? 'default' : 'ghost'}
            className="text-xs h-9"
            onClick={() => setActiveTab('client')}
          >
            Client & Payment
          </Button>
          <Button
            type="button"
            variant={activeTab === 'property' ? 'default' : 'ghost'}
            className="text-xs h-9"
            onClick={() => setActiveTab('property')}
          >
            Property
          </Button>
          <Button
            type="button"
            variant={activeTab === 'other' ? 'default' : 'ghost'}
            className="text-xs h-9"
            onClick={() => setActiveTab('other')}
          >
            Other Details
          </Button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="w-full">
            <div style={{ display: activeTab === 'client' ? 'block' : 'none' }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client Name" field="client_name" value={form.client_name || ''} onChange={update} />
                <Field label="CPR / Passport / CR No." field="client_id_number" value={form.client_id_number || ''} onChange={update} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Amount Due (BD)" field="full_amount_due_bd" value={form.full_amount_due_bd || ''} onChange={update} type="number" />
                <Field label="Amount Paid (BD)" field="amount_paid_bd" value={form.amount_paid_bd || ''} onChange={update} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Balance Amount (BD)" field="balance_amount_bd" value={form.balance_amount_bd || ''} onChange={update} type="number" />
                <Field label="Payment Date" field="payment_date" value={form.payment_date || ''} onChange={update} type="date" />
              </div>
              <div>
                <Field label="Amount Paid in Words" field="amount_paid_words" value={form.amount_paid_words || ''} onChange={update} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Receipt No." field="receipt_number" value={form.receipt_number || ''} onChange={update} />
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Payment Method</Label>
                  <Select value={form.payment_method || ''} onValueChange={(v) => update('payment_method', v)}>
                    <SelectTrigger className="h-10">
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
                <div>
                  <Field label="Cheque No." field="cheque_number" value={form.cheque_number || ''} onChange={update} />
                </div>
              )}
              {receiptType === 'commission' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Invoice Number" field="invoice_number" value={form.invoice_number || ''} onChange={update} />
                    <Field label="Invoice Date" field="invoice_date" value={form.invoice_date || ''} onChange={update} type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Paid By</Label>
                    <Select value={form.paid_by || ''} onValueChange={(v) => update('paid_by', v)}>
                      <SelectTrigger className="h-10">
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
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Transaction Type</Label>
                    <Select value={form.transaction_type || ''} onValueChange={(v) => update('transaction_type', v)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOLDING DEPOSIT">Holding Deposit</SelectItem>
                        <SelectItem value="PARTIAL PAYMENT">Partial Payment</SelectItem>
                        <SelectItem value="RESERVATION AMOUNT">Reservation Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Reservation Amount" field="reservation_amount" value={form.reservation_amount || ''} onChange={update} type="number" />
                </>
              )}
            </div>

            <div style={{ display: activeTab === 'property' ? 'block' : 'none' }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Property Type</Label>
                <Select value={form.property_type || ''} onValueChange={(v) => update('property_type', v)}>
                  <SelectTrigger className="h-10">
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
                <div className="space-y-2">
                  <Label htmlFor="field-transaction_details" className="text-xs font-medium">Transaction Details</Label>
                  <Textarea
                    id="field-transaction_details"
                    value={form.transaction_details || ''}
                    onChange={(e) => update('transaction_details', e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                </div>
              )}

              {receiptType === 'deposit' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Property Details" field="property_details" value={form.property_details || ''} onChange={update} />
                    <Field label="Title No." field="title_number" value={form.title_number || ''} onChange={update} />
                    <Field label="Case No." field="case_number" value={form.case_number || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Plot No." field="plot_number" value={form.plot_number || ''} onChange={update} />
                    <Field label="Property Size" field="property_size" value={form.property_size || ''} onChange={update} />
                    <Field label="Size in M²" field="size_m2" value={form.size_m2 || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Size in F²" field="size_f2" value={form.size_f2 || ''} onChange={update} />
                    <Field label="No. of Roads" field="number_of_roads" value={form.number_of_roads || ''} onChange={update} />
                    <Field label="Price per F²" field="price_per_f2" value={form.price_per_f2 || ''} onChange={update} />
                  </div>
                  <div>
                    <Field label="Total Sales Price" field="total_sales_price" value={form.total_sales_price || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Property Address" field="property_address" value={form.property_address || ''} onChange={update} />
                    <Field label="Unit No." field="unit_number" value={form.unit_number || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Bldg No." field="building_number" value={form.building_number || ''} onChange={update} />
                    <Field label="Road No." field="road_number" value={form.road_number || ''} onChange={update} />
                    <Field label="Block No." field="block_number" value={form.block_number || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Property Location" field="property_location" value={form.property_location || ''} onChange={update} />
                    <Field label="Land No." field="land_number" value={form.land_number || ''} onChange={update} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Project Name" field="project_name" value={form.project_name || ''} onChange={update} />
                    <Field label="Area Name" field="area_name" value={form.area_name || ''} onChange={update} />
                  </div>
                  <div>
                    <Field label="Buyer Commission (BD)" field="buyer_commission_bd" value={form.buyer_commission_bd || ''} onChange={update} />
                  </div>
                  <div>
                    <Field label="Agent Name" field="agent_name" value={form.agent_name || ''} onChange={update} />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: activeTab === 'other' ? 'block' : 'none' }} className="space-y-3">
              <Field label="Agent Name" field="agent_name" value={form.agent_name || ''} onChange={update} />
              <div className="space-y-2">
                <Label htmlFor="field-special_note" className="text-xs font-medium">Special Note</Label>
                <Textarea
                  id="field-special_note"
                  value={form.special_note || ''}
                  onChange={(e) => update('special_note', e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
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
