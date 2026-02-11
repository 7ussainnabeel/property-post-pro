/**
 * Script to inspect PDF form fields
 * Run with: npx tsx scripts/inspect-pdf-fields.ts
 */

import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function inspectPDF(pdfPath: string) {
  console.log(`\n🔍 Inspecting: ${pdfPath}\n`);
  
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`📋 Found ${fields.length} form fields:\n`);
    
    const fieldsByType: Record<string, Array<{ name: string; type: string }>> = {
      'Text Fields': [],
      'Checkboxes': [],
      'Radio Buttons': [],
      'Dropdowns': [],
      'Other': []
    };
    
    fields.forEach((field: any) => {
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
  const depositPDF = path.join(process.cwd(), 'public/PDF/DepositReceipt.pdf');
  const commissionPDF = path.join(process.cwd(), 'public/PDF/CommissionReceipt.pdf');
  
  if (fs.existsSync(depositPDF)) {
    await inspectPDF(depositPDF);
  } else {
    console.log('❌ DepositReceipt.pdf not found');
  }
  
  if (fs.existsSync(commissionPDF)) {
    await inspectPDF(commissionPDF);
  } else {
    console.log('❌ CommissionReceipt.pdf not found');
  }
}

main().catch(console.error);
