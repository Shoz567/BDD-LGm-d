import { jsPDF } from 'jspdf';
import { CartItem } from './cart';

function fmt(v: number | null | undefined): string {
  if (!v) return '—';
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC';
}

function pageW(doc: jsPDF) {
  return doc.internal.pageSize.width;
}
function pageH(doc: jsPDF) {
  return doc.internal.pageSize.height;
}

function drawHeader(doc: jsPDF, title: string, subtitle: string, date: string, offsetY = 0) {
  const w = pageW(doc);
  doc.setFillColor(26, 61, 53);
  doc.rect(0, offsetY, w, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LGm@d', 14, offsetY + 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Plateforme MAD', 14, offsetY + 19);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, w - 14, offsetY + 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Date : ' + date, w - 14, offsetY + 18, { align: 'right' });

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 14, offsetY + 32);
}

function drawTable(
  doc: jsPDF,
  headers: string[],
  colWidths: number[],
  rows: string[][],
  startY: number,
  rightAlignFrom: number,
  headerColor: [number, number, number] = [26, 61, 53],
): number {
  const marginLeft = 14;
  const rowH = 9;
  const headerH = 10;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  // En-tête
  doc.setFillColor(...headerColor);
  doc.rect(marginLeft, startY, totalW, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  let x = marginLeft;
  headers.forEach((h, i) => {
    const isRight = i >= rightAlignFrom;
    doc.text(h, isRight ? x + colWidths[i] - 3 : x + 3, startY + 7, { align: isRight ? 'right' : 'left' });
    x += colWidths[i];
  });

  // Lignes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  let y = startY + headerH;
  rows.forEach((row, ri) => {
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 249);
      doc.rect(marginLeft, y, totalW, rowH, 'F');
    }
    doc.setTextColor(40, 40, 40);
    x = marginLeft;
    row.forEach((cell, ci) => {
      const isRight = ci >= rightAlignFrom;
      doc.text(cell, isRight ? x + colWidths[ci] - 3 : x + 3, y + 6.5, { align: isRight ? 'right' : 'left' });
      x += colWidths[ci];
    });
    doc.setDrawColor(225, 225, 225);
    doc.line(marginLeft, y + rowH, marginLeft + totalW, y + rowH);
    y += rowH;
  });

  return y;
}

function drawTotalRow(doc: jsPDF, leftLabel: string, rightValue: string, y: number, tableWidth: number) {
  const marginLeft = 14;
  doc.setFillColor(26, 61, 53);
  doc.rect(marginLeft, y + 2, tableWidth, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(leftLabel, marginLeft + 4, y + 9.5);
  doc.text(rightValue, marginLeft + tableWidth - 4, y + 9.5, { align: 'right' });
}

function drawFooter(doc: jsPDF, note: string) {
  const h = pageH(doc);
  const w = pageW(doc);
  doc.setFillColor(245, 247, 246);
  doc.rect(0, h - 16, w, 16, 'F');
  doc.setTextColor(130, 130, 130);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text(note, 14, h - 5);
}

// ─── PDF Client (portrait A4) ─────────────────────────────────────────────────

export function downloadClientPdf(items: CartItem[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const date = new Date().toLocaleDateString('fr-FR');
  const total = items.reduce((s, i) => s + (i.prix_ttc ?? 0) * i.quantite, 0);

  drawHeader(doc, 'Devis client', 'Detail des articles - Prix TTC', date);

  // colWidths sum = 34+82+14+28+24 = 182 = pageW(210) - 2*14
  const colWidths = [34, 82, 14, 28, 24];
  const headers = ['Reference', 'Designation', 'Qte', 'Prix unit. TTC', 'Total TTC'];
  const rows = items.map(i => [
    i.reference,
    i.nom.length > 48 ? i.nom.slice(0, 47) + '...' : i.nom,
    String(i.quantite),
    fmt(i.prix_ttc),
    fmt((i.prix_ttc ?? 0) * i.quantite),
  ]);

  const endY = drawTable(doc, headers, colWidths, rows, 40, 3);
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  drawTotalRow(doc, 'Total TTC', fmt(total), endY + 2, tableWidth);
  drawFooter(doc, 'Document genere par LGm@d le ' + date + ' - Prix TTC en euros - TVA incluse');

  doc.save('devis-client-' + date.replace(/\//g, '-') + '.pdf');
}

// ─── PDF Fournisseur (paysage A4) ─────────────────────────────────────────────

export function downloadFournisseurPdf(
  items: CartItem[],
  prices: Record<string, { prix_achat: number | null }>,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const date = new Date().toLocaleDateString('fr-FR');

  // Paysage A4 : 297mm x 210mm, marges 14mm => largeur utile 269mm
  const totalAchat = items.reduce((s, i) => s + (prices[i.reference]?.prix_achat ?? 0) * i.quantite, 0);
  const totalTtc = items.reduce((s, i) => s + (i.prix_ttc ?? 0) * i.quantite, 0);

  // Bandeau confidentiel en haut (orange)
  doc.setFillColor(254, 243, 199);
  doc.rect(0, 0, 297, 7, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'DOCUMENT CONFIDENTIEL - USAGE PHARMACIE UNIQUEMENT - NE PAS COMMUNIQUER AU PATIENT',
    148.5, 5, { align: 'center' }
  );

  // Header avec décalage (bandeau confidentiel occupe 7mm)
  drawHeader(doc, 'Bon fournisseur', "Detail des articles - Prix d'achat & marges", date, 7);

  // colWidths sum = 35+102+12+28+28+32+22 = 259 ≤ 269 (ok)
  const colWidths = [35, 102, 12, 28, 28, 32, 22];
  const headers = ['Reference', 'Designation', 'Qte', 'Prix achat unit.', 'Total achat', 'Prix TTC client', 'Marge'];
  const rows = items.map(i => {
    const achat = prices[i.reference]?.prix_achat ?? null;
    const ttc = i.prix_ttc ?? null;
    const marge = (achat && ttc && ttc > 0)
      ? Math.round(((ttc - achat) / ttc) * 100) + ' %'
      : '—';
    return [
      i.reference,
      i.nom.length > 60 ? i.nom.slice(0, 59) + '...' : i.nom,
      String(i.quantite),
      fmt(achat),
      fmt(achat ? achat * i.quantite : null),
      fmt(ttc),
      marge,
    ];
  });

  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  // startY = 7 (bandeau) + 22 (header) + 12 (sous-titre) = 41
  const endY = drawTable(doc, headers, colWidths, rows, 49, 3, [41, 78, 70]);
  drawTotalRow(
    doc,
    'Total achat : ' + fmt(totalAchat),
    'Total TTC client : ' + fmt(totalTtc),
    endY + 2,
    tableWidth,
  );
  drawFooter(doc, 'Document genere par LGm@d le ' + date + ' - Confidentiel - usage interne pharmacie uniquement');

  doc.save('commande-fournisseur-' + date.replace(/\//g, '-') + '.pdf');
}
