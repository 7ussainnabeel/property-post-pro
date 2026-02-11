/**
 * Receipt PDF Generator
 * 
 * Fills existing PDF form templates with receipt data:
 * 
 * 1. COMMISSION RECEIPT - Uses public/PDF/CommissionReceipt.pdf template
 * 2. DEPOSIT RECEIPT - Uses public/PDF/DepositReceipt.pdf template
 * 
 * The PDF templates must have fillable form fields with the following names:
 * 
 * Common fields:
 * - client_name, client_id_number, full_amount_due_bd, amount_paid_bd
 * - balance_amount_bd, payment_date, amount_paid_words, receipt_number
 * - agent_name, branch, special_note
 * - payment_method_benefit, payment_method_bank_tt, payment_method_cash, payment_method_cheque
 * - cheque_number
 * - property_type_land, property_type_flat, property_type_villa, property_type_building, property_type_other
 * 
 * Commission-specific fields:
 * - invoice_number, invoice_date, transaction_details
 * - paid_by_buyer, paid_by_seller, paid_by_landlord, paid_by_landlord_rep
 * 
 * Deposit-specific fields (actual PDF field names - grouped by section):
 * Transaction Type: Check Box1 (Holding), Check Box2 (Partial), Check Box3 (Reservation), Text4 (Amount)
 * Property Details (section): Title Number, Case Number, Plot Number
 * Property Size (section): Size in Square Metres, Size in Feet Metres, Number of Roads
 * Sales Price Details in BD (section): Price in Square Feet, Total Sales Price
 * Property Address (section): Text2, Unit Number, Building Number, Road Number, Block Number
 * Property Location (section): Land Number, Project Name, Area Name
 * Property Type: Land, Villa, Flat, Building, Button5 (Other checkbox), OtherText (Other description)
 * Other: Total Buyer Commission, Text3 (Client Name)
 */

import { PDFDocument } from 'pdf-lib';
import { Receipt } from '@/types/receipt';

/**
 * Loads a PDF template from the PDF folder
 */
