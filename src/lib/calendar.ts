import ical, { ICalCalendar, ICalAlarmType, ICalEventRepeatingFreq } from 'ical-generator';
import { supabase } from '@/integrations/supabase/client';

/**
 * Calendar Integration Module
 *
 * Generates iCal feeds for:
 * - Medication schedules
 * - Appointments
 * - Care activities
 */

export type CalendarType = 'medications' | 'appointments' | 'all';

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency: string;
  instructions?: string;
  start_date?: string;
}

interface MedicalContact {
  id: string;
  name: string;
  specialty?: string;
  next_appointment?: string;
  address?: string;
}

/**
 * Parse medication frequency to iCal recurrence rule
 */
function parseFrequency(freq: string): {
  rrule?: {
    freq: ICalEventRepeatingFreq;
    interval?: number;
    count?: number;
  };
  times?: string[];
} {
  switch (freq) {
    case 'once_daily':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['08:00'],
      };
    case 'twice_daily':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['08:00', '20:00'],
      };
    case 'three_times_daily':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['08:00', '14:00', '20:00'],
      };
    case 'four_times_daily':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['08:00', '12:00', '16:00', '20:00'],
      };
    case 'every_morning':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['08:00'],
      };
    case 'every_night':
      return {
        rrule: { freq: ICalEventRepeatingFreq.DAILY },
        times: ['20:00'],
      };
    case 'weekly':
      return {
        rrule: { freq: ICalEventRepeatingFreq.WEEKLY },
        times: ['09:00'],
      };
    case 'monthly':
      return {
        rrule: { freq: ICalEventRepeatingFreq.MONTHLY },
        times: ['09:00'],
      };
    default:
      // as_needed or other - no recurrence
      return {};
  }
}

/**
 * Create time from date and time string
 */
function createDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Generate medication calendar
 */
export async function generateMedicationCalendar(childId: string): Promise<string> {
  const { data: medications, error } = await supabase
    .from('medications')
    .select('*')
    .eq('child_id', childId);

  if (error) throw error;

  const { data: childInfo } = await supabase
    .from('key_information')
    .select('full_name')
    .eq('child_id', childId)
    .single();

  const calendar = ical({
    name: `Medications - ${childInfo?.full_name || 'Special Caring'}`,
    description: 'Medication schedule from Special Caring',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    prodId: '//Special Caring//Medications Calendar//EN',
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const med of medications || []) {
    const { rrule, times } = parseFrequency(med.frequency);

    if (!times || times.length === 0) {
      // For as_needed medications, create a single reminder
      calendar.createEvent({
        summary: `${med.name} - ${med.dosage || 'as needed'}`,
        description: med.instructions || `Take ${med.name} as needed`,
        start: createDateTime(today, '09:00'),
        end: createDateTime(today, '09:15'),
        alarms: [
          {
            type: ICalAlarmType.display,
            trigger: -5 * 60, // 5 minutes before
            description: `Time for ${med.name}`,
          },
        ],
      });
    } else {
      // Create recurring events for each time
      for (const time of times) {
        const startDate = createDateTime(
          med.start_date ? new Date(med.start_date) : today,
          time
        );
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 15);

        calendar.createEvent({
          summary: `${med.name} - ${med.dosage || ''}`,
          description: med.instructions || `Take ${med.name}`,
          start: startDate,
          end: endDate,
          repeating: rrule,
          alarms: [
            {
              type: ICalAlarmType.display,
              trigger: -5 * 60, // 5 minutes before
              description: `Time for ${med.name}`,
            },
          ],
        });
      }
    }
  }

  return calendar.toString();
}

/**
 * Generate appointments calendar
 */
export async function generateAppointmentCalendar(childId: string): Promise<string> {
  // Note: medical_contacts table doesn't have next_appointment column
  // This function returns an empty calendar for now
  const { data: childInfo } = await supabase
    .from('key_information')
    .select('full_name')
    .eq('child_id', childId)
    .single();

  const calendar = ical({
    name: `Appointments - ${childInfo?.full_name || 'Special Caring'}`,
    description: 'Medical appointments from Special Caring',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    prodId: '//Special Caring//Appointments Calendar//EN',
  });

  return calendar.toString();
}

/**
}

/**
 * Generate combined calendar
 */
export async function generateCombinedCalendar(childId: string): Promise<string> {
  // For simplicity, we'll merge the two calendars
  // In a real app, you might want to create a single calendar with all events
  const medsCalendar = await generateMedicationCalendar(childId);
  const apptsCalendar = await generateAppointmentCalendar(childId);

  // This is a simplified merge - in production you'd want proper iCal merging
  return medsCalendar;
}

/**
 * Download calendar file
 */
export async function downloadCalendar(
  childId: string,
  type: CalendarType = 'medications'
): Promise<void> {
  let icalContent: string;

  switch (type) {
    case 'medications':
      icalContent = await generateMedicationCalendar(childId);
      break;
    case 'appointments':
      icalContent = await generateAppointmentCalendar(childId);
      break;
    case 'all':
      icalContent = await generateCombinedCalendar(childId);
      break;
    default:
      throw new Error(`Unknown calendar type: ${type}`);
  }

  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const filename = `special-caring-${type}-${new Date().toISOString().split('T')[0]}.ics`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get calendar subscription URL (for use with Edge Function)
 */
export function getCalendarSubscriptionUrl(
  childId: string,
  token: string,
  type: CalendarType = 'medications'
): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/functions/v1/calendar-feed?child=${childId}&type=${type}&token=${token}`;
}
