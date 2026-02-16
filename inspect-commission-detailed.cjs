const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/PDF/CommissionReceipt_Saar.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  console.log('Commission Receipt PDF Form Fields:\n');
  console.log('Text Fields:');
  fields.filter(f => f.constructor.name === 'PDFTextField').forEach(field => {
    console.log(`- ${field.getName()}`);
  });
  
  console.log('\nCheckboxes:');
  fields.filter(f => f.constructor.name === 'PDFCheckBox').forEach(field => {
    console.log(`- ${field.getName()}`);
  });
  
  console.log('\nRadio Groups:');
  fields.filter(f => f.constructor.name === 'PDFRadioGroup').forEach(field => {
    console.log(`- ${field.getName()}`);
    try {
      const radioField = form.getRadioGroup(field.getName());
      console.log(`  Options: ${radioField.getOptions().join(', ')}`);
    } catch (e) {
      console.log(`  (Could not get options: ${e.message})`);
    }
  });
  
  console.log('\nOther:');
  fields.filter(f => f.constructor.name !== 'PDFTextField' && f.constructor.name !== 'PDFCheckBox' && f.constructor.name !== 'PDFRadioGroup').forEach(field => {
    console.log(`- ${field.getName()} (${field.constructor.name})`);
  });
  
  // Detailed inspection of PB field
  console.log('\n=== Detailed PB Field Inspection ===');
  try {
    const pbCheck = form.getCheckBox('PB');
    console.log('PB is a CheckBox');
  } catch (e) {
    console.log('PB is NOT a CheckBox');
  }
  
  try {
    const pbRadio = form.getRadioGroup('PB');
    console.log('PB is a RadioGroup with options:', pbRadio.getOptions());
  } catch (e) {
    console.log('PB is NOT a RadioGroup');
  }
}

inspectPDF().catch(console.error);
