import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

/**
 * Data Export Module — GDPR/COPPA Compliant
 *
 * Supports multiple export formats:
 * - PDF: Formatted document for printing/sharing
 * - CSV: Spreadsheet compatible
 * - JSON: Machine-readable backup
 *
 * Privacy: Internal IDs (id, child_id, created_by) are stripped from output.
 * Encrypted fields are decrypted via children_secure view.
 */

export type ExportFormat = 'pdf' | 'csv' | 'json';

export type ExportSection =
  | 'all'
  | 'keyInformation'
  | 'medications'
  | 'medicalContacts'
  | 'emergencyProtocols'
  | 'dailyLogs'
  | 'suppliers'
  | 'emergencyCards'
  | 'employmentAgreements'
  | 'financialLegal'
  | 'endOfLifeWishes'
  | 'homeSafety'
  | 'celebrations'
  | 'documents';

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
  emergencyCards?: Record<string, unknown>[];
  employmentAgreements?: Record<string, unknown>[];
  financialLegal?: Record<string, unknown>[];
  endOfLifeWishes?: Record<string, unknown>[];
  homeSafety?: Record<string, unknown>[];
  celebrations?: Record<string, unknown>[];
  documents?: Record<string, unknown>[];
  exportedAt: string;
  childName?: string;
}

