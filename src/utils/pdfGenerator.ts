import jsPDF from 'jspdf';
import { Receipt } from '@/types/receipt';
import { getBranchName } from '@/lib/branches';

const YELLOW = [255, 204, 0] as const;
const NAVY = [26, 42, 74] as const;
const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;
const GRAY = [200, 200, 200] as const;
const LIGHT_GRAY = [245, 245, 245] as const;

function drawCheckbox(doc: jsPDF, x: number, y: number, checked: boolean) {
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.rect(x, y, 4, 4);
  if (checked) {
    doc.setFillColor(...NAVY);
    doc.rect(x + 0.5, y + 0.5, 3, 3, 'F');
  }
}

function drawHeader(doc: jsPDF) {
  // Yellow header bar
  doc.setFillColor(...YELLOW);
  doc.rect(0, 0, 210, 30, 'F');

  // Title
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  doc.text('سند إستلام', 15, 12);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 15, 20);

  // Carlton logo area (right side)
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('CARLTON REAL ESTATE', 155, 15, { align: 'center' });
}

function drawFieldRow(doc: jsPDF, label: string, labelAr: string, value: string, x: number, y: number, width: number) {
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(labelAr, x, y);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(label, x, y + 4);
  doc.setFont('helvetica', 'normal');

  // Value line
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(x, y + 7, x + width, y + 7);
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(value || '', x + 1, y + 6);
}

