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
    <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg" style={{ background: 'var(--color-primary)' }}>
            {/* Basketball SVG icon, purple, with longer lines, not clipped */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              <circle cx="24" cy="24" r="20" fill="var(--icon-basketball-color)" stroke="var(--icon-basketball-color)" strokeWidth="4" />
              <path d="M24 4v40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M4 24h40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M8 12c8 8 24 8 32 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M8 36c8-8 24-8 32 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mb-1" style={{ fontSize: 'var(--header-font-size)', fontWeight: 'var(--header-font-weight)', color: 'var(--header-color)' }}>Ball Up Top</h1>
          <p style={{ fontSize: 'var(--subheader-font-size)', color: 'var(--subheader-color)' }}>Head to Head NBA Guessing Game</p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-2xl border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)', borderRadius: 'var(--card-border-radius)', padding: 'var(--card-padding)', boxShadow: 'var(--card-shadow)' }}>
          <div className="space-y-5">
            {/* Player Name Input */}
            <div>
              <label className="block font-medium mb-1" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500 text-sm"
                style={{ padding: '0.5rem 0.75rem', border: 'var(--input-border)', color: 'var(--input-color)', background: 'var(--input-background)', fontSize: 'var(--input-font-size)' }}
                maxLength={20}
                disabled={isLoading}
              />
              <p className="mt-1" style={{ fontSize: 'var(--label-font-size)', color: 'var(--subheader-color)' }}>
                Leave blank for default name
              </p>
            </div>

            {/* Decade Selector (Dropdown with Checkboxes) */}
            <div className="relative" ref={dropdownRef}>
              <label className="block font-medium mb-1" style={{ fontSize: 'var(--label-font-size)', color: 'var(--label-color)' }}>
                Decades
              </label>
              <button
                type="button"
                onClick={() => setShowDecadeDropdown((v) => !v)}
                disabled={isLoading}
                className="w-full rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-left flex items-center justify-between disabled:opacity-50 text-sm"
                style={{ padding: '0.5rem 0.75rem', border: 'var(--input-border)', background: 'var(--input-background)', color: 'var(--input-color)', fontSize: 'var(--input-font-size)' }}
              >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
              </button>
              {showDecadeDropdown && (
                <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg flex flex-col gap-1" style={{ background: 'var(--input-background)', border: 'var(--input-border)', padding: '0.75rem' }}>
                  <label className="inline-flex items-center text-sm" style={{ color: 'var(--input-color)' }}>
                    <input
                      type="checkbox"
                      checked={selectedDecades.length === 0}
                      onChange={handleAllChange}
                      disabled={isLoading}
                      className="accent-primary"
                    />
                    <span className="ml-2">All Players</span>
                  </label>
                  {DECADES.map(decade => (
                    <label key={decade.value} className="inline-flex items-center text-sm" style={{ color: 'var(--input-color)' }}>
                      <input
                        type="checkbox"
                        checked={selectedDecades.includes(decade.value)}
                        onChange={() => handleDecadeChange(decade.value)}
                        disabled={isLoading}
                        className="accent-primary"
                      />
                      <span className="ml-2">{decade.label}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={handleDone}
                    className="mt-2 w-full rounded-xl transition-all duration-200 text-sm font-semibold"
                    style={{ background: 'var(--color-primary)', color: 'var(--button-primary-color)', padding: '0.375rem 0.75rem' }}
                  >
                    Done
                  </button>
                </div>
              )}
              <p className="mt-1" style={{ fontSize: 'var(--label-font-size)', color: 'var(--subheader-color)' }}>
                Choose which eras of players to include in your game. Selecting none means all decades.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
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
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-outline-background)', color: 'var(--button-outline-color)', fontWeight: 'var(--button-outline-font-weight)', boxShadow: 'var(--button-outline-shadow)', border: 'var(--button-outline-border)', borderRadius: 'var(--button-outline-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                <LogIn className="w-5 h-5" />
                <span>Join Game</span>
              </button>
              <button
                onClick={onShowAdmin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-outline-background)', color: 'var(--button-outline-color)', fontWeight: 'var(--button-outline-font-weight)', boxShadow: 'var(--button-outline-shadow)', border: 'var(--button-outline-border)', borderRadius: 'var(--button-outline-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                <Settings className="w-5 h-5" />
                <span>Manage Players</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2" style={{ color: 'var(--subheader-color)' }}>
            <Users className="w-4 h-4" />
            <span style={{ fontSize: 'var(--label-font-size)' }}>Challenge your friends to an NBA showdown!</span>
          </div>
        </div>
      </div>
    </div>
  );
};