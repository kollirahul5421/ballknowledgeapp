import React, { useEffect, useState } from 'react';
import { Copy, Users, Clock, ArrowLeft, CheckCircle, Crown } from 'lucide-react';
import { Room, MAX_PLAYERS } from '../types/game';
import { GAME_MODES } from '../types/game';

//Check

interface CreateGameProps {
  room: Room;
  playerId: string;
  onBack: () => void;
  onRoomUpdate: (room: Room) => void;
}

export const CreateGame: React.FC<CreateGameProps> = ({
  room,
  playerId,
  onBack,
  onRoomUpdate
}) => {
  const [copied, setCopied] = useState(false);
  const shareableLink = `${window.location.origin}/room/${room.code}`;
  const selectedGameMode = GAME_MODES.find(mode => mode.value === room.gameMode);
  const isHost = room.hostPlayerId === playerId;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlayerStatus = (player: any) => {
    if (!player.isConnected) return 'disconnected';
    return 'connected';
  };

  return (
    <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center space-x-2"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Main Card */}
        <div className="rounded-2xl shadow-2xl border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)', borderRadius: 'var(--card-border-radius)', boxShadow: 'var(--card-shadow)', padding: '2rem 2.5rem' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}>
              <Users className="w-8 h-8" />
            </div>
            <h2 className="mb-2" style={{ fontSize: 'var(--header-font-size)', fontWeight: 'var(--header-font-weight)', color: 'var(--header-color)' }}>Game Created!</h2>
            <p style={{ color: 'var(--subheader-color)' }}>Share your room link with friends</p>
          </div>

          {/* Room Code Display */}
          <div className="rounded-xl mb-6" style={{ background: 'var(--color-background)', padding: '1.5rem' }}>
            <div className="text-center">
              <p className="mb-2 font-medium" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>Room Code</p>
              <div className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>
                {room.code}
              </div>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-2 rounded-lg transition-colors"
                style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: '0.75rem', fontSize: '0.95rem', padding: '0.5rem 1.25rem' }}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Player Count */}
          <div className="rounded-xl mb-6 border" style={{ background: 'var(--color-background)', borderColor: 'var(--color-primary)', padding: '1rem' }}>
            <div className="text-center">
              <p className="mb-1 font-medium" style={{ fontSize: 'var(--label-font-size)', color: 'var(--color-primary)' }}>Players</p>
              <div className="text-2xl font-bold" style={{ color: 'var(--header-color)' }}>
                {room.players.filter(p => p.isConnected).length}/{MAX_PLAYERS}
              </div>
              {room.players.length >= MAX_PLAYERS && (
                <p className="text-xs mt-1" style={{ color: '#F7931E' }}>Room is full!</p>
              )}
            </div>
          </div>

          {/* Player Status */}
          <div className="space-y-3 mb-6">
            {room.players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg border-2"
                style={{
                  background: 'var(--color-card-background)',
                  borderColor: player.isConnected ? '#22C55E' : '#FECACA'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: player.isConnected ? '#22C55E' : '#EF4444' }}></div>
                  <span className="font-medium" style={{ color: player.isConnected ? '#15803D' : '#B91C1C' }}>
                    {player.name}
                  </span>
                  {player.id === playerId && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}>
                      You
                    </span>
                  )}
                  {player.id === room.hostPlayerId && (
                    <Crown className="w-4 h-4" style={{ color: '#FFD600' }} />
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--subheader-color)' }}>
                  {player.isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: MAX_PLAYERS - room.players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#A3A3A3' }}></div>
                  <span className="font-medium" style={{ color: 'var(--subheader-color)' }}>Waiting for player...</span>
                </div>
                <Clock className="w-4 h-4" style={{ color: 'var(--subheader-color)' }} />
              </div>
            ))}
          </div>

          {/* Waiting Message */}
          <div className="text-center">
            {room.players.filter(p => p.isConnected).length < 2 ? (
              <div className="inline-flex items-center space-x-2" style={{
                color: '#F7931E',
                background: 'rgba(255, 183, 77, 0.10)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem'
              }}>
                <div className="animate-pulse w-2 h-2 rounded-full" style={{ background: '#F7931E' }}></div>
                <span className="text-sm font-medium">Need at least 2 players to start</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2" style={{
                color: '#22C55E',
                background: 'rgba(169, 125, 254, 0.10)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem'
              }}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Ready to move to lobby!</span>
              </div>
            )}
            {isHost && room.players.filter(p => p.isConnected).length < MAX_PLAYERS && (
              <div className="mt-2 inline-flex items-center space-x-2" style={{
                color: 'var(--color-primary)',
                background: 'rgba(169, 125, 254, 0.10)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem'
              }}>
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">You can still invite more players!</span>
              </div>
            )}
            <p className="text-xs mt-2" style={{ color: 'var(--subheader-color)' }}>
              Room expires in 1 minute if no one joins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};