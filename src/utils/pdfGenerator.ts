/**
 * Receipt PDF Generator
 * 
 * Fills existing PDF form templates with receipt data:
 * 
 * 1. COMMISSION RECEIPT - Uses public/PDF/CommissionReceipt.pdf template (31 fields)
 * 2. DEPOSIT RECEIPT - Uses public/PDF/DepositReceipt.pdf template (42 fields)
 * 
 * COMMISSION RECEIPT FIELDS:
 * -------------------------
 * Common: AGENT NAME, CLIENT NAME, CR or CPR No, FULL AMOUNT DUE IN BD, PAYMENT DATE,
 *         AMOUNT PAID IN BD, RECEIPT No, BALANCE AMOUNT IN BD (auto-calculated),
 *         AMOUNT PAID IN WORDS (auto-generated), SPECIAL NOTE
 * 
 * Payment: BF, TT, Cash, Cheque (checkboxes), ChequeNumber
 * 
 * Property: Land, Villa, Flat, Building, Other (checkboxes), OtherText
 * 
 * Commission-specific:
 *   - PAID AGAINST INVOICE No, NVOICE DATE
 *   - Transaction Details (textarea)
 *   - REPRESENTATIVE NAME (text field for paid_by)
 *   - Button5 (Buyer), Button6 (Seller), Button7 (Landlord), Button8 (Landlord Rep.) checkboxes
 * 
 * DEPOSIT RECEIPT FIELDS:
 * ----------------------
 * Common: Same as Commission + Text3 (Client Name)
 * 
 * Transaction Type: Check Box1 (Holding), Check Box2 (Partial), Check Box3 (Reservation), 
 *                   Text4 (Reservation Amount)
 * 
 * Property Details: Title Number, Case Number, Plot Number
 * Property Size: Size in Square Metres, Size in Feet Metres, Number of Roads
 * Sales Price: Price in Square Feet, Total Sales Price
 * Property Address: Text2 (full address), Unit Number, Building Number, Road Number, Block Number
 * Property Location: Land Number, Project Name, Area Name
 * Property Type: Land, Villa, Flat, Building, Button5 (Other checkbox), OtherText
 * Other: Total Buyer Commission
 */

import { PDFDocument } from 'pdf-lib';
import { Receipt } from '@/types/receipt';

/**
 * Maps branch ID to the PDF template file suffix.
 * Default (manama/seef) uses the base template with no suffix.
 */
function getBranchTemplateSuffix(branch: string | null): string {
  switch (branch) {
    case 'saar':
      return '_Saar';
    case 'amwaj-island':
      return '_Amwaj';
    default:
      // Manama and Seef use the default template
      return '';
  }
}

/**
 * Loads a PDF template from the PDF folder
 */
