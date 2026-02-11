import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Realtime Sync Hook
 *
 * Subscribes to Supabase Realtime for live updates when
 * other caregivers modify data for the same child.
 */

export interface UseRealtimeSyncOptions {
  childId: string;
  enabled?: boolean;
  showToasts?: boolean;
  tables?: string[];
}

// Tables to monitor by default
const DEFAULT_TABLES = [
  'medications',
  'daily_log_entries',
  'medical_contacts',
  'emergency_protocols',
  'key_information',
  'suppliers',
];

// Human-readable table names
const TABLE_NAMES: Record<string, string> = {
  medications: 'Medications',
  daily_log_entries: 'Daily Log',
  medical_contacts: 'Medical Contacts',
  emergency_protocols: 'Emergency Protocols',
  key_information: 'Key Information',
  suppliers: 'Suppliers',
};

export function useRealtimeSync({
  childId,
  enabled = true,
  showToasts = true,
  tables = DEFAULT_TABLES,
}: UseRealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Handle database changes
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
      const { table, eventType, new: newRecord, old: oldRecord } = payload;

      // Only process if it's for our child
      const record = (newRecord || oldRecord) as Record<string, any>;
      if (record?.child_id !== childId) return;

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [table, childId] });

      // Show toast notification
      if (showToasts) {
        const tableName = TABLE_NAMES[table] || table;
        const action =
          eventType === 'INSERT'
            ? 'added'
            : eventType === 'UPDATE'
            ? 'updated'
            : 'removed';

        toast({
          title: 'Data Updated',
          description: `${tableName} was ${action} by another caregiver`,
          duration: 3000,
        });
      }
    },
    [childId, queryClient, showToasts, toast]
  );

  // Set up realtime subscription
  useEffect(() => {
    if (!enabled || !childId) return;

    // Create channel with unique name
    const channel = supabase.channel(`child-updates:${childId}`);

    // Subscribe to each table
    for (const table of tables) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `child_id=eq.${childId}`,
        },
        handleChange
      );
    }

    // Start subscription
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Realtime subscribed for child ${childId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Realtime channel error');
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [childId, enabled, tables, handleChange]);

  // Manual refresh function
  const refresh = useCallback(() => {
    for (const table of tables) {
      queryClient.invalidateQueries({ queryKey: [table, childId] });
    }
  }, [childId, tables, queryClient]);

  return {
    refresh,
    isSubscribed: channelRef.current !== null,
  };
}
