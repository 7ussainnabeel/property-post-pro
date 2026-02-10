# PDF Form Troubleshooting

## Error: "Expected instance of PDFDict2, but got instance of PDFRawStream2"

This error means your PDF file has an incorrect internal structure. The PDF may have form-like elements, but they're not properly formatted as fillable form fields (AcroForm).

### Common Causes:
1. PDF was created with annotations instead of form fields
2. PDF was saved in an incompatible format
3. Form fields were added but the PDF wasn't saved properly
4. PDF was edited with incompatible software

### How to Fix:

#### Method 1: Adobe Acrobat Pro (Recommended)
1. Open your PDF in Adobe Acrobat Pro
2. Go to **Tools** → **Prepare Form**
3. Click "Start"
4. Adobe will analyze and prepare the form
5. Click **Preview** to test
6. **File** → **Save As** → Save with a new name
7. Replace the file in `public/PDF/` folder

#### Method 2: Recreate with PDFescape (Free Online)
1. Go to https://www.pdfescape.com/
2. Click **Upload PDF to PDFescape**
3. Use the form tools to add text fields and checkboxes:
   - Click **Form Field** → **Text** for text inputs
   - Click **Form Field** → **Check** for checkboxes
4. For each field, click it and set the **Name** property to match required names
5. Click **Download & Save** → **Save to computer**
6. Replace the file in `public/PDF/` folder

#### Method 3: Start from Scratch
If the above methods don't work, you may need to create a new PDF:

1. **Create in Word/LibreOffice:**
   - Design your receipt layout
   - Leave blank spaces where data should go
   - Save as PDF

2. **Add Form Fields:**
   - Open in Adobe Acrobat Pro or PDFescape
   - Add text fields exactly where you left blank spaces
   - Name each field according to the required field names
   - Save

### Verify Your PDF:

After fixing, verify the PDF works:

1. Open the PDF in Adobe Acrobat Reader
2. Click inside a field - if you can type, it's a proper form field
3. Try exporting a receipt from the app
4. Check the browser console (F12) for field detection

### Still Having Issues?

The PDF templates need these exact characteristics:

✅ **Must Have:**
- AcroForm dictionary in PDF structure
- Named form fields (text fields and checkboxes)
- Fields with proper names matching the app's expected names

❌ **Won't Work:**
- PDFs with just annotations
- PDFs with form-like visual elements but no actual fields
- PDFs with fields but saved in incompatible format
- Scanned PDFs without form fields

### Alternative: Use Our Template Generator

If you continue having issues, you can:
1. Remove the PDF templates temporarily
2. The app will fall back to generating PDFs from scratch
3. While not using your exact template design, it will work

To do this, rename the PDF files:
```bash
mv public/PDF/CommissionReceipt.pdf public/PDF/CommissionReceipt.pdf.backup
mv public/PDF/DepositReceipt.pdf public/PDF/DepositReceipt.pdf.backup
```

Contact support if you need help creating proper PDF templates.
