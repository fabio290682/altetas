import { jsPDF } from 'jspdf';
import { Atleta } from '../types';

function safe(value: string | undefined): string {
  return value && value.trim() ? value : '-';
}

function formatBirthDate(value: string): string {
  if (!value) return '-';
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString('pt-BR');
}

export function generateAtletaPDF(atleta: Atleta): void {
  const doc = new jsPDF();

  const navy = [10, 29, 55];
  const gold = [197, 160, 89];

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ESTRELAS DO NORTE', 105, 18, { align: 'center' });

  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(10);
  doc.text('PROJETO SOCIAL E ESPORTIVO - FICHA DE CADASTRO', 105, 28, { align: 'center' });

  let y = 55;
  doc.setTextColor(navy[0], navy[1], navy[2]);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. IDENTIFICACAO DO ATLETA', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const addField = (label: string, value: string | undefined, nextLine = true) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(safe(value), 65, y);
    if (nextLine) y += 8;
  };

  addField('Nome Completo', atleta.nome);
  addField('CPF', atleta.cpf);
  addField('NIS', atleta.nis);
  addField('Nascimento', formatBirthDate(atleta.dataNascimento));
  addField('Genero', atleta.sexo);
  addField('WhatsApp', atleta.whatsapp);
  addField('Posicao', atleta.posicao);
  addField('Pe Dominante', atleta.peDominante);
  addField('Altura / Peso', `${safe(atleta.altura)}m / ${safe(atleta.peso)}kg`);
  addField('Tam. Camisa', atleta.tamanhoCamisa);
  addField('No Calcado', atleta.numCalcado);

  y += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. LOCALIZACAO', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addField('Logradouro', `${safe(atleta.endereco.logradouro)}, ${safe(atleta.endereco.numero)}`);
  addField('Bairro', atleta.endereco.bairro);
  addField('Cidade/UF', `${safe(atleta.endereco.cidade)} - ${safe(atleta.endereco.uf)}`);
  addField('CEP', atleta.endereco.cep);

  y += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RESPONSAVEL LEGAL', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addField('Nome Responsavel', atleta.responsavel.nome);
  addField('CPF Responsavel', atleta.responsavel.cpf);
  addField('Parentesco', atleta.responsavel.parentesco);

  y += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. INFORMACOES DE SAUDE', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addField('Tipo Sanguineo', atleta.saude.tipoSanguineo);
  addField('Restricoes', atleta.saude.restricao);
  addField('Alergias', atleta.saude.alergia);
  addField('Contato Emergencia', `${safe(atleta.saude.contatoEmergencia)} (${safe(atleta.saude.telefoneEmergencia)})`);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const date = new Date().toLocaleDateString('pt-BR');
  doc.text(`Documento gerado automaticamente em ${date} - Sistema Estrelas do Norte`, 105, 285, { align: 'center' });

  doc.save(`Ficha_Atleta_${safe(atleta.nome).replace(/\s+/g, '_')}.pdf`);
}
