const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/PDF/CommissionReceipt.pdf';
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
  
  console.log('\nOther:');
  fields.filter(f => f.constructor.name !== 'PDFTextField' && f.constructor.name !== 'PDFCheckBox').forEach(field => {
    console.log(`- ${field.getName()} (${field.constructor.name})`);
  });
}

inspectPDF().catch(console.error);
