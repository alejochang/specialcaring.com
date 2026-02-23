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
  'children',
  'medications',
  'daily_log_entries',
  'medical_contacts',
  'emergency_protocols',
  'suppliers',
];

// Human-readable table names
const TABLE_NAMES: Record<string, string> = {
  children: 'Child Profile',
  medications: 'Medications',
  daily_log_entries: 'Daily Log',
  medical_contacts: 'Medical Contacts',
  emergency_protocols: 'Emergency Protocols',
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

      // Only process if it's for our child.
      // children table uses `id` as PK; all other tables use `child_id` as FK.
      const record = (newRecord || oldRecord) as Record<string, any>;
      const recordChildId = table === 'children' ? record?.id : record?.child_id;
      if (recordChildId !== childId) return;

      // Invalidate relevant queries.
      // For children table, also invalidate the childProfile query used by KeyInformation.
      queryClient.invalidateQueries({ queryKey: [table, childId] });
      if (table === 'children') {
        queryClient.invalidateQueries({ queryKey: ['childProfile', childId] });
      }

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
    // children table uses `id` as PK; all other data tables use `child_id` FK
    for (const table of tables) {
      const filterColumn = table === 'children' ? 'id' : 'child_id';
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filterColumn}=eq.${childId}`,
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
