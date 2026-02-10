# PDF Receipt Templates

This folder contains the PDF templates used for generating receipts. The system fills in form fields in these templates with receipt data.

## Current Templates

1. **CommissionReceipt.pdf** - For commission-based transactions
2. **DepositReceipt.pdf** - For deposit/holding transactions

## Important: Templates MUST Have Fillable Form Fields

The PDF templates need to be **fillable PDF forms** with properly named form fields. The current templates may not have these fields yet.

### How to Create Fillable PDF Forms

#### Option 1: Adobe Acrobat Pro (Recommended)
1. Open your PDF in Adobe Acrobat Pro
2. Go to **Tools** → **Prepare Form**
3. Adobe will auto-detect fields, or you can manually add them
4. For each field, set the **Field Name** to match the names below
5. Save the PDF

#### Option 2: PDFescape (Free Online Tool)
1. Go to https://www.pdfescape.com/
2. Upload your PDF
3. Use **Form Field** tools to add text fields and checkboxes
4. Name each field exactly as specified below
5. Download the modified PDF

#### Option 3: LibreOffice Draw (Free Desktop)
1. Open PDF in LibreOffice Draw
2. Insert form controls from the Form toolbar
3. Right-click each control → **Control Properties** → Set Name
4. Export as PDF

## Required Form Field Names

### Common Fields (Both Types)
- `client_name` - Text field for client name
- `client_id_number` - Text field for CPR/Passport/CR number
- `full_amount_due_bd` - Text field for full amount
- `amount_paid_bd` - Text field for amount paid
- `balance_amount_bd` - Text field for balance
- `payment_date` - Text field for payment date
- `amount_paid_words` - Text field for amount in words
- `receipt_number` - Text field for receipt number
- `agent_name` - Text field for agent name
- `branch` - Text field for branch
- `special_note` - Text field for special notes

### Payment Method Checkboxes (Both Types)
- `payment_method_benefit` - Checkbox for BENEFIT
- `payment_method_bank_tt` - Checkbox for BANK TT
- `payment_method_cash` - Checkbox for CASH
- `payment_method_cheque` - Checkbox for CHEQUE
- `cheque_number` - Text field for cheque number (if applicable)

### Property Type Checkboxes (Both Types)
- `property_type_land` - Checkbox for LAND
- `property_type_flat` - Checkbox for FLAT
- `property_type_villa` - Checkbox for VILLA
- `property_type_building` - Checkbox for BUILDING
- `property_type_other` - Checkbox for OTHER

### Commission Receipt Specific
- `invoice_number` - Text field
- `invoice_date` - Text field
- `transaction_details` - Text field (multiline)
- `paid_by_buyer` - Checkbox
- `paid_by_seller` - Checkbox
- `paid_by_landlord` - Checkbox
- `paid_by_landlord_rep` - Checkbox

### Deposit Receipt Specific
- `transaction_type_holding` - Checkbox for HOLDING DEPOSIT
- `transaction_type_partial` - Checkbox for PARTIAL PAYMENT
- `reservation_amount` - Text field
- `property_details` - Text field
- `title_number` - Text field
- `case_number` - Text field
- `plot_number` - Text field
- `property_size` - Text field
- `size_m2` - Text field
- `size_f2` - Text field
- `number_of_roads` - Text field
- `price_per_f2` - Text field
- `total_sales_price` - Text field
- `property_address` - Text field
- `unit_number` - Text field
- `building_number` - Text field
- `road_number` - Text field
- `block_number` - Text field
- `property_location` - Text field
- `land_number` - Text field
- `project_name` - Text field
- `area_name` - Text field
- `buyer_commission_bd` - Text field

## Testing Your Template

After creating the fillable form:
1. Try exporting a receipt from the application
2. Open the browser console (F12) to see detailed logs
3. The console will show:
   - Which fields were found in the PDF
   - Which fields were successfully filled
   - Any warnings for missing fields

## Troubleshooting

**Problem:** Exported PDF has no data filled in  
**Solution:** Your PDF templates likely don't have fillable form fields. Follow one of the methods above to add them.

**Problem:** Some fields are filled but not all  
**Solution:** Check the browser console to see which fields are missing. Make sure field names match exactly (case-sensitive).

**Problem:** Error loading PDF template  
**Solution:** Make sure the PDF files are in `public/PDF/` folder and named correctly.
