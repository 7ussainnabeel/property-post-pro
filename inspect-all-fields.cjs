const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/PDF/CommissionReceipt.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  console.log('All Commission Receipt PDF Fields:\n');
  fields.forEach((field, index) => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`${index + 1}. "${name}" (${type})`);
  });
  console.log(`\nTotal: ${fields.length} fields`);
}

inspectPDF().catch(console.error);
