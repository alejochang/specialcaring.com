import { supabase } from '@/integrations/supabase/client';

/**
 * Global Search Module
 *
 * Provides unified search across all child-related data:
 * - Medications
 * - Medical contacts
 * - Emergency protocols
 * - Daily logs
 * - Suppliers
 * - Key information
 */

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon: string;
  score: number;
}

export type SearchResultType =
  | 'medication'
  | 'contact'
  | 'protocol'
  | 'log'
  | 'supplier'
  | 'info';

// Type to icon mapping
const TYPE_ICONS: Record<SearchResultType, string> = {
  medication: '💊',
  contact: '👨‍⚕️',
  protocol: '🚨',
  log: '📝',
  supplier: '📦',
  info: 'ℹ️',
};

// Type to route mapping
const TYPE_ROUTES: Record<SearchResultType, string> = {
  medication: '/dashboard/medications',
  contact: '/dashboard/contacts',
  protocol: '/dashboard/protocols',
  log: '/dashboard/daily-log',
  supplier: '/dashboard/suppliers',
  info: '/dashboard',
};

/**
 * Simple text matching score
 */
function calculateScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Contains
  if (lowerText.includes(lowerQuery)) return 60;

  // Word match
  const words = lowerText.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(lowerQuery)) return 40;
  }

  return 0;
}

/**
 * Search all data for a child
 */
export async function searchAll(
  childId: string,
  query: string,
  limit: number = 20
): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  // Run searches in parallel
  const [
    { data: medications },
    { data: contacts },
    { data: protocols },
    { data: logs },
    { data: suppliers },
    { data: keyInfo },
  ] = await Promise.all([
    supabase.from('medications').select('*').eq('child_id', childId),
    supabase.from('medical_contacts').select('*').eq('child_id', childId),
    supabase.from('emergency_protocols').select('*').eq('child_id', childId),
    supabase
      .from('daily_log_entries')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .limit(50),
    supabase.from('suppliers').select('*').eq('child_id', childId),
    supabase.from('key_information').select('*').eq('child_id', childId).single(),
  ]);

  // Search medications
  for (const med of medications || []) {
    const searchText = `${med.name} ${med.dosage || ''} ${med.purpose || ''} ${
      med.prescriber || ''
    }`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: med.id,
        type: 'medication',
        title: med.name,
        subtitle: med.dosage,
        description: med.purpose,
        url: TYPE_ROUTES.medication,
        icon: TYPE_ICONS.medication,
        score,
      });
    }
  }

  // Search contacts
  for (const contact of contacts || []) {
    const searchText = `${contact.name} ${contact.specialty || ''} ${
      contact.clinic || ''
    }`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: contact.id,
        type: 'contact',
        title: contact.name,
        subtitle: contact.specialty,
        description: contact.clinic,
        url: TYPE_ROUTES.contact,
        icon: TYPE_ICONS.contact,
        score,
      });
    }
  }

  // Search protocols
  for (const protocol of protocols || []) {
    const searchText = `${protocol.title} ${protocol.immediate_steps || ''} ${
      protocol.when_to_call_911 || ''
    }`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: protocol.id,
        type: 'protocol',
        title: protocol.title,
        subtitle: protocol.severity,
        description: protocol.immediate_steps?.substring(0, 100),
        url: TYPE_ROUTES.protocol,
        icon: TYPE_ICONS.protocol,
        score,
      });
    }
  }

  // Search daily logs
  for (const log of logs || []) {
    const searchText = `${log.notes || ''} ${log.activities || ''}`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: log.id,
        type: 'log',
        title: `Log - ${new Date(log.date).toLocaleDateString()}`,
        subtitle: log.mood,
        description: log.notes?.substring(0, 100),
        url: TYPE_ROUTES.log,
        icon: TYPE_ICONS.log,
        score,
      });
    }
  }

  // Search suppliers
  for (const supplier of suppliers || []) {
    const searchText = `${supplier.name} ${supplier.category || ''} ${
      supplier.products || ''
    }`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: supplier.id,
        type: 'supplier',
        title: supplier.name,
        subtitle: supplier.category,
        description: supplier.products,
        url: TYPE_ROUTES.supplier,
        icon: TYPE_ICONS.supplier,
        score,
      });
    }
  }

  // Search key information
  if (keyInfo) {
    const searchText = `${keyInfo.full_name || ''} ${keyInfo.medical_conditions || ''} ${
      keyInfo.allergies || ''
    } ${keyInfo.emergency_contact || ''}`;
    const score = calculateScore(searchText, lowerQuery);

    if (score > 0) {
      results.push({
        id: keyInfo.id,
        type: 'info',
        title: 'Key Information',
        subtitle: keyInfo.full_name,
        description: keyInfo.medical_conditions,
        url: TYPE_ROUTES.info,
        icon: TYPE_ICONS.info,
        score,
      });
    }
  }

  // Sort by score and limit
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get search suggestions based on common patterns
 */
export function getSearchSuggestions(): string[] {
  return [
    'medication name',
    'doctor name',
    'pharmacy',
    'allergy',
    'seizure',
    'emergency',
  ];
}
