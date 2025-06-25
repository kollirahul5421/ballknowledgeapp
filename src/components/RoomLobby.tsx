import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Play, ArrowLeft, Crown, UserX, Copy } from 'lucide-react';
import { Room, MAX_PLAYERS } from '../types/game';
import { GAME_MODES } from '../types/game';

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
  const [copied, setCopied] = useState(false);
  const shareableLink = `${window.location.origin}/room/${room.code}`;
  const isCurrentPlayerReady = room.playersReady[playerId] || false;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const allConnectedReady = connectedPlayers.every(p => room.playersReady[p.id]);
  const isHost = room.hostPlayerId === playerId;
  const selectedGameMode = GAME_MODES.find(mode => mode.value === room.gameMode);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onLeaveRoom}
          disabled={isLoading}
          className="mb-4 text-blue-200 hover:text-white transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Game Lobby</h2>
            <p className="text-gray-600">Room Code: <span className="font-mono font-bold">{room.code}</span></p>
          </div>

          {/* Share Link UI */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Share Room Link</p>
              <div className="text-xs font-mono text-blue-600 break-all mb-4">{shareableLink}</div>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
          {selectedGameMode && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700 mb-1">Game Mode</p>
                <div className="text-lg font-bold text-blue-800">
                  {selectedGameMode.label}
                </div>
                {room.gameMode !== 'all' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Players from the {room.gameMode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Player Count */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">Players</p>
              <div className="text-2xl font-bold text-gray-900">
                {connectedPlayers.length}/{MAX_PLAYERS}
              </div>
              {room.players.length >= MAX_PLAYERS && (
                <p className="text-xs text-orange-600 mt-1">Room is full!</p>
              )}
            </div>
          </div>

          {/* Players Status */}
          <div className="space-y-3 mb-6">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  !player.isConnected
                    ? 'bg-red-50 border-red-200'
                    : room.playersReady[player.id]
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    !player.isConnected
                      ? 'bg-red-500'
                      : room.playersReady[player.id]
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}></div>
                  <span className={`font-medium ${
                    !player.isConnected
                      ? 'text-red-800'
                      : room.playersReady[player.id]
                      ? 'text-green-800'
                      : 'text-gray-600'
                  }`}>
                    {player.name}
                  </span>
                  {player.id === playerId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                  {player.id === room.hostPlayerId && (
                    <Crown className="w-4 h-4 text-yellow-600" title="Host" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!player.isConnected ? (
                    <UserX className="w-5 h-5 text-red-500" />
                  ) : room.playersReady[player.id] ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
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
                className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none ${
                  isCurrentPlayerReady
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                } ${isLoading ? 'opacity-50' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  isCurrentPlayerReady ? 'Cancel Ready' : 'I\'m Ready!'
                )}
              </button>
            )}

            {allConnectedReady && connectedPlayers.length >= 2 && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-green-600 bg-green-50 px-6 py-4 rounded-xl mb-4 border border-green-200">
                  <Play className="w-5 h-5" />
                  <span className="font-semibold">Starting game...</span>
                </div>
                <p className="text-sm text-gray-600">Get ready for the NBA challenge!</p>
              </div>
            )}

            {connectedPlayers.length < 2 && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-orange-600 bg-orange-50 px-6 py-4 rounded-xl mb-4 border border-orange-200">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Need at least 2 players to start</span>
                </div>
                <p className="text-sm text-gray-600">Share the room code with friends!</p>
              </div>
            )}
          </div>

          {/* Status Message */}
          {connectedPlayers.length >= 2 && !allConnectedReady && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                {isCurrentPlayerReady 
                  ? `Waiting for ${connectedPlayers.filter(p => !room.playersReady[p.id]).length} more player(s) to get ready`
                  : 'Click "I\'m Ready!" when you\'re prepared to start'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};