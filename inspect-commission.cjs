const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectPDF() {
  const pdfPath = './public/PDF/CommissionReceipt.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  console.log('Commission Receipt PDF Form Fields:\n');
  fields.forEach(field => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`- ${name} (${type})`);
  });
}

inspectPDF().catch(console.error);
