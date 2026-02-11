import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

/**
 * Data Export Module
 *
 * Supports multiple export formats:
 * - PDF: Formatted document for printing/sharing
 * - CSV: Spreadsheet compatible
 * - JSON: Machine-readable backup
 */

export type ExportFormat = 'pdf' | 'csv' | 'json';

export type ExportSection =
  | 'all'
  | 'keyInformation'
  | 'medications'
  | 'medicalContacts'
  | 'emergencyProtocols'
  | 'dailyLogs'
  | 'suppliers';

export interface ExportOptions {
  childId: string;
  format: ExportFormat;
  sections: ExportSection[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportedData {
  keyInformation?: Record<string, unknown>;
  medications?: Record<string, unknown>[];
  medicalContacts?: Record<string, unknown>[];
  emergencyProtocols?: Record<string, unknown>[];
  dailyLogs?: Record<string, unknown>[];
  suppliers?: Record<string, unknown>[];
  exportedAt: string;
  childName?: string;
}

/**
 * Fetch all data for export
 */
async function fetchExportData(
  childId: string,
  sections: ExportSection[]
): Promise<ExportedData> {
  const includeAll = sections.includes('all');
  const data: ExportedData = {
    exportedAt: new Date().toISOString(),
  };

  // Fetch key information
  if (includeAll || sections.includes('keyInformation')) {
    const { data: keyInfo } = await supabase
      .from('key_information')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (keyInfo) {
      data.keyInformation = keyInfo;
      data.childName = keyInfo.full_name;
    }
  }

  // Fetch medications
  if (includeAll || sections.includes('medications')) {
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('child_id', childId)
      .order('name');

    data.medications = meds || [];
  }

  // Fetch medical contacts
  if (includeAll || sections.includes('medicalContacts')) {
    const { data: contacts } = await supabase
      .from('medical_contacts')
      .select('*')
      .eq('child_id', childId)
      .order('name');

    data.medicalContacts = contacts || [];
  }

  // Fetch emergency protocols
  if (includeAll || sections.includes('emergencyProtocols')) {
    const { data: protocols } = await supabase
      .from('emergency_protocols')
      .select('*')
      .eq('child_id', childId)
      .order('title');

    data.emergencyProtocols = protocols || [];
  }

  // Fetch daily logs
  if (includeAll || sections.includes('dailyLogs')) {
    const { data: logs } = await supabase
      .from('daily_log_entries')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .limit(100);

    data.dailyLogs = logs || [];
  }

  // Fetch suppliers
  if (includeAll || sections.includes('suppliers')) {
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('child_id', childId)
      .order('name');

    data.suppliers = suppliers || [];
  }

  return data;
}

/**
 * Generate PDF document
 */
function generatePDF(data: ExportedData): Blob {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Helper functions
  const addTitle = (text: string) => {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237); // Purple
    doc.text(text, margin, y);
    y += 10;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(text, margin, y);
    y += 8;
  };

  const addField = (label: string, value: string | null | undefined) => {
    if (!value) return;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(String(value), margin + 40, y);
    y += 6;
  };

  const checkNewPage = () => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  addTitle(`Care Information Report`);
  if (data.childName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`For: ${data.childName}`, margin, y);
    y += 6;
  }
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 15;

  // Key Information
  if (data.keyInformation) {
    addSubtitle('Key Information');
    const ki = data.keyInformation as Record<string, string>;
    addField('Full Name', ki.full_name);
    addField('Date of Birth', ki.birth_date);
    addField('Phone', ki.phone_number);
    addField('Address', ki.address);
    addField('Health Card', ki.health_card_number);
    addField('Emergency Contact', ki.emergency_contact);
    addField('Emergency Phone', ki.emergency_phone);
    addField('Medical Conditions', ki.medical_conditions);
    addField('Allergies', ki.allergies);
    y += 10;
  }