async function loadPDFTemplate(templateName: string): Promise<ArrayBuffer> {
  // Add cache busting and better error handling
  const response = await fetch(`/PDF/${templateName}?t=${Date.now()}`, {
    cache: 'no-cache',
    headers: {
      'Accept': 'application/pdf',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templateName} (Status: ${response.status})`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  console.log(`✓ Loaded ${templateName}: ${arrayBuffer.byteLength} bytes`);
  
  // Validate it's a PDF
  const uint8 = new Uint8Array(arrayBuffer);
  const header = String.fromCharCode(...uint8.slice(0, 5));
  if (!header.startsWith('%PDF-')) {
    throw new Error(`Invalid PDF file: ${templateName} (Header: ${header})`);
  }
  
  return arrayBuffer;
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
      console.log(`  ✓ ${fieldName} = ${value}`);
    } else if (value !== null && value !== undefined) {
      console.log(`  ⚠️  Field "${fieldName}" exists but has no value`);
    }
  } catch (error) {
    failCount++;
    // Only show warnings for fields that have actual values to fill
    if (value !== null && value !== undefined && value !== '') {
      console.warn(`  ⚠️  Missing or invalid field: "${fieldName}" (attempted value: ${value})`);
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
      console.log(`  ☑ ${fieldName} = checked`);
    }
  } catch (error) {
    if (isChecked) {
      failCount++;
      console.warn(`  ⚠️  Missing or invalid checkbox: "${fieldName}"`);
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
  
  console.log('🚀 Starting PDF generation for receipt:', {
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    receipt_type: receipt.receipt_type,
  });
  
  // Normalize receipt type to handle case variations
  const receiptType = receipt.receipt_type?.toLowerCase();
  if (!receiptType || (receiptType !== 'commission' && receiptType !== 'deposit')) {
    console.error('❌ Invalid or missing receipt_type:', receipt.receipt_type);
    throw new Error(`Invalid receipt type: ${receipt.receipt_type}. Must be 'commission' or 'deposit'.`);
  }
  
  const isCommission = receiptType === 'commission';
  
  // Select branch-specific template
  const branchSuffix = getBranchTemplateSuffix(receipt.branch);
  const templateName = isCommission 
    ? `CommissionReceipt${branchSuffix}.pdf` 
    : `DepositReceipt${branchSuffix}.pdf`;

  console.log(`🔄 Loading ${templateName} for receipt type: ${receiptType}...`);
  
  // Load the PDF template
  const templateBytes = await loadPDFTemplate(templateName);
  
  // Try to load PDF with error handling for browser issues
  let pdfDoc;
  try {
    // First attempt with safe options
    pdfDoc = await PDFDocument.load(templateBytes, {
      updateMetadata: false,
      ignoreEncryption: true,
    });
    console.log(`✓ PDF loaded successfully with ${pdfDoc.getPageCount()} page(s)`);
  } catch (loadError) {
    console.error('❌ Failed to load PDF:', loadError);
    
    // Check if it's the specific PDFRef error
    if (loadError instanceof Error && loadError.message.includes('PDFRef')) {
      throw new Error(
        `PDF structure error in ${templateName}. ` +
        `This usually means the PDF file is corrupted or has invalid internal references. ` +
        `Please regenerate the PDF form template. Error: ${loadError.message}`
      );
    }
    
    // For other errors, try default load as fallback
    console.log('🔄 Retrying with default options...');
    try {
      pdfDoc = await PDFDocument.load(templateBytes);
      console.log('✓ PDF loaded with default options');
    } catch (secondError) {
      throw new Error(`Cannot load ${templateName}: ${secondError instanceof Error ? secondError.message : String(secondError)}`);
    }
  }
  
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

  // Log receipt data for debugging
  console.log('📦 Receipt data received:', {
    client_name: receipt.client_name,
    client_id_number: receipt.client_id_number,
    full_amount_due_bd: receipt.full_amount_due_bd,
    amount_paid_bd: receipt.amount_paid_bd,
    balance_amount_bd: receipt.balance_amount_bd,
    payment_date: receipt.payment_date,
    receipt_number: receipt.receipt_number,
    agent_name: receipt.agent_name,
    payment_method: receipt.payment_method,
    property_type: receipt.property_type,
    ...(receiptType === 'deposit' && {
      transaction_type: receipt.transaction_type,
      reservation_amount: receipt.reservation_amount,
      title_number: receipt.title_number,
      case_number: receipt.case_number,
      plot_number: receipt.plot_number,
      size_m2: receipt.size_m2,
      size_f2: receipt.size_f2,
      property_address: receipt.property_address,
      project_name: receipt.project_name,
      area_name: receipt.area_name,
    }),
  });

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
    
    // Paid By checkboxes (Button5-Button8 in Commission Receipt PDF)
    checkField(form, 'Button5', receipt.paid_by === 'BUYER');
    checkField(form, 'Button6', receipt.paid_by === 'SELLER');
    checkField(form, 'Button7', receipt.paid_by === 'LANDLORD');
    checkField(form, 'Button8', receipt.paid_by === 'LANDLORD REP.');
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
