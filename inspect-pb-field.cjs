const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/PDF/CommissionReceipt_Saar.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  console.log('=== Inspecting PB Field ===\n');
  
  try {
    const pbField = form.getCheckBox('PB');
    console.log('✓ PB field found as CheckBox');
    console.log('  Name:', pbField.getName());
    console.log('  Type:', pbField.constructor.name);
  } catch (e1) {
    console.log('✗ Not a checkbox:', e1.message);
  }
  
  try {
    const pbField = form.getRadioGroup('PB');
    console.log('\n✓ PB field found as RadioGroup');
    console.log('  Name:', pbField.getName());
    console.log('  Options:', pbField.getOptions());
  } catch (e2) {
    console.log('\n✗ Not a radio group:', e2.message);
  }
  
  console.log('\n=== Related Fields ===');
  const fields = form.getFields();
  fields.forEach(field => {
    const name = field.getName();
    if (name.includes('PB') || name.toLowerCase().includes('buyer') || 
        name.toLowerCase().includes('seller') || name.toLowerCase().includes('landlord') || 
        name.toLowerCase().includes('representative') || name.toLowerCase().includes('paid')) {
      console.log(`  - ${name} (${field.constructor.name})`);
    }
  });
}

inspectPDF().catch(console.error);
