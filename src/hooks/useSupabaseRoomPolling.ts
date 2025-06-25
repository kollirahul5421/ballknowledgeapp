import { useEffect, useRef, useCallback } from 'react';
import { Room } from '../types/game';
import { SupabaseRoomManager } from '../utils/supabaseRoomManager';

export const useSupabaseRoomPolling = (
  roomCode: string | undefined,
  onRoomUpdate: (room: Room | null) => void,
  intervalMs: number = 2000
) => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const subscriptionRef = useRef<(() => void) | null>(null);
  const roomManager = SupabaseRoomManager.getInstance();

  const pollRoom = useCallback(async () => {
    if (!roomCode) return;
    
    try {
      const room = await roomManager.getRoomByCode(roomCode);
      onRoomUpdate(room);
    } catch (error) {
      console.error('Error polling room:', error);
    }
  }, [roomCode, onRoomUpdate, roomManager]);

  useEffect(() => {
    if (!roomCode) return;

    // Initial poll
    pollRoom();

    // Set up real-time subscription
    const unsubscribe = roomManager.subscribeToRoom(roomCode, onRoomUpdate);
    subscriptionRef.current = unsubscribe;

    // Set up polling as fallback
    intervalRef.current = setInterval(pollRoom, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [roomCode, onRoomUpdate, intervalMs, pollRoom, roomManager]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
  }, []);

  return { stopPolling };
};