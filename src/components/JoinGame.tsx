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
    <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="mb-4 flex items-center space-x-2 disabled:opacity-50"
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
            <h2 className="mb-2" style={{ fontSize: 'var(--header-font-size)', fontWeight: 'var(--header-font-weight)', color: 'var(--header-color)' }}>Join Game</h2>
            <p style={{ color: 'var(--subheader-color)' }}>
              {prefilledRoomCode 
                ? 'Enter your display name to join this game'
                : 'Enter the room code and your name to join'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Input */}
            <div>
              <label className="block font-medium mb-2" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500 text-sm"
                style={{ padding: '0.75rem 1rem', border: 'var(--input-border)', color: 'var(--input-color)', background: 'var(--input-background)', fontSize: 'var(--input-font-size)' }}
                maxLength={20}
                disabled={isLoading}
              />
              <p className="mt-1" style={{ fontSize: 'var(--label-font-size)', color: 'var(--subheader-color)' }}>
                Leave blank for default name
              </p>
            </div>

            {/* Room Code Input */}
            <div>
              <label className="block font-medium mb-2" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={handleInputChange}
                placeholder="Enter 5-character code"
                className={`w-full rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-center font-bold tracking-wider text-sm ${prefilledRoomCode ? '' : ''}`}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'var(--input-border)',
                  color: 'var(--input-color)',
                  background: 'var(--input-background)',
                  fontSize: '1.5rem'
                }}
                maxLength={5}
                required
                disabled={isLoading}
                readOnly={!!prefilledRoomCode}
              />
              {!prefilledRoomCode && (
                <p className="mt-1 text-center" style={{ fontSize: 'var(--label-font-size)', color: 'var(--subheader-color)' }}>
                  Example: A3B9K
                </p>
              )}
              {prefilledRoomCode && (
                <p className="mt-1 text-center" style={{ fontSize: 'var(--label-font-size)', color: '#22C55E' }}>
                  Room code loaded from link
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg border" style={{ color: '#EF4444', background: '#FEF2F2', borderColor: '#FECACA' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={roomCode.length !== 5 || isLoading}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
              style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem', opacity: isLoading ? 0.5 : 1 }}
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
            <p style={{ fontSize: 'var(--label-font-size)', color: 'var(--subheader-color)' }}>
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