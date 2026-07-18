import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Payment, User } from "@/shared/schema";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mbway: "MBWay",
  transferencia: "Transferência Bancária (NIB)",
  dinheiro: "Dinheiro",
  cheque: "Cheque",
  outro: "Outro",
};

/**
 * Gera automaticamente a fatura (PDF) de um pagamento aprovado.
 * Todos os dados são preenchidos pelo sistema a partir do pagamento e dos utilizadores envolvidos.
 */
export function generateInvoicePDF(payment: Payment, payer?: User, approver?: User) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Cabeçalho ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("SMART CONDO", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Gestão de Condomínio", 14, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("FATURA", pageWidth - 14, 20, { align: "right" });

  const invoiceNumber = `FAT-${payment.id}-${new Date(payment.paidDate || payment.approvedAt || Date.now()).getFullYear()}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Nº ${invoiceNumber}`, pageWidth - 14, 26, { align: "right" });
  const issueDate = payment.paidDate || payment.approvedAt || new Date();
  doc.text(`Data: ${new Date(issueDate).toLocaleDateString("pt-PT")}`, pageWidth - 14, 31, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 36, pageWidth - 14, 36);

  // --- Partes ---
  let y = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Emitido por", 14, y);
  doc.text("Pagador", pageWidth / 2 + 6, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  y += 6;
  doc.text("Smart Condo", 14, y);
  doc.text(payer?.name || "-", pageWidth / 2 + 6, y);
  y += 5;
  if (approver?.name) doc.text(`Aprovado por: ${approver.name}`, 14, y);
  if (payer?.unit) doc.text(`Fração: ${payer.unit}`, pageWidth / 2 + 6, y);

  // --- Tabela ---
  const amount = Number(payment.amount);
  autoTable(doc, {
    startY: y + 10,
    head: [["Título", "Quantidade", "Valor (IVA incluído)"]],
    body: [[payment.description, "1", `€ ${amount.toFixed(2)}`]],
    foot: [["", "Total", `€ ${amount.toFixed(2)}`]],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 1: { halign: "center", cellWidth: 30 }, 2: { halign: "right", cellWidth: 45 } },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Método de pagamento: ${payment.paymentMethod ? PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod : "-"}`, 14, finalY);

  // --- Assinaturas ---
  const isArrendatario = payer?.userType === "arrendatario";
  const leftLabel = isArrendatario ? "Assinatura do Condómino" : "Assinatura da Administração";
  const rightLabel = isArrendatario ? "Assinatura do Arrendatário" : "Assinatura do Condómino";

  const sigY = Math.max(finalY + 40, 250);
  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY, 90, sigY);
  doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(leftLabel, 55, sigY + 6, { align: "center" });
  doc.text(rightLabel, pageWidth - 55, sigY + 6, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Fatura gerada automaticamente pelo sistema Smart Condo.", pageWidth / 2, 285, { align: "center" });

  doc.save(`${invoiceNumber}.pdf`);
}