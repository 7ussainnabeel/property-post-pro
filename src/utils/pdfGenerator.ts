/**
 * Receipt PDF Generator
 * 
 * Fills existing PDF form templates with receipt data.
 * Supports branch-specific templates (Saar, Amwaj) with fallback field names.
 */

import { PDFDocument } from 'pdf-lib';
import { Receipt } from '@/types/receipt';

// ─── Template Selection ────────────────────────────────────────────────────────

function getBranchTemplateSuffix(branch: string | null): string {
  switch (branch) {
    case 'saar': return '_Saar';
    case 'amwaj-island': return '_Amwaj';
    default: return '';
  }
}

async function loadPDFTemplate(templateName: string): Promise<ArrayBuffer> {
  const response = await fetch(`/PDF/${templateName}?t=${Date.now()}`, {
    cache: 'no-cache',
    headers: { 'Accept': 'application/pdf' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templateName} (Status: ${response.status})`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  console.log(`✓ Loaded ${templateName}: ${arrayBuffer.byteLength} bytes`);
  
  const uint8 = new Uint8Array(arrayBuffer);
  const header = String.fromCharCode(...uint8.slice(0, 5));
  if (!header.startsWith('%PDF-')) {
    throw new Error(`Invalid PDF file: ${templateName}`);
  }
  
  return arrayBuffer;
}

// ─── Field Helpers ─────────────────────────────────────────────────────────────

let successCount = 0;
let failCount = 0;

function fillField(form: any, fieldName: string, value: any) {
  try {
    const field = form.getTextField(fieldName);
    if (field && value !== null && value !== undefined && value !== '') {
      field.setText(String(value));
      successCount++;
      console.log(`  ✓ ${fieldName} = ${value}`);
    }
  } catch {
    if (value !== null && value !== undefined && value !== '') {
      failCount++;
      console.warn(`  ⚠️  Missing field: "${fieldName}" (value: ${value})`);
    }
  }
}

/**
 * Try multiple field names for the same value (handles different template field naming)
 */
function fillFieldAny(form: any, fieldNames: string[], value: any) {
  if (value === null || value === undefined || value === '') return;
  for (const name of fieldNames) {
    try {
      const field = form.getTextField(name);
      if (field) {
        field.setText(String(value));
        successCount++;
        console.log(`  ✓ ${name} = ${value}`);
        return;
      }
    } catch {
      // try next
    }
  }
  failCount++;
  console.warn(`  ⚠️  No matching field for: ${fieldNames.join(' / ')} (value: ${value})`);
}

function checkField(form: any, fieldName: string, isChecked: boolean) {
  try {
    const field = form.getCheckBox(fieldName);
    if (field && isChecked) {
      field.check();
      successCount++;
      console.log(`  ☑ ${fieldName} = checked`);
    }
  } catch {
    if (isChecked) {
      failCount++;
      console.warn(`  ⚠️  Missing checkbox: "${fieldName}"`);
    }
  }
}

function checkFieldAny(form: any, fieldNames: string[], isChecked: boolean) {
  if (!isChecked) return;
  for (const name of fieldNames) {
    try {
      const field = form.getCheckBox(name);
      if (field) {
        field.check();
        successCount++;
        console.log(`  ☑ ${name} = checked`);
        return;
      }
    } catch {
      // try next
    }
  }
  failCount++;
  console.warn(`  ⚠️  No matching checkbox for: ${fieldNames.join(' / ')}`);
}

function listFormFields(form: any): string[] {
  try {
    const fields = form.getFields();
    console.log('📋 PDF Form Fields:', fields.length, 'fields found');
    const fieldInfo = fields.map((field: any) => ({
      Name: field.getName(),
      Type: field.constructor.name
    }));
    console.table(fieldInfo);
    return fields.map((f: any) => f.getName());
  } catch (error) {
    console.error('Error listing form fields:', error);
    throw new Error('Could not read form fields from PDF.');
  }
}

// ─── Field Filling Logic ───────────────────────────────────────────────────────

function fillCommonFields(form: any, receipt: Receipt, isCommission: boolean) {
  // Client name - different field names across templates
  fillFieldAny(form, isCommission ? ['CLIENT NAME'] : ['CLIENT NAME', 'Text3'], receipt.client_name);
  fillField(form, 'CR or CPR No', receipt.client_id_number);
  fillField(form, 'FULL AMOUNT DUE IN BD', receipt.full_amount_due_bd);
  fillField(form, 'AMOUNT PAID IN BD', receipt.amount_paid_bd);
  fillField(form, 'BALANCE AMOUNT IN BD', receipt.balance_amount_bd);
  fillField(form, 'PAYMENT DATE', receipt.payment_date);
  fillField(form, 'AMOUNT PAID IN WORDS', receipt.amount_paid_words);
  fillField(form, 'RECEIPT No', receipt.receipt_number);
  fillField(form, 'AGENT NAME', receipt.agent_name);
  fillField(form, 'SPECIAL NOTE', receipt.special_note);
}

function fillPaymentMethod(form: any, receipt: Receipt) {
  checkField(form, 'BF', receipt.payment_method === 'BENEFIT');
  checkField(form, 'TT', receipt.payment_method === 'BANK TT');
  checkField(form, 'Cash', receipt.payment_method === 'CASH');
  checkField(form, 'Cheque', receipt.payment_method === 'CHEQUE');
  if (receipt.payment_method === 'CHEQUE') {
    fillField(form, 'ChequeNumber', receipt.cheque_number);
  }
}

function fillPropertyType(form: any, receipt: Receipt, isCommission: boolean) {
  checkField(form, 'Land', receipt.property_type === 'LAND');
  checkField(form, 'Villa', receipt.property_type === 'VILLA');
  checkField(form, 'Flat', receipt.property_type === 'FLAT');
  checkField(form, 'Building', receipt.property_type === 'BUILDING');
  checkFieldAny(form, isCommission ? ['Other'] : ['Button5', 'Other'], receipt.property_type === 'OTHER');
  if (receipt.property_type === 'OTHER' && receipt.property_type_other) {
    fillField(form, 'OtherText', receipt.property_type_other);
  }
}

function fillCommissionFields(form: any, receipt: Receipt) {
  fillField(form, 'PAID AGAINST INVOICE No', receipt.invoice_number);
  fillField(form, 'NVOICE DATE', receipt.invoice_date);
  fillField(form, 'Transaction Details', receipt.transaction_details);
  fillField(form, 'REPRESENTATIVE NAME', receipt.paid_by === 'OTHERS' ? receipt.paid_by_other : receipt.paid_by);
  
  checkField(form, 'Button5', receipt.paid_by === 'BUYER');
  checkField(form, 'Button6', receipt.paid_by === 'SELLER');
  checkField(form, 'Button7', receipt.paid_by === 'LANDLORD');
  checkField(form, 'Button8', receipt.paid_by === 'LANDLORD REP.');
  checkField(form, 'Button9', receipt.paid_by === 'OTHERS');
}

function fillDepositFields(form: any, receipt: Receipt) {
  // Transaction type checkboxes
  checkFieldAny(form, ['Check Box1', 'CheckBox1'], receipt.transaction_type === 'HOLDING DEPOSIT');
  checkFieldAny(form, ['Check Box2', 'CheckBox2'], receipt.transaction_type === 'PARTIAL PAYMENT');
  checkFieldAny(form, ['Check Box3', 'CheckBox3'], receipt.transaction_type === 'RESERVATION AMOUNT');
  fillFieldAny(form, ['Text4', 'Reservation Amount'], receipt.reservation_amount);
  
  // Property details - PDF template has misnamed fields:
  fillField(form, 'Plot Number', receipt.title_number);
  fillField(form, 'Title Number', receipt.case_number);
  fillField(form, 'Case Number', receipt.plot_number);
  
  // Property size
  fillField(form, 'Size in Square Metres', receipt.size_m2);
  fillField(form, 'Size in Feet Metres', receipt.size_f2);
  fillField(form, 'Number of Roads', receipt.number_of_roads);
  
  // Sales price
  fillField(form, 'Price in Square Feet', receipt.price_per_f2);
  fillField(form, 'Total Sales Price', receipt.total_sales_price);
  
  // Property address
  fillFieldAny(form, ['Text2', 'Property Address'], receipt.property_address);
  fillField(form, 'Unit Number', receipt.unit_number);
  fillField(form, 'Building Number', receipt.building_number);
  fillField(form, 'Road Number', receipt.road_number);
  fillField(form, 'Block Number', receipt.block_number);
  
  // Property location
  fillField(form, 'Land Number', receipt.land_number);
  fillField(form, 'Project Name', receipt.project_name);
  fillField(form, 'Area Name', receipt.area_name);
  
  // Commission
  fillField(form, 'Total Buyer Commission', receipt.buyer_commission_bd);
}

// ─── PDF Generation ────────────────────────────────────────────────────────────

async function generateReceiptPDFBytes(receipt: Receipt): Promise<Uint8Array> {
  successCount = 0;
  failCount = 0;
  
  console.log('🚀 Starting PDF generation:', {
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    receipt_type: receipt.receipt_type,
    branch: receipt.branch,
  });
  
  const receiptType = receipt.receipt_type?.toLowerCase();
  if (!receiptType || (receiptType !== 'commission' && receiptType !== 'deposit')) {
    throw new Error(`Invalid receipt type: ${receipt.receipt_type}. Must be 'commission' or 'deposit'.`);
  }
  
  const isCommission = receiptType === 'commission';
  const branchSuffix = getBranchTemplateSuffix(receipt.branch);
  const templateName = isCommission 
    ? `CommissionReceipt${branchSuffix}.pdf` 
    : `DepositReceipt${branchSuffix}.pdf`;

  console.log(`🔄 Loading template: ${templateName}`);
  
  const templateBytes = await loadPDFTemplate(templateName);
  
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(templateBytes, {
      updateMetadata: false,
      ignoreEncryption: true,
    });
    console.log(`✓ PDF loaded: ${pdfDoc.getPageCount()} page(s)`);
  } catch (loadError) {
    console.error('❌ Failed to load PDF:', loadError);
    console.log('🔄 Retrying with default options...');
    try {
      pdfDoc = await PDFDocument.load(templateBytes);
      console.log('✓ PDF loaded with default options');
    } catch (secondError) {
      throw new Error(`Cannot load ${templateName}: ${secondError instanceof Error ? secondError.message : String(secondError)}`);
    }
  }
  
  let form;
  let availableFields: string[] = [];
  
  try {
    form = pdfDoc.getForm();
    console.log('✓ PDF form loaded');
    availableFields = listFormFields(form);
  } catch (formError) {
    console.error('⚠️ Error accessing PDF form:', formError);
    throw new Error(`Cannot read form fields from ${templateName}: ${formError instanceof Error ? formError.message : String(formError)}`);
  }
  
  if (availableFields.length === 0) {
    throw new Error('PDF template has no form fields.');
  }

  console.log(`📝 Filling fields for ${receiptType} receipt...`);

  // Fill all sections
  fillCommonFields(form, receipt, isCommission);
  fillPaymentMethod(form, receipt);
  fillPropertyType(form, receipt, isCommission);
  
  if (isCommission) {
    fillCommissionFields(form, receipt);
  } else {
    fillDepositFields(form, receipt);
  }

  console.log(`\n📊 Summary: ${successCount} filled, ${failCount} warnings`);

  if (availableFields.length > 0) {
    form.flatten();
    console.log('🔒 Form flattened');
  }

  return await pdfDoc.save();
}

export async function generateReceiptPDF(receipt: Receipt) {
  try {
    const pdfBytes = await generateReceiptPDFBytes(receipt);
    
    const receiptNum = receipt.receipt_number || receipt.id.slice(0, 8);
    const receiptTypeLabel = receipt.receipt_type === 'commission' ? 'Commission' : 'Deposit';
    const clientName = receipt.client_name?.replace(/\s+/g, '_') || 'Client';
    const filename = `${receiptTypeLabel}_Receipt_${receiptNum}_${clientName}.pdf`;

    console.log(`✅ PDF Generated: ${filename} (${successCount} fields)`);

    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
}

export async function generateReceiptPDFPreview(receipt: Receipt): Promise<Uint8Array> {
  try {
    const pdfBytes = await generateReceiptPDFBytes(receipt);
    console.log('✅ PDF Preview Generated');
    return pdfBytes;
  } catch (error) {
    console.error('❌ PDF preview error:', error);
    throw error;
  }
}
