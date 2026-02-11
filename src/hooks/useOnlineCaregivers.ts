import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Online Caregivers Hook
 *
 * Uses Supabase Realtime Presence to track which caregivers
 * are currently viewing the same child's data.
 */

export interface OnlineUser {
  id: string;
  email?: string;
  name?: string;
  lastSeen: string;
}

export interface UseOnlineCaregiversOptions {
  childId: string;
  enabled?: boolean;
}

export function useOnlineCaregivers({
  childId,
  enabled = true,
}: UseOnlineCaregiversOptions) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Update presence state from channel
  const updatePresence = useCallback(
    (channel: RealtimeChannel) => {
      const state = channel.presenceState<{
        user_id: string;
        email?: string;
        name?: string;
        online_at: string;
      }>();

      const users: OnlineUser[] = [];

      for (const presences of Object.values(state)) {
        for (const presence of presences) {
          // Don't include current user
          if (presence.user_id !== user?.id) {
            users.push({
              id: presence.user_id,
              email: presence.email,
              name: presence.name,
              lastSeen: presence.online_at,
            });
          }
        }
      }

      setOnlineUsers(users);
    },
    [user?.id]
  );

  // Set up presence channel
  useEffect(() => {
    if (!enabled || !childId || !user) return;

    const channel = supabase.channel(`presence:${childId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        updatePresence(channel);
      })
      .on('presence', { event: 'join' }, () => {
        updatePresence(channel);
      })
      .on('presence', { event: 'leave' }, () => {
        updatePresence(channel);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track current user's presence
          await channel.track({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [childId, enabled, user, updatePresence]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isConnected,
    hasOtherUsers: onlineUsers.length > 0,
  };
}
