import React, { useState } from 'react';
import { Users, Plus, LogIn, Trophy, Settings } from 'lucide-react';
import { GameMode, GAME_MODES } from '../types/game';

interface HomePageProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateGame: (gameMode: GameMode) => void;
  onJoinGame: () => void;
  onShowAdmin: () => void;
  isLoading?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  playerName,
  setPlayerName,
  onCreateGame,
  onJoinGame,
  onShowAdmin,
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState(playerName);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('all');
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);

  const handleCreateGame = () => {
    setPlayerName(inputValue.trim() || 'Player 1');
    onCreateGame(selectedGameMode);
  };

  const handleJoinGame = () => {
    setPlayerName(inputValue.trim() || 'Player 2');
    onJoinGame();
  };

  const handleGameModeSelect = (mode: GameMode) => {
    setSelectedGameMode(mode);
    setShowGameModeSelector(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            NBA Head-to-Head
          </h1>
          <p className="text-xl text-blue-200">Guessing Game</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="space-y-6">
            {/* Player Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                maxLength={20}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for default name
              </p>
            </div>

            {/* Game Mode Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Mode
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGameModeSelector(!showGameModeSelector)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-left bg-white disabled:opacity-50"
                >
                  <span className="text-gray-900">
                    {GAME_MODES.find(mode => mode.value === selectedGameMode)?.label}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                {showGameModeSelector && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                    {GAME_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => handleGameModeSelect(mode.value)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <span className="text-gray-900">{mode.label}</span>
                        {mode.value !== 'all' && (
                          <span className="text-xs text-gray-500 block">
                            Players from the {mode.value}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose which era of players to include in your game
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Game</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleJoinGame}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Join Game</span>
              </button>

              <button
                onClick={onShowAdmin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Manage Players</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-blue-200">
            <Users className="w-4 h-4" />
            <span className="text-sm">Challenge your friends to an NBA showdown!</span>
          </div>
        </div>
      </div>
    </div>
  );
};