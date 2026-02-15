const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function diagnosePDF() {
  console.log('🔍 Diagnosing DepositReceipt.pdf...\n');
  
  const pdfPath = path.join(__dirname, 'public', 'PDF', 'DepositReceipt.pdf');
  
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ File not found:', pdfPath);
    return;
  }
  
  // Get file size
  const stats = fs.statSync(pdfPath);
  console.log(`📄 File size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
  
  // Read file
  const pdfBytes = fs.readFileSync(pdfPath);
  console.log(`✓ File read successfully`);
  
  // Check if it starts with PDF header
  const header = pdfBytes.slice(0, 8).toString();
  console.log(`📋 PDF Header: ${header}`);
  
  if (!header.startsWith('%PDF-')) {
    console.error('❌ Invalid PDF header! File may be corrupted.');
    return;
  }
  
  // Try loading with different options
  console.log('\n🔄 Attempting to load PDF...\n');
  
  const loadOptions = [
    { name: 'Default', options: {} },
    { name: 'ignoreEncryption', options: { ignoreEncryption: true } },
    { name: 'updateMetadata: false', options: { updateMetadata: false } },
    { name: 'Both options', options: { ignoreEncryption: true, updateMetadata: false } },
  ];
  
  for (const { name, options } of loadOptions) {
    try {
      console.log(`Trying with ${name}...`);
      const pdfDoc = await PDFDocument.load(pdfBytes, options);
      console.log(`✅ SUCCESS with ${name}!`);
      
      const pageCount = pdfDoc.getPageCount();
      console.log(`   Pages: ${pageCount}`);
      
      try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        console.log(`   Form fields: ${fields.length}`);
        
        console.log('\n✓ PDF is loadable with these options!\n');
        break;
      } catch (formError) {
        console.log(`   ⚠️  Form access failed: ${formError.message}`);
      }
    } catch (error) {
      console.log(`❌ Failed with ${name}: ${error.message}\n`);
    }
  }
}

diagnosePDF().catch(console.error);
