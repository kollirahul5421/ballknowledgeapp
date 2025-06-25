import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';

interface JoinGameProps {
  onBack: () => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  error?: string;
  isLoading?: boolean;
  prefilledRoomCode?: string;
  playerName: string;
  setPlayerName: (name: string) => void;
}

export const JoinGame: React.FC<JoinGameProps> = ({
  onBack,
  onJoinRoom,
  error,
  isLoading = false,
  prefilledRoomCode = '',
  playerName,
  setPlayerName
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState(playerName);

  // Set prefilled room code when component mounts or prop changes
  useEffect(() => {
    if (prefilledRoomCode) {
      setRoomCode(prefilledRoomCode.toUpperCase());
    }
  }, [prefilledRoomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length !== 5 || isLoading) return;
    const name = displayName.trim() || 'Player 2';
    setPlayerName(name);
    onJoinRoom(roomCode.toUpperCase(), name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 5) {
      setRoomCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="mb-4 text-blue-200 hover:text-white transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Game</h2>
            <p className="text-gray-600">
              {prefilledRoomCode 
                ? 'Enter your display name to join this game'
                : 'Enter the room code and your name to join'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
                maxLength={20}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for default name
              </p>
            </div>

            {/* Room Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={handleInputChange}
                placeholder="Enter 5-character code"
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-center text-2xl font-bold tracking-wider text-gray-900 placeholder-gray-400 ${
                  prefilledRoomCode ? 'bg-gray-50' : ''
                }`}
                maxLength={5}
                required
                disabled={isLoading}
                readOnly={!!prefilledRoomCode}
              />
              {!prefilledRoomCode && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Example: A3B9K
                </p>
              )}
              {prefilledRoomCode && (
                <p className="text-xs text-green-600 mt-1 text-center">
                  Room code loaded from link
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={roomCode.length !== 5 || isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                'Join Game'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              {prefilledRoomCode 
                ? 'You were invited to join this game room'
                : 'Ask your friend for their room code to join their game'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};