function drawFooter(doc: jsPDF, receipt: Receipt) {
  const y = 260;
  const branchName = receipt.branch ? getBranchName(receipt.branch) : 'Seef';

  // Thank you / Special note
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(10, y, 90, 20, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text('شكراً لكم', 12, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank You', 12, y + 9);
  doc.setFont('helvetica', 'normal');

  // Carlton accounts stamp area
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text('CARLTON REAL ESTATE', 55, y + 14);
  doc.text('ACCOUNTS', 55, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(branchName, 55, y + 20);
  doc.setFont('helvetica', 'normal');

  // Special note
  doc.setDrawColor(...GRAY);
  doc.rect(105, y, 95, 20);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('ملاحظة خاصة', 107, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('SPECIAL NOTE:', 107, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(receipt.special_note || '', 107, y + 13, { maxWidth: 90 });

  // Signature / Agent
  const sy = y + 22;
  doc.setDrawColor(...GRAY);
  doc.rect(10, sy, 60, 10);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('التوقيع', 12, sy + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('Signature', 12, sy + 8);
  doc.setFont('helvetica', 'normal');

  doc.rect(75, sy, 65, 10);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('تمت هذه المعاملة بواسطة', 77, sy + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('THIS DEAL IS CONCLUDED BY', 77, sy + 8);
  doc.setFont('helvetica', 'normal');

  doc.rect(145, sy, 55, 10);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('اسم الوسيط', 147, sy + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('AGENT NAME', 147, sy + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(receipt.agent_name || '', 147, sy + 6);

  // Disclaimer
  const dy = sy + 13;
  doc.setFontSize(7);
  doc.setTextColor(200, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTE:', 10, dy);
  doc.text('THIS RECEIPT IS INVALID FOR DISHONORED CHEQUES', 10, dy + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${branchName} Branch. CR. No. 20507-5`, 150, dy + 4);

  // Bottom bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFontSize(6);
  doc.setTextColor(...WHITE);
  doc.text('CarltonBahrain - www.icarlton.com - Carlton Real Estate - عقارات كارلتون', 105, 293, { align: 'center' });
}

export async function generateReceiptPDF(receipt: Receipt) {
  const doc = new jsPDF('portrait', 'mm', 'a4');

  drawHeader(doc);

  // Receipt type heading
  const isCommission = receipt.receipt_type === 'commission';
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...GRAY);
  doc.rect(10, 35, 190, 10);
  doc.setFillColor(...YELLOW);
  doc.rect(10, 35, 190, 0.5, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text(isCommission ? 'مبلغ العمولة' : 'مبلغ العربون', 12, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(isCommission ? 'COMMISSION AMOUNT' : 'DEPOSIT AMOUNT', 12, 44);
  doc.setFont('helvetica', 'normal');

  let y = 52;

  // Client info section
  drawFieldRow(doc, 'CLIENT NAME', 'اسم العميل', receipt.client_name || '', 10, y, 90);
  y += 12;
  drawFieldRow(doc, 'CPR or PASSPORT or CR No.', 'الرقم الشخصي او الجواز او السجل التجاري', receipt.client_id_number || '', 10, y, 90);
  drawFieldRow(doc, 'FULL AMOUNT DUE IN BD', 'المبلغ المستحق بالدينار', receipt.full_amount_due_bd?.toString() || '', 110, y, 90);
  y += 12;
  drawFieldRow(doc, 'PAYMENT DATE', 'تاريخ الدفع', receipt.payment_date || '', 10, y, 90);

  // Highlighted Amount Paid
  doc.setFillColor(...YELLOW);
  doc.rect(110, y - 2, 90, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...BLACK);
  doc.text('المبلغ المدفوع بالدينار', 112, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AMOUNT PAID IN BD', 112, y + 5);
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(receipt.amount_paid_bd?.toString() || '', 112, y + 9);
  doc.setFont('helvetica', 'normal');
  y += 14;

  drawFieldRow(doc, 'RECEIPT No.', 'رقم الرصيد', receipt.receipt_number || '', 10, y, 90);
  drawFieldRow(doc, 'BALANCE AMOUNT IN BD', 'الباقي من المبلغ المستحق بالدينار', receipt.balance_amount_bd?.toString() || '', 110, y, 90);
  y += 12;

  drawFieldRow(doc, 'AMOUNT PAID IN WORDS', 'المبلغ المدفوع بالكلمات', receipt.amount_paid_words || '', 10, y, 190);
  y += 12;

  if (isCommission) {
    drawFieldRow(doc, 'PAID AGAINST INVOICE No.', 'المبلغ المدفوع مقابل الفاتورة رقم', receipt.invoice_number || '', 10, y, 90);
    drawFieldRow(doc, 'INVOICE DATE', 'تاريخ الفاتورة', receipt.invoice_date || '', 110, y, 90);
    y += 14;
  }

  // Payment Method checkboxes
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('طريقة الدفع', 10, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('PAYMENT METHOD', 10, y + 4);
  doc.setFont('helvetica', 'normal');

  const methods = ['BENEFIT', 'BANK TT', 'CASH', 'CHEQUE'];
  const methodLabels = ['بنفت', 'تحويل مصرفي', 'نقداً', 'شيك'];
  methods.forEach((m, i) => {
    const mx = 55 + i * 32;
    doc.setFontSize(7);
    doc.text(methodLabels[i], mx, y);
    doc.setFont('helvetica', 'bold');
    doc.text(m, mx, y + 4);
    doc.setFont('helvetica', 'normal');
    drawCheckbox(doc, mx + 20, y - 1, receipt.payment_method === m);
  });

  // Cheque number
  if (receipt.payment_method === 'CHEQUE') {
    doc.setFontSize(7);
    doc.text('رقم الشيك', 175, y);
    doc.setFont('helvetica', 'bold');
    doc.text('CHEQUE No.', 175, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(receipt.cheque_number || '', 175, y + 8);
  }
  y += 12;

  if (isCommission) {
    // Paid By checkboxes
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('تم الدفع', 10, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('PAID BY', 10, y + 4);
    doc.setFont('helvetica', 'normal');

    const paidOptions = ['BUYER', 'SELLER', 'LANDLORD', 'LANDLORD REP.'];
    const paidLabels = ['مشتري', 'بائع', 'مالك العقار', 'ممثل المالك'];
    paidOptions.forEach((p, i) => {
      const px = 55 + i * 32;
      doc.setFontSize(7);
      doc.text(paidLabels[i], px, y);
      doc.setFont('helvetica', 'bold');
      doc.text(p, px, y + 4);
      doc.setFont('helvetica', 'normal');
      drawCheckbox(doc, px + 22, y - 1, receipt.paid_by === p);
    });
    y += 12;
  }

  if (!isCommission) {
    // Transaction type checkboxes for deposit
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('نوع المعاملة', 10, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('TRANSACTION TYPE', 10, y + 4);
    doc.setFont('helvetica', 'normal');

    const txTypes = ['HOLDING DEPOSIT', 'PARTIAL PAYMENT'];
    const txLabels = ['عربون للمراجعة', 'دفعة جزئية'];
    txTypes.forEach((t, i) => {
      const tx = 65 + i * 45;
      doc.setFontSize(7);
      doc.text(txLabels[i], tx, y);
      doc.setFont('helvetica', 'bold');
      doc.text(t, tx, y + 4);
      doc.setFont('helvetica', 'normal');
      drawCheckbox(doc, tx + 35, y - 1, receipt.transaction_type === t);
    });

    doc.setFontSize(7);
    doc.text('مبلغ الحجز', 160, y);
    doc.setFont('helvetica', 'bold');
    doc.text('RESERVATION AMOUNT', 160, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(...GRAY);
    doc.line(160, y + 7, 200, y + 7);
    doc.setFontSize(8);
    doc.text(receipt.reservation_amount?.toString() || '', 161, y + 6);
    y += 12;
  }

  // Property Type checkboxes
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('نوع العقار', 10, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('PROPERTY TYPE', 10, y + 4);
  doc.setFont('helvetica', 'normal');

  const propTypes = ['LAND', 'FLAT', 'VILLA', 'BUILDING', 'OTHER'];
  const propLabels = ['أرض', 'شقة', 'فيلا', 'بناية', 'عقارات أخرى'];
  propTypes.forEach((p, i) => {
    const px = 50 + i * 28;
    doc.setFontSize(7);
    doc.text(propLabels[i], px, y);
    doc.setFont('helvetica', 'bold');
    doc.text(p, px, y + 4);
    doc.setFont('helvetica', 'normal');
    drawCheckbox(doc, px + 16, y - 1, receipt.property_type === p);
  });
  y += 14;

  if (isCommission) {
    // Transaction details
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('وصف المعاملة', 10, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLACK);
    doc.text('TRANSACTION DETAILS:', 10, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(...GRAY);
    doc.rect(10, y + 6, 190, 25);
    doc.setFontSize(8);
    doc.text(receipt.transaction_details || '', 12, y + 11, { maxWidth: 186 });
  } else {
    // Deposit property details
    const fields = [
      [
        { label: 'PROPERTY DETAILS', ar: 'تفاصيل العقار', val: receipt.property_details },
        { label: 'TITLE No.', ar: 'رقم الوثيقة', val: receipt.title_number },
        { label: 'CASE No.', ar: 'رقم المقدمة', val: receipt.case_number },
        { label: 'PLOT No.', ar: 'رقم القطعة', val: receipt.plot_number },
      ],
      [
        { label: 'PROPERTY SIZE', ar: 'مساحة العقار', val: receipt.property_size },
        { label: 'SIZE IN M²', ar: 'المساحة بالمتر²', val: receipt.size_m2 },
        { label: 'SIZE IN F²', ar: 'مساحة بالقدم²', val: receipt.size_f2 },
        { label: 'NO. OF ROADS', ar: 'عدد الشوارع', val: receipt.number_of_roads },
      ],
      [
        { label: 'SALES PRICE DETAILS IN BD', ar: 'تفاصيل سعر البيع بالدينار', val: receipt.price_per_f2 },
        { label: 'PROPERTY TOTAL SALES PRICE', ar: 'إجمالي سعر بيع العقار', val: receipt.total_sales_price },
      ],
      [
        { label: 'PROPERTY ADDRESS', ar: 'عنوان العقار', val: receipt.property_address },
        { label: 'UNIT No.', ar: 'رقم الوحدة', val: receipt.unit_number },
        { label: 'BLDG No.', ar: 'رقم المبنى', val: receipt.building_number },
        { label: 'ROAD No.', ar: 'رقم الشارع', val: receipt.road_number },
        { label: 'BLOCK No.', ar: 'رقم المجمع', val: receipt.block_number },
      ],
      [
        { label: 'PROPERTY LOCATION', ar: 'موقع العقار', val: receipt.property_location },
        { label: 'LAND No.', ar: 'رقم الأرض', val: receipt.land_number },
        { label: 'PROJECT NAME', ar: 'اسم المشروع او المخطط', val: receipt.project_name },
        { label: 'AREA NAME', ar: 'اسم المنطقة', val: receipt.area_name },
      ],
    ];

    fields.forEach((row) => {
      const colW = 190 / row.length;
      row.forEach((f, i) => {
        drawFieldRow(doc, f.label, f.ar, f.val || '', 10 + i * colW, y, colW - 5);
      });
      y += 12;
    });

    // Buyer commission note
    doc.setFontSize(6);
    doc.setTextColor(...BLACK);
    doc.text('OUR BUYER COMMISSION FOR THIS DEAL WILL BE 1.1% OF THE PROPERTY TOTAL PURCHASED PRICE INCLUSIVE OF VAT = BD:', 10, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.buyer_commission_bd || '', 190, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }

  drawFooter(doc, receipt);

  const filename = `${receipt.receipt_type}_receipt_${receipt.receipt_number || receipt.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
