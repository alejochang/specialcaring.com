import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Push Notifications Hook
 *
 * Handles:
 * - Permission request and status tracking
 * - Push subscription management
 * - Saving subscription to Supabase
 */

export interface UsePushNotificationsResult {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
}

// VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Convert base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convert ArrayBuffer to base64 string for storage
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function usePushNotifications(): UsePushNotificationsResult {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  // Check initial permission state
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Check for existing subscription
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await (registration as any).pushManager.getSubscription();
        setSubscription(existingSub);
      } catch (err) {
        console.error('Error checking push subscription:', err);
      }
    };

    checkSubscription();
  }, [isSupported]);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      setError('Push notifications not supported or user not logged in');
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID public key not configured');
      console.warn('Push notifications require VITE_VAPID_PUBLIC_KEY in environment');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const result = await requestPermission();
        if (result !== 'granted') {
          setError('Notification permission denied');
          return false;
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const pushSubscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Extract keys for storage
      const p256dh = pushSubscription.getKey('p256dh');
      const auth = pushSubscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error('Failed to get push subscription keys');
      }

      // Save to Supabase
      const { error: dbError } = await (supabase.from('push_subscriptions') as any).upsert({
        user_id: user.id,
        endpoint: pushSubscription.endpoint,
        p256dh: arrayBufferToBase64(p256dh),
        auth: arrayBufferToBase64(auth),
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (dbError) {
        console.error('Error saving push subscription:', dbError);
        // Don't fail - subscription still works locally
      }

      setSubscription(pushSubscription);
      return true;
    } catch (err) {
      console.error('Push subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, permission, requestPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from browser
      await subscription.unsubscribe();

      // Remove from Supabase
      if (user) {
        await (supabase
          .from('push_subscriptions') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setSubscription(null);
      return true;
    } catch (err) {
      console.error('Push unsubscribe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, user]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}