  // Medications
  if (data.medications && data.medications.length > 0) {
    checkNewPage();
    addSubtitle('Medications');
    for (const med of data.medications) {
      const m = med as Record<string, string>;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${m.name} - ${m.dosage || 'No dosage'}`, margin, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`  Frequency: ${m.frequency || 'N/A'}`, margin, y);
      y += 4;
      if (m.purpose) {
        doc.text(`  Purpose: ${m.purpose}`, margin, y);
        y += 4;
      }
      y += 3;
      checkNewPage();
    }
    y += 5;
  }

  // Medical Contacts
  if (data.medicalContacts && data.medicalContacts.length > 0) {
    checkNewPage();
    addSubtitle('Medical Contacts');
    for (const contact of data.medicalContacts) {
      const c = contact as Record<string, string>;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${c.name}`, margin, y);
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (c.specialty) {
        doc.text(`  Specialty: ${c.specialty}`, margin, y);
        y += 4;
      }
      if (c.phone) {
        doc.text(`  Phone: ${c.phone}`, margin, y);
        y += 4;
      }
      y += 3;
      checkNewPage();
    }
    y += 5;
  }

  // Emergency Protocols
  if (data.emergencyProtocols && data.emergencyProtocols.length > 0) {
    checkNewPage();
    addSubtitle('Emergency Protocols');
    for (const protocol of data.emergencyProtocols) {
      const p = protocol as Record<string, string>;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(
        p.severity === 'high' ? 220 : p.severity === 'moderate' ? 245 : 0,
        p.severity === 'high' ? 38 : p.severity === 'moderate' ? 158 : 0,
        p.severity === 'high' ? 38 : p.severity === 'moderate' ? 11 : 0
      );
      doc.text(`• ${p.title} (${p.severity})`, margin, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (p.immediate_steps) {
        const lines = doc.splitTextToSize(`Steps: ${p.immediate_steps}`, 170);
        doc.text(lines, margin + 3, y);
        y += lines.length * 4;
      }
      y += 5;
      checkNewPage();
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generated by Special Caring - Page ${i} of ${pageCount}`,
      margin,
      285
    );
  }

  return doc.output('blob');
}

/**
 * Generate CSV content
 */
function generateCSV(data: ExportedData): Blob {
  const sheets: { name: string; data: Record<string, unknown>[] }[] = [];

  if (data.medications && data.medications.length > 0) {
    sheets.push({ name: 'medications', data: data.medications });
  }
  if (data.medicalContacts && data.medicalContacts.length > 0) {
    sheets.push({ name: 'medical_contacts', data: data.medicalContacts });
  }
  if (data.dailyLogs && data.dailyLogs.length > 0) {
    sheets.push({ name: 'daily_logs', data: data.dailyLogs });
  }
  if (data.suppliers && data.suppliers.length > 0) {
    sheets.push({ name: 'suppliers', data: data.suppliers });
  }
  if (data.emergencyProtocols && data.emergencyProtocols.length > 0) {
    sheets.push({ name: 'emergency_protocols', data: data.emergencyProtocols });
  }

  // For CSV, we'll combine into one sheet with section headers
  let csvContent = '';

  for (const sheet of sheets) {
    csvContent += `\n--- ${sheet.name.toUpperCase()} ---\n`;
    csvContent += Papa.unparse(sheet.data);
    csvContent += '\n\n';
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generate JSON content
 */
function generateJSON(data: ExportedData): Blob {
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
}

/**
 * Main export function
 */
export async function exportChildData(options: ExportOptions): Promise<Blob> {
  const { childId, format, sections } = options;

  // Fetch data
  const data = await fetchExportData(childId, sections);

  // Generate export based on format
  switch (format) {
    case 'pdf':
      return generatePDF(data);
    case 'csv':
      return generateCSV(data);
    case 'json':
      return generateJSON(data);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Trigger download of exported data
 */
export async function downloadExport(options: ExportOptions): Promise<void> {
  const blob = await exportChildData(options);

  const extension =
    options.format === 'pdf' ? 'pdf' : options.format === 'csv' ? 'csv' : 'json';
  const mimeType =
    options.format === 'pdf'
      ? 'application/pdf'
      : options.format === 'csv'
      ? 'text/csv'
      : 'application/json';

  const filename = `special-caring-export-${new Date().toISOString().split('T')[0]}.${extension}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
