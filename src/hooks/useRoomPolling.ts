import { useEffect, useRef } from 'react';
import { Room } from '../types/game';
import { RoomManager } from '../utils/roomManager';

export const useRoomPolling = (
  roomCode: string | undefined,
  onRoomUpdate: (room: Room | null) => void,
  intervalMs: number = 1000
) => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const roomManager = RoomManager.getInstance();

  useEffect(() => {
    if (!roomCode) return;

    const pollRoom = () => {
      const room = roomManager.getRoomByCode(roomCode);
      onRoomUpdate(room);
    };

    // Initial poll
    pollRoom();

    // Set up polling
    intervalRef.current = setInterval(pollRoom, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomCode, onRoomUpdate, intervalMs, roomManager]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  return { stopPolling };
};