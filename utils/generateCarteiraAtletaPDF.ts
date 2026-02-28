import { jsPDF } from 'jspdf';
import { Atleta } from '../types';

interface CarteiraOptions {
  appName?: string;
  logoURL?: string;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function formatDate(value: string): string {
  if (!value) return '-';
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString('pt-BR');
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

async function toDataURL(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateCarteiraAtletaPDF(atleta: Atleta, options: CarteiraOptions = {}): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [54, 86]
  });

  const navy = [10, 29, 55];
  const gold = [197, 160, 89];

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, 86, 54, 'F');

  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.rect(0, 0, 86, 7.5, 'F');

  doc.setTextColor(10, 29, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text((options.appName || 'Estrelas do Norte').toUpperCase(), 43, 5, { align: 'center' });

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.roundedRect(3, 10, 80, 41, 2, 2);

  const logoDataURL = await toDataURL(options.logoURL || '');
  if (logoDataURL) {
    doc.addImage(logoDataURL, 'PNG', 5, 12, 14, 14);
  } else {
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFontSize(14);
    doc.text('*', 12, 20, { align: 'center' });
  }

  const photoDataURL = await toDataURL(atleta.photoURL || '');
  if (photoDataURL) {
    doc.addImage(photoDataURL, 'JPEG', 65, 12, 16, 20);
  } else {
    doc.setFillColor(235, 239, 245);
    doc.rect(65, 12, 16, 20, 'F');
    doc.setTextColor(120, 130, 145);
    doc.setFontSize(6);
    doc.text('SEM FOTO', 73, 23, { align: 'center' });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('CARTEIRA DE ATLETA', 22, 13.5);

  doc.setFontSize(10.5);
  doc.text(truncate((atleta.nome || 'ATLETA').toUpperCase(), 28), 22, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`CPF: ${atleta.cpf || '-'}`, 22, 25);
  doc.text(`NASC: ${formatDate(atleta.dataNascimento)}`, 22, 29);
  doc.text(`POSICAO: ${(atleta.posicao || '-').toUpperCase()}`, 22, 33);

  const year = new Date().getFullYear();
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`VALIDADE: DEZ/${year + 1}`, 22, 38);

  doc.setDrawColor(255, 255, 255);
  doc.line(22, 44, 58, 44);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('ASSINATURA RESPONSAVEL', 40, 47.2, { align: 'center' });

  doc.setTextColor(220, 220, 220);
  doc.setFontSize(4.5);
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 43, 51.5, { align: 'center' });

  const fileName = `Carteira_${sanitizeFileName(atleta.nome || 'atleta')}.pdf`;
  if (typeof window !== 'undefined') {
    doc.autoPrint();
    const url = doc.output('bloburl');
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      doc.save(fileName);
    }
    return;
  }

  doc.save(fileName);
}
