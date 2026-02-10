export interface Receipt {
  id: string;
  user_id: string;
  branch: string | null;
  receipt_type: 'commission' | 'deposit';
  receipt_number: string | null;
  client_name: string | null;
  client_id_number: string | null;
  full_amount_due_bd: number | null;
  payment_date: string | null;
  amount_paid_bd: number | null;
  balance_amount_bd: number | null;
  amount_paid_words: string | null;
  payment_method: string | null;
  cheque_number: string | null;
  property_type: string | null;
  agent_name: string | null;
  special_note: string | null;
  // Commission fields
  invoice_number: string | null;
  invoice_date: string | null;
  paid_by: string | null;
  transaction_details: string | null;
  // Deposit fields
  transaction_type: string | null;
  reservation_amount: number | null;
  property_details: string | null;
  title_number: string | null;
  case_number: string | null;
  plot_number: string | null;
  property_size: string | null;
  size_m2: string | null;
  size_f2: string | null;
  number_of_roads: string | null;
  price_per_f2: string | null;
  total_sales_price: string | null;
  property_address: string | null;
  unit_number: string | null;
  building_number: string | null;
  road_number: string | null;
  block_number: string | null;
  property_location: string | null;
  land_number: string | null;
  project_name: string | null;
  area_name: string | null;
  buyer_commission_bd: string | null;
  pdf_url: string | null;
  payment_receipt_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export type ReceiptFormData = Omit<Receipt, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by' | 'pdf_url'>;
