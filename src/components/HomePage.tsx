import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, LogIn, Trophy, Settings, ChevronDown, User, X } from 'lucide-react';
import { Decade, DECADES } from '../types/game';

interface HomePageProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateGame: (decades: Decade[] | 'all', playerName: string) => void;
  onJoinGame: (playerName: string) => void;
  onSinglePlayer: (decades: Decade[] | 'all', playerName: string) => void;
  onShowAdmin: () => void;
  isLoading?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  playerName,
  setPlayerName,
  onCreateGame,
  onJoinGame,
  onSinglePlayer,
  onShowAdmin,
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState(playerName);
  const [selectedDecades, setSelectedDecades] = useState<Decade[]>([]); // empty = all
  const [showDecadeDropdown, setShowDecadeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(true);

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

  const handleSinglePlayer = () => {
    const name = inputValue.trim() || 'Player';
    setPlayerName(name);
    onSinglePlayer(selectedDecades.length === 0 ? 'all' : selectedDecades, name);
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
    <div className="min-h-screen bg-dot flex flex-col lg:flex-row items-start justify-center p-4" style={{ background: 'var(--color-background)' }}>
      {/* Main Content */}
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-8">
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
                Choose which eras of players to include in your game.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSinglePlayer}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Single Player</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--button-outline-background)', color: 'var(--button-outline-color)', fontWeight: 'var(--button-outline-font-weight)', boxShadow: 'var(--button-outline-shadow)', border: 'var(--button-outline-border)', borderRadius: 'var(--button-outline-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                <Plus className="w-5 h-5" />
                <span>Create Game</span>
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
            </div>
            {/* Footer message inside card */}
            <div className="text-center pt-2">
              <div className="flex items-center justify-center space-x-2" style={{ color: 'var(--subheader-color)' }}>
                <Users className="w-4 h-4" />
                <span style={{ fontSize: 'var(--label-font-size)' }}>Challenge your friends to an NBA showdown!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* How to Play Sidebar */}
      {showHowToPlay && (
        <aside className="w-full lg:w-96 mt-8 lg:mt-0 lg:fixed lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:h-auto lg:max-h-[90vh] lg:overflow-y-auto z-20">
          <div className="rounded-2xl border shadow-xl p-6 m-4 lg:mr-8 relative" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)' }}>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label="Hide How to Play"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--header-color)' }}>How to Play</h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-bold mb-1 text-purple-400" style={{ color: 'var(--color-primary)' }}>Game Modes</div>
                <ul className="list-disc ml-5">
                  <li><b>Single Player:</b> Guess NBA players. You get 3 lives.</li>
                  <li><b>Create/Join Game:</b> Play with 2–4 friends. Host starts the game.</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1 text-purple-400" style={{ color: 'var(--color-primary)' }}>Multiplayer Rules</div>
                <ul className="list-disc ml-5">
                  <li>2–4 players per lobby.</li>
                  <li>First to 7 points wins.</li>
                  <li>Both players can skip a player.</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1 text-purple-400" style={{ color: 'var(--color-primary)' }}>Answering</div>
                <ul className="list-disc ml-5">
                  <li>Enter first, last, or full name. Minor typos are OK.</li>
                  <li>"Give Up" skips and costs a life (single player).</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-1 text-purple-400" style={{ color: 'var(--color-primary)' }}>Other</div>
                <ul className="list-disc ml-5">
                  <li>Choose player eras (decades) when starting.</li>
                  <li>Set a display name or leave blank.</li>
                  <li>Suggestions? Use the form at bottom right.</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      )}
      {/* Persistent Footer */}
      <footer className="w-full border-t border-gray-800 bg-black/80 text-gray-400 text-[11px] flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-2 py-2 md:py-4 fixed bottom-0 left-0 z-30" style={{backdropFilter: 'blur(4px)'}}>
        <div className="flex items-center gap-1 min-w-0">
          {/* Company logo, smaller */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0" fill="none">
            <circle cx="24" cy="24" r="20" fill="var(--icon-basketball-color)" stroke="var(--icon-basketball-color)" strokeWidth="4" />
            <path d="M24 4v40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M4 24h40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M8 12c8 8 24 8 32 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M8 36c8-8 24-8 32 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-semibold truncate max-w-[80px]">BallUpTop</span>
        </div>
        <div className="flex-1 min-w-0 text-left truncate hidden xs:inline md:block md:truncate">
          <span className="truncate">For entertainment purposes only. Not affiliated with the NBA.</span>
        </div>
        <div className="flex items-center gap-2 min-w-0 ml-auto">
          <span className="truncate">©2025</span>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfe5hCnzAz6n5pRu6W22UmKjk-_SJ1orILc34bpNnCj2OxZlQ/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] shadow transition whitespace-nowrap"
          >
            Feedback
          </a>
        </div>
      </footer>
    </div>
  );
};