async function loadPDFTemplate(templateName: string): Promise<ArrayBuffer> {
  const response = await fetch(`/PDF/${templateName}`);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templateName}`);
  }
  return await response.arrayBuffer();
}

/**
 * Safely fills a form field in the PDF
 */
let successCount = 0;
let failCount = 0;

function fillField(form: any, fieldName: string, value: any) {
  try {
    const field = form.getTextField(fieldName);
    if (field && value !== null && value !== undefined) {
      field.setText(String(value));
      successCount++;
      console.log(`✓ ${fieldName} = ${value}`);
    }
  } catch (error) {
    failCount++;
    // Only show warnings for fields that have actual values to fill
    if (value) {
      console.warn(`⚠ Missing field: ${fieldName}`);
    }
  }
}

/**
 * Safely checks a checkbox in the PDF
 */
function checkField(form: any, fieldName: string, isChecked: boolean) {
  try {
    const field = form.getCheckBox(fieldName);
    if (field && isChecked) {
      field.check();
      successCount++;
      console.log(`☑ ${fieldName}`);
    }
  } catch (error) {
    if (isChecked) {
      failCount++;
      console.warn(`⚠ Missing checkbox: ${fieldName}`);
    }
  }
}

/**
 * Lists all available form fields in the PDF for debugging
 */
function listFormFields(form: any) {
  try {
    const fields = form.getFields();
    console.log('📋 PDF Form Fields:', fields.length, 'fields found');
    
    if (fields.length > 0) {
      const fieldInfo = fields.map((field: any) => {
        const name = field.getName();
        const type = field.constructor.name;
        return { Name: name, Type: type };
      });
      console.table(fieldInfo);
    }
    
    return fields.map((f: any) => f.getName());
  } catch (error) {
    console.error('Error listing form fields:', error);
    throw new Error('Could not read form fields from PDF. The PDF may not have proper AcroForm fields.');
  }
}

async function generateReceiptPDFBytes(receipt: Receipt): Promise<Uint8Array> {
  // Reset counters
  successCount = 0;
  failCount = 0;
  
  const isCommission = receipt.receipt_type === 'commission';
  const templateName = isCommission ? 'CommissionReceipt.pdf' : 'DepositReceipt.pdf';

  console.log(`🔄 Loading ${templateName}...`);
  
  // Load the PDF template
  const templateBytes = await loadPDFTemplate(templateName);
  const pdfDoc = await PDFDocument.load(templateBytes);
  
  // Try to get the form - this may fail if PDF doesn't have proper form fields
  let form;
  let availableFields: string[] = [];
  
  try {
    form = pdfDoc.getForm();
    console.log('✓ PDF form structure loaded');
    availableFields = listFormFields(form);
  } catch (formError) {
    console.error('⚠️ Error accessing PDF form:', formError);
    const errorMsg = formError instanceof Error ? formError.message : String(formError);
    
    if (errorMsg.includes('PDFDict') || errorMsg.includes('PDFRawStream')) {
      throw new Error(`PDF structure error: The PDF file may not be a proper fillable form.\n\nTo fix this:\n1. Open your PDF in Adobe Acrobat Pro\n2. Go to Tools > Prepare Form\n3. Let Adobe detect and create form fields\n4. Save the PDF and replace it in public/PDF/ folder\n\nAlternatively, use PDFescape.com (free online tool) to add form fields.`);
    }
    
    throw new Error(`Cannot read form fields: ${errorMsg}`);
  }
  
  if (availableFields.length === 0) {
    console.error('⚠️ No form fields found! The PDF must have fillable form fields.');
    throw new Error('PDF template has no form fields. Please add fillable form fields to the PDF.');
  }

  console.log(`📝 Filling ${Object.keys(receipt).filter(k => receipt[k as keyof Receipt]).length} receipt fields...`);

  // Fill common fields (using actual PDF field names)
  fillField(form, isCommission ? 'CLIENT NAME' : 'Text3', receipt.client_name);
  fillField(form, 'CR or CPR No', receipt.client_id_number);
  fillField(form, 'FULL AMOUNT DUE IN BD', receipt.full_amount_due_bd);
  fillField(form, 'AMOUNT PAID IN BD', receipt.amount_paid_bd);
  fillField(form, 'BALANCE AMOUNT IN BD', receipt.balance_amount_bd);
  fillField(form, 'PAYMENT DATE', receipt.payment_date);
  fillField(form, 'AMOUNT PAID IN WORDS', receipt.amount_paid_words);
  fillField(form, 'RECEIPT No', receipt.receipt_number);
  fillField(form, 'AGENT NAME', receipt.agent_name);
  fillField(form, 'SPECIAL NOTE', receipt.special_note);

  // Payment method checkboxes (using actual PDF field names)
  checkField(form, 'BF', receipt.payment_method === 'BENEFIT');
  checkField(form, 'TT', receipt.payment_method === 'BANK TT');
  checkField(form, 'Cash', receipt.payment_method === 'CASH');
  checkField(form, 'Cheque', receipt.payment_method === 'CHEQUE');
  
  if (receipt.payment_method === 'CHEQUE') {
    fillField(form, 'ChequeNumber', receipt.cheque_number);
  }

  // Property type checkboxes (using actual PDF field names)
  checkField(form, 'Land', receipt.property_type === 'LAND');
  checkField(form, 'Villa', receipt.property_type === 'VILLA');
  checkField(form, 'Flat', receipt.property_type === 'FLAT');
  checkField(form, 'Building', receipt.property_type === 'BUILDING');
  checkField(form, isCommission ? 'Other' : 'Button5', receipt.property_type === 'OTHER');
  if (receipt.property_type === 'OTHER' && receipt.property_type_other) {
    fillField(form, 'OtherText', receipt.property_type_other);
  }
  
  if (isCommission) {
    // Commission-specific fields (using actual PDF field names)
    fillField(form, 'PAID AGAINST INVOICE No', receipt.invoice_number);
    fillField(form, 'NVOICE DATE', receipt.invoice_date);
    fillField(form, 'Transaction Details', receipt.transaction_details);
    fillField(form, 'REPRESENTATIVE NAME', receipt.paid_by);
    
    // Note: If your PDF has separate checkboxes for paid_by, update these field names
    // For now, we're putting the paid_by value in REPRESENTATIVE NAME field
  } else {
    // Deposit-specific fields - using actual PDF field names from inspection
    checkField(form, 'Check Box1', receipt.transaction_type === 'HOLDING DEPOSIT');
    checkField(form, 'Check Box2', receipt.transaction_type === 'PARTIAL PAYMENT');
    checkField(form, 'Check Box3', receipt.transaction_type === 'RESERVATION AMOUNT');
    fillField(form, 'Text4', receipt.reservation_amount);
    
    // Property details - using actual PDF field names from inspection
    fillField(form, 'Title Number', receipt.title_number);
    fillField(form, 'Case Number', receipt.case_number);
    fillField(form, 'Plot Number', receipt.plot_number);
    fillField(form, 'Size in Square Metres', receipt.size_m2);
    fillField(form, 'Size in Feet Metres', receipt.size_f2);
    fillField(form, 'Number of Roads', receipt.number_of_roads);
    fillField(form, 'Price in Square Feet', receipt.price_per_f2);
    fillField(form, 'Total Sales Price', receipt.total_sales_price);
    fillField(form, 'Text2', receipt.property_address);
    fillField(form, 'Unit Number', receipt.unit_number);
    fillField(form, 'Building Number', receipt.building_number);
    fillField(form, 'Road Number', receipt.road_number);
    fillField(form, 'Block Number', receipt.block_number);
    fillField(form, 'Land Number', receipt.land_number);
    fillField(form, 'Project Name', receipt.project_name);
    fillField(form, 'Area Name', receipt.area_name);
    fillField(form, 'Total Buyer Commission', receipt.buyer_commission_bd);
  }

  // Show summary
  console.log(`\n📊 Fill Summary: ${successCount} fields filled successfully${failCount > 0 ? `, ${failCount} warnings` : ''}`);

  // Flatten the form to make it non-editable
  if (availableFields.length > 0) {
    form.flatten();
    console.log('🔒 Form fields locked (flattened)');
  }

  // Save and return the PDF bytes
  return await pdfDoc.save();
}

export async function generateReceiptPDF(receipt: Receipt) {
  try {
    const pdfBytes = await generateReceiptPDFBytes(receipt);
    
    // Generate filename
    const receiptNum = receipt.receipt_number || receipt.id.slice(0, 8);
    const receiptTypeLabel = receipt.receipt_type === 'commission' ? 'Commission' : 'Deposit';
    const clientName = receipt.client_name?.replace(/\s+/g, '_') || 'Client';
    const filename = `${receiptTypeLabel}_Receipt_${receiptNum}_${clientName}.pdf`;

    console.log(`✅ PDF Generated Successfully!`);
    console.log(`   📄 Filename: ${filename}`);
    console.log(`   ✓ ${successCount} fields populated`);

    // Download the PDF
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}

export async function generateReceiptPDFPreview(receipt: Receipt): Promise<Uint8Array> {
  try {
    const pdfBytes = await generateReceiptPDFBytes(receipt);
    console.log(`✅ PDF Preview Generated Successfully!`);
    return pdfBytes;
  } catch (error) {
    console.error('❌ Error generating PDF preview:', error);
    throw error;
  }
}
