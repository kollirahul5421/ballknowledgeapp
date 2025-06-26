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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-blue-200 hover:text-white transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Created!</h2>
            <p className="text-gray-600">Share your room link with friends</p>
          </div>

          {/* Room Code Display */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Room Code</p>
              <div className="text-4xl font-bold text-blue-600 tracking-wider mb-4">
                {room.code}
              </div>
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

          {/* Player Count */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700 mb-1">Players</p>
              <div className="text-2xl font-bold text-blue-800">
                {room.players.filter(p => p.isConnected).length}/{MAX_PLAYERS}
              </div>
              {room.players.length >= MAX_PLAYERS && (
                <p className="text-xs text-orange-600 mt-1">Room is full!</p>
              )}
            </div>
          </div>

          {/* Player Status */}
          <div className="space-y-3 mb-6">
            {room.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  player.isConnected
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    player.isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    player.isConnected ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {player.name}
                  </span>
                  {player.id === playerId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                  {player.id === room.hostPlayerId && (
                    <Crown className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {player.isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: MAX_PLAYERS - room.players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-600">Waiting for player...</span>
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>

          {/* Waiting Message */}
          <div className="text-center">
            {room.players.filter(p => p.isConnected).length < 2 ? (
              <div className="inline-flex items-center space-x-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Need at least 2 players to start</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Ready to move to lobby!</span>
              </div>
            )}
            {isHost && room.players.filter(p => p.isConnected).length < MAX_PLAYERS && (
              <div className="mt-2 inline-flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">You can still invite more players!</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Room expires in 1 minute if no one joins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};