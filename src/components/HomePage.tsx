import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, LogIn, Trophy, Settings, ChevronDown } from 'lucide-react';
import { Decade, DECADES } from '../types/game';

interface HomePageProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateGame: (decades: Decade[] | 'all', playerName: string) => void;
  onJoinGame: (playerName: string) => void;
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
  const [selectedDecades, setSelectedDecades] = useState<Decade[]>([]); // empty = all
  const [showDecadeDropdown, setShowDecadeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDecadeDropdown(false);
      }
    }
    if (showDecadeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDecadeDropdown]);

  const handleCreateGame = () => {
    const name = inputValue.trim() || 'Player 1';
    setPlayerName(name);
    onCreateGame(selectedDecades.length === 0 ? 'all' : selectedDecades, name);
  };

  const handleJoinGame = () => {
    const name = inputValue.trim() || 'Player 2';
    setPlayerName(name);
    onJoinGame(name);
  };

  const handleDecadeChange = (decade: Decade) => {
    setSelectedDecades(prev => {
      if (prev.length === 0) {
        // If 'All Players' was selected, start a new selection
        return [decade];
      }
      return prev.includes(decade)
        ? prev.filter(d => d !== decade)
        : [...prev, decade];
    });
  };

  const handleAllChange = () => {
    setSelectedDecades([]);
  };

  const handleDone = () => {
    setShowDecadeDropdown(false);
  };

  const selectedLabel =
    selectedDecades.length === 0
      ? 'All Players'
      : DECADES.filter(d => selectedDecades.includes(d.value)).map(d => d.label).join(', ');

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

            {/* Decade Selector (Dropdown with Checkboxes) */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decades
              </label>
              <button
                type="button"
                onClick={() => setShowDecadeDropdown((v) => !v)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-left bg-white flex items-center justify-between disabled:opacity-50"
              >
                <span className="text-gray-900 truncate">{selectedLabel}</span>
                <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
              </button>
              {showDecadeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 flex flex-col gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDecades.length === 0}
                      onChange={handleAllChange}
                      disabled={isLoading}
                    />
                    <span className="ml-2">All Players</span>
                  </label>
                  {DECADES.map(decade => (
                    <label key={decade.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDecades.includes(decade.value)}
                        onChange={() => handleDecadeChange(decade.value)}
                        disabled={isLoading}
                      />
                      <span className="ml-2">{decade.label}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={handleDone}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    Done
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Choose which eras of players to include in your game. Selecting none means all decades.
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