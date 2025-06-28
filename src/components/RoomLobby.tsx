import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Play, ArrowLeft, Crown, UserX, Copy } from 'lucide-react';
import { Room, MAX_PLAYERS } from '../types/game';
import { GAME_MODES, DECADES } from '../types/game';

interface RoomLobbyProps {
  room: Room;
  playerId: string;
  playerName: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isLoading?: boolean;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  playerId,
  playerName,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  isLoading = false
}) => {
  console.log('Room object in RoomLobby:', room); // DEBUG LOG
  const [copied, setCopied] = useState(false);
  const shareableLink = `${window.location.origin}/room/${room.code}`;
  const isCurrentPlayerReady = room.playersReady[playerId] || false;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const allConnectedReady = connectedPlayers.every(p => room.playersReady[p.id]);
  const isHost = room.hostPlayerId === playerId;
  const selectedGameMode = GAME_MODES.find(mode => mode.value === room.gameMode);

  // Show selected decades in the lobby
  let decadesArr = room.decades;
  if (typeof decadesArr === 'string') {
    try {
      decadesArr = JSON.parse(decadesArr);
    } catch {
      decadesArr = [];
    }
  }
  const selectedDecadesLabel =
    !decadesArr || decadesArr.length === 0
      ? 'All Players'
      : DECADES.filter(d => decadesArr.includes(d.value)).map(d => d.label).join(', ');

  React.useEffect(() => {
    if (allConnectedReady && room.status === 'playing' && connectedPlayers.length >= 2) {
      onStartGame();
    }
  }, [allConnectedReady, room.status, connectedPlayers.length, onStartGame]);

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

  return (
    <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onLeaveRoom}
          disabled={isLoading}
          className="mb-4 flex items-center space-x-2 disabled:opacity-50"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        {/* Main Card */}
        <div className="rounded-2xl shadow-2xl border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)', borderRadius: 'var(--card-border-radius)', boxShadow: 'var(--card-shadow)', padding: '2rem 2.5rem' }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}>
              <Users className="w-8 h-8" />
            </div>
            <h2 className="mb-1" style={{ fontSize: 'var(--header-font-size)', fontWeight: 'var(--header-font-weight)', color: 'var(--header-color)' }}>Game Lobby</h2>
            <p style={{ color: 'var(--subheader-color)' }}>Room Code: <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>{room.code}</span></p>
          </div>

          {/* Share Link UI */}
          <div className="rounded-xl mb-6" style={{ background: 'var(--color-background)', padding: '1.5rem' }}>
            <div className="text-center">
              <p className="mb-2 font-medium" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>Share Room Link</p>
              <div className="text-xs font-mono mb-4" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>{shareableLink}</div>
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

          {/* Game Mode Display */}
          <div className="rounded-xl mb-6 border" style={{ background: 'var(--color-background)', borderColor: 'var(--color-primary)', padding: '1rem' }}>
            <div className="text-center">
              <p className="mb-1 font-medium" style={{ fontSize: 'var(--label-font-size)', color: 'var(--color-primary)' }}>Game Mode</p>
              <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                {selectedDecadesLabel}
              </div>
            </div>
          </div>

          {/* Player Count */}
          <div className="rounded-xl mb-6" style={{ background: 'var(--color-background)', padding: '1rem' }}>
            <div className="text-center">
              <p className="mb-1 font-medium" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>Players</p>
              <div className="text-2xl font-bold" style={{ color: 'var(--header-color)' }}>
                {connectedPlayers.length}/{MAX_PLAYERS}
              </div>
              {room.players.length >= MAX_PLAYERS && (
                <p className="text-xs mt-1" style={{ color: '#F7931E' }}>Room is full!</p>
              )}
            </div>
          </div>

          {/* Players Status */}
          <div className="space-y-3 mb-6">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg border-2 transition-colors"
                style={{ background: 'var(--color-card-background)', borderColor: !player.isConnected ? '#FECACA' : room.playersReady[player.id] ? '#22C55E' : 'var(--color-card-border)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: !player.isConnected ? '#EF4444' : room.playersReady[player.id] ? '#22C55E' : '#A3A3A3' }}></div>
                  <span className="font-medium" style={{ color: !player.isConnected ? '#B91C1C' : room.playersReady[player.id] ? '#22C55E' : 'var(--subheader-color)' }}>
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
                <div className="flex items-center space-x-2">
                  {!player.isConnected ? (
                    <UserX className="w-5 h-5" style={{ color: '#EF4444' }} />
                  ) : room.playersReady[player.id] ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
                  ) : (
                    <Clock className="w-5 h-5" style={{ color: '#A3A3A3' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!allConnectedReady && connectedPlayers.length >= 2 && (
              <button
                onClick={onToggleReady}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: isCurrentPlayerReady ? 'var(--button-outline-background)' : 'var(--button-primary-background)', color: isCurrentPlayerReady ? 'var(--button-outline-color)' : 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: isCurrentPlayerReady ? 'var(--button-outline-shadow)' : 'var(--button-primary-shadow)', border: isCurrentPlayerReady ? 'var(--button-outline-border)' : 'none', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem', opacity: isLoading ? 0.5 : 1 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Starting Game...</span>
                  </div>
                ) : (
                  isCurrentPlayerReady ? 'Not Ready' : 'Ready to Play'
                )}
              </button>
            )}

            {allConnectedReady && connectedPlayers.length >= 2 && isHost && (
              <button
                onClick={onStartGame}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem', opacity: isLoading ? 0.5 : 1 }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Starting Game...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Game</span>
                  </>
                )}
              </button>
            )}

            {allConnectedReady && connectedPlayers.length >= 2 && !isHost && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-background)', border: '1px solid var(--color-primary)' }}>
                <div className="flex items-center justify-center space-x-2" style={{ color: 'var(--color-primary)' }}>
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="font-medium">Waiting for host to start the game...</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          {connectedPlayers.length >= 2 && !allConnectedReady && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                {isCurrentPlayerReady 
                  ? `Waiting for ${connectedPlayers.filter(p => !room.playersReady[p.id]).length} more player(s) to get ready`
                  : 'Click "Ready to Play" when you\'re prepared to start'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};