/** Remove internal DB columns from a record */
function sanitizeRecord(record: Record<string, unknown>): Record<string, unknown> {
  const internalKeys = ['id', 'child_id', 'created_by', 'created_at', 'updated_at'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!internalKeys.includes(key) && !key.endsWith('_encrypted')) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function sanitizeArray(records: Record<string, unknown>[]): Record<string, unknown>[] {
  return records.map(sanitizeRecord);
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

  // Fetch key information via secure view (decrypts encrypted fields)
  if (includeAll || sections.includes('keyInformation')) {
    const { data: child } = await supabase
      .from('children_secure')
      .select('*')
      .eq('id', childId)
      .single();

    if (child) {
      data.keyInformation = sanitizeRecord(child as Record<string, unknown>);
      data.childName = (child.full_name as string) || (child.name as string);
    }
  }

  // Fetch medications
  if (includeAll || sections.includes('medications')) {
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('child_id', childId)
      .order('name');
    data.medications = sanitizeArray((meds || []) as Record<string, unknown>[]);
  }

  // Fetch medical contacts
  if (includeAll || sections.includes('medicalContacts')) {
    const { data: contacts } = await supabase
      .from('medical_contacts')
      .select('*')
      .eq('child_id', childId)
      .order('name');
    data.medicalContacts = sanitizeArray((contacts || []) as Record<string, unknown>[]);
  }

  // Fetch emergency protocols
  if (includeAll || sections.includes('emergencyProtocols')) {
    const { data: protocols } = await supabase
      .from('emergency_protocols')
      .select('*')
      .eq('child_id', childId)
      .order('title');
    data.emergencyProtocols = sanitizeArray((protocols || []) as Record<string, unknown>[]);
  }

  // Fetch daily logs
  if (includeAll || sections.includes('dailyLogs')) {
    const { data: logs } = await supabase
      .from('daily_log_entries')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .limit(100);
    data.dailyLogs = sanitizeArray((logs || []) as Record<string, unknown>[]);
  }

  // Fetch suppliers
  if (includeAll || sections.includes('suppliers')) {
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('child_id', childId)
      .order('item_name');
    data.suppliers = sanitizeArray((suppliers || []) as Record<string, unknown>[]);
  }

  // Fetch emergency cards via secure view
  if (includeAll || sections.includes('emergencyCards')) {
    const { data: cards } = await supabase
      .from('emergency_cards_secure')
      .select('*')
      .eq('child_id', childId);
    data.emergencyCards = sanitizeArray((cards || []) as Record<string, unknown>[]);
  }

  // Fetch employment agreements
  if (includeAll || sections.includes('employmentAgreements')) {
    const { data: agreements } = await supabase
      .from('employment_agreements')
      .select('*')
      .eq('child_id', childId);
    data.employmentAgreements = sanitizeArray((agreements || []) as Record<string, unknown>[]);
  }

  // Fetch financial/legal via secure view
  if (includeAll || sections.includes('financialLegal')) {
    const { data: docs } = await supabase
      .from('financial_legal_docs_secure')
      .select('*')
      .eq('child_id', childId);
    data.financialLegal = sanitizeArray((docs || []) as Record<string, unknown>[]);
  }

  // Fetch end-of-life wishes
  if (includeAll || sections.includes('endOfLifeWishes')) {
    const { data: wishes } = await supabase
      .from('end_of_life_wishes')
      .select('*')
      .eq('child_id', childId);
    data.endOfLifeWishes = sanitizeArray((wishes || []) as Record<string, unknown>[]);
  }

  // Fetch home safety checks
  if (includeAll || sections.includes('homeSafety')) {
    const { data: checks } = await supabase
      .from('home_safety_checks')
      .select('*')
      .eq('child_id', childId);
    data.homeSafety = sanitizeArray((checks || []) as Record<string, unknown>[]);
  }

  // Fetch celebrations (journeys + moments)
  if (includeAll || sections.includes('celebrations')) {
    const { data: journeys } = await supabase
      .from('journeys')
      .select('*, journey_moments(*)')
      .eq('child_id', childId);
    data.celebrations = sanitizeArray((journeys || []) as Record<string, unknown>[]);
  }

  // Fetch documents metadata
  if (includeAll || sections.includes('documents')) {
    const { data: docs } = await supabase
      .from('documents')
      .select('name, description, category, type, size')
      .eq('child_id', childId);
    data.documents = (docs || []) as Record<string, unknown>[];
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

  const addTitle = (text: string) => {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
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
  addTitle('Care Information Report');
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
      if (c.specialty) { doc.text(`  Specialty: ${c.specialty}`, margin, y); y += 4; }
      if (c.phone_number) { doc.text(`  Phone: ${c.phone_number}`, margin, y); y += 4; }
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

  // Emergency Cards
  if (data.emergencyCards && data.emergencyCards.length > 0) {
    checkNewPage();
    addSubtitle('Emergency Cards');
    for (const card of data.emergencyCards) {
      const c = card as Record<string, string>;
      addField('Type', c.id_type);
      addField('Number', c.id_number);
      addField('Issue Date', c.issue_date);
      addField('Expiry Date', c.expiry_date);
      y += 4;
      checkNewPage();
    }
  }

  // Employment Agreements
  if (data.employmentAgreements && data.employmentAgreements.length > 0) {
    checkNewPage();
    addSubtitle('Employment Agreements');
    for (const agreement of data.employmentAgreements) {
      const a = agreement as Record<string, string>;
      addField('Caregiver', a.caregiver_name);
      addField('Position', a.position_title);
      addField('Status', a.status);
      addField('Schedule', a.work_schedule);
      y += 4;
      checkNewPage();
    }
  }

  // Financial & Legal
  if (data.financialLegal && data.financialLegal.length > 0) {
    checkNewPage();
    addSubtitle('Financial & Legal Documents');
    for (const fdoc of data.financialLegal) {
      const f = fdoc as Record<string, string>;
      addField('Title', f.title);
      addField('Type', f.doc_type);
      addField('Institution', f.institution);
      addField('Status', f.status);
      y += 4;
      checkNewPage();
    }
  }

  // End-of-Life Wishes
  if (data.endOfLifeWishes && data.endOfLifeWishes.length > 0) {
    checkNewPage();
    addSubtitle('End-of-Life Wishes');
    for (const wish of data.endOfLifeWishes) {
      const w = wish as Record<string, string>;
      addField('Medical Directives', w.medical_directives);
      addField('Legal Guardian', w.legal_guardian);
      addField('Organ Donation', w.organ_donation);
      addField('Preferred Hospital', w.preferred_hospital);
      y += 4;
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

  const addSheet = (name: string, records?: Record<string, unknown>[]) => {
    if (records && records.length > 0) sheets.push({ name, data: records });
  };

  addSheet('medications', data.medications);
  addSheet('medical_contacts', data.medicalContacts);
  addSheet('daily_logs', data.dailyLogs);
  addSheet('suppliers', data.suppliers);
  addSheet('emergency_protocols', data.emergencyProtocols);
  addSheet('emergency_cards', data.emergencyCards);
  addSheet('employment_agreements', data.employmentAgreements);
  addSheet('financial_legal', data.financialLegal);
  addSheet('end_of_life_wishes', data.endOfLifeWishes);
  addSheet('home_safety', data.homeSafety);
  addSheet('celebrations', data.celebrations);
  addSheet('documents', data.documents);

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
  const data = await fetchExportData(childId, sections);

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
