/**
 * Script to inspect PDF form fields
 * Run with: node scripts/inspect-pdf-fields.mjs
 */

import { PDFDocument } from 'pdf-lib';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function inspectPDF(pdfPath) {
  console.log(`\n🔍 Inspecting: ${pdfPath}\n`);
  
  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`📋 Found ${fields.length} form fields:\n`);
    
    const fieldsByType = {
      'Text Fields': [],
      'Checkboxes': [],
      'Radio Buttons': [],
      'Dropdowns': [],
      'Other': []
    };
    
    fields.forEach((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      
      if (type.includes('Text')) {
        fieldsByType['Text Fields'].push({ name, type });
      } else if (type.includes('CheckBox')) {
        fieldsByType['Checkboxes'].push({ name, type });
      } else if (type.includes('Radio')) {
        fieldsByType['Radio Buttons'].push({ name, type });
      } else if (type.includes('Dropdown')) {
        fieldsByType['Dropdowns'].push({ name, type });
      } else {
        fieldsByType['Other'].push({ name, type });
      }
    });
    
    // Print by category
    Object.entries(fieldsByType).forEach(([category, fields]) => {
      if (fields.length > 0) {
        console.log(`\n${category} (${fields.length}):`);
        console.log('─'.repeat(60));
        fields.forEach(({ name, type }) => {
          console.log(`  ${name.padEnd(40)} [${type}]`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error reading form fields:', error);
  }
}

async function main() {
  const projectRoot = join(__dirname, '..');
  const depositPDF = join(projectRoot, 'public/PDF/DepositReceipt.pdf');
  const commissionPDF = join(projectRoot, 'public/PDF/CommissionReceipt.pdf');
  
  if (existsSync(depositPDF)) {
    await inspectPDF(depositPDF);
  } else {
    console.log('❌ DepositReceipt.pdf not found at:', depositPDF);
  }
  
  if (existsSync(commissionPDF)) {
    await inspectPDF(commissionPDF);
  } else {
    console.log('❌ CommissionReceipt.pdf not found at:', commissionPDF);
  }
}

main().catch(console.error);
