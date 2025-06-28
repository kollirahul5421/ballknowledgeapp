import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ArrowLeft, Users, Clock, CheckCircle, Crown, RotateCcw, Home, UserX } from 'lucide-react';
import { Room, WINNING_SCORE } from '../types/game';
import { SupabaseRoomManager } from '../utils/supabaseRoomManager';

interface GameScreenProps {
  room: Room;
  playerId: string;
  onLeaveGame: () => void;
  onRoomUpdate: (room: Room) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  room,
  playerId,
  onLeaveGame,
  onRoomUpdate
}) => {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const roomManager = SupabaseRoomManager.getInstance();

  const gameState = room.gameState;
  const currentPlayer = room.players.find(p => p.id === playerId);
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const activePlayers = gameState?.activePlayers || [];

  // Focus input when round starts
  useEffect(() => {
    if (gameState?.roundState === 'guessing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState?.roundState, gameState?.roundNumber]);

  // Clear guess when new round starts
  useEffect(() => {
    setGuess('');
  }, [gameState?.roundNumber]);

  // Set image loading when entering guessing state
  useEffect(() => {
    if (gameState?.roundState === 'guessing') {
      setImageLoading(true);
    }
  }, [gameState?.roundState]);

  // Handle round transitions
  useEffect(() => {
    if (gameState?.roundState === 'round-transition') {
      // Check for transition every 100ms
      const interval = setInterval(async () => {
        try {
          const updatedRoom = await roomManager.checkAndTransitionRound(room.code);
          if (updatedRoom) {
            onRoomUpdate(updatedRoom);
          }
        } catch (error) {
          console.error('Error checking round transition:', error);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState?.roundState, room.code, roomManager, onRoomUpdate]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400";
    setImageLoading(false);
  };

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isSubmitting || !gameState || gameState.roundState !== 'guessing') {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedRoom = await roomManager.submitGuess(room.code, playerId, guess.trim());
      
      if (updatedRoom) {
        onRoomUpdate(updatedRoom);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextRound = async () => {
    if (!gameState || gameState.roundState !== 'revealed') return;
    
    try {
      const updatedRoom = await roomManager.setPlayerReadyForNext(room.code, playerId);
      if (updatedRoom) {
        onRoomUpdate(updatedRoom);
      }
    } catch (error) {
      console.error('Error setting ready for next:', error);
    }
  };

  const handleSkipRound = async () => {
    if (!gameState || gameState.roundState !== 'guessing') return;
    
    try {
      const updatedRoom = await roomManager.skipRound(room.code, playerId);
      if (updatedRoom) {
        onRoomUpdate(updatedRoom);
      }
    } catch (error) {
      console.error('Error voting to skip round:', error);
    }
  };

  const handlePlayAgain = async () => {
    try {
      const updatedRoom = await roomManager.resetGame(room.code);
      if (updatedRoom) {
        onRoomUpdate(updatedRoom);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  const getPlayerName = (playerId: string): string => {
    const player = room.players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="text-center" style={{ color: 'var(--color-text)' }}>
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Check if only one player remains
  if (connectedPlayers.length === 1 && connectedPlayers[0].id === playerId) {
    return (
      <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl shadow-2xl p-8 text-center border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)', borderRadius: 'var(--card-border-radius)', boxShadow: 'var(--card-shadow)' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: '#FFF3E0' }}>
              <UserX className="w-12 h-12" style={{ color: '#F7931E' }} />
            </div>
            <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--header-color)' }}>
              You are the only player left
            </h2>
            <p className="mb-8" style={{ fontSize: '1.125rem', color: 'var(--subheader-color)' }}>
              All other players have disconnected. You can return home or wait for them to reconnect.
            </p>
            <button
              onClick={onLeaveGame}
              className="flex items-center justify-center space-x-2 rounded-xl transition-all duration-200 mx-auto"
              style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game finished screen
  if (gameState.gameWinner) {
    const isWinner = gameState.gameWinner === playerId;
    const winnerName = getPlayerName(gameState.gameWinner);

    return (
      <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-4xl">
          <div className="rounded-2xl shadow-2xl p-8 border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)', borderRadius: 'var(--card-border-radius)', boxShadow: 'var(--card-shadow)' }}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${isWinner ? '' : ''}`}
                style={{ background: isWinner ? '#FFF9C4' : '#F3F4F6' }}>
                {isWinner ? (
                  <Crown className="w-12 h-12" style={{ color: '#FFD600' }} />
                ) : (
                  <Trophy className="w-12 h-12" style={{ color: '#A3A3A3' }} />
                )}
              </div>
              <h2 className="mb-4" style={{ fontSize: '2.25rem', fontWeight: 'bold', color: isWinner ? '#FFD600' : 'var(--header-color)' }}>
                {isWinner ? 'You Won!' : 'Game Over'}
              </h2>
              <p className="mb-6" style={{ fontSize: '1.25rem', color: 'var(--subheader-color)' }}>
                {winnerName} wins with {gameState.scores[gameState.gameWinner]} correct guesses!
              </p>
              {/* Final Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {room.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="p-6 rounded-xl border-2"
                    style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)' }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="text-lg font-bold" style={{ color: player.id === playerId ? 'var(--color-primary)' : 'var(--header-color)' }}>
                        {player.name}
                      </h3>
                      {!player.isConnected && (
                        <UserX className="w-4 h-4" style={{ color: '#EF4444', marginLeft: '0.5rem' }} />
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: 'var(--header-color)' }}>
                      {gameState.scores[player.id] || 0}
                    </div>
                    {player.id === playerId && (
                      <span className="inline-block" style={{ background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                        You
                      </span>
                    )}
                    {player.id === room.hostPlayerId && (
                      <Crown className="w-4 h-4" style={{ color: '#FFD600', margin: '0.25rem auto 0' }} />
                    )}
                  </div>
                ))}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handlePlayAgain}
                  className="flex items-center justify-center space-x-2 rounded-xl transition-all duration-200"
                  style={{ background: 'var(--button-primary-background)', color: 'var(--button-primary-color)', fontWeight: 'var(--button-primary-font-weight)', boxShadow: 'var(--button-primary-shadow)', borderRadius: 'var(--button-primary-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onLeaveGame}
                  className="flex items-center justify-center space-x-2 rounded-xl transition-all duration-200"
                  style={{ background: 'var(--button-outline-background)', color: 'var(--button-outline-color)', fontWeight: 'var(--button-outline-font-weight)', boxShadow: 'var(--button-outline-shadow)', border: 'var(--button-outline-border)', borderRadius: 'var(--button-outline-border-radius)', fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                >
                  <Home className="w-5 h-5" />
                  <span>Return Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dot p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onLeaveGame}
            className="flex items-center space-x-2"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Game</span>
          </button>
          <div className="text-center">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--header-color)' }}>NBA Head-to-Head</h1>
            <p style={{ color: 'var(--subheader-color)' }}>Room: {room.code} • Round {gameState.roundNumber}</p>
          </div>
          <div className="flex items-center space-x-2" style={{ color: 'var(--color-primary)' }}>
            <Users className="w-4 h-4" />
            <span className="text-sm">{connectedPlayers.length} players</span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="rounded-xl p-4 border-2"
              style={{ background: 'var(--color-card-background)', borderColor: player.id === playerId ? 'var(--color-primary)' : player.isConnected ? 'var(--color-card-border)' : '#FECACA' }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <h3 className="text-sm font-bold" style={{ color: player.id === playerId ? 'var(--color-primary)' : player.isConnected ? 'var(--header-color)' : '#B91C1C' }}>
                    {player.name}
                  </h3>
                  {!player.isConnected && (
                    <UserX className="w-3 h-3" style={{ color: '#EF4444', marginLeft: '0.25rem' }} />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--header-color)' }}>
                  {gameState.scores[player.id] || 0}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {player.id === playerId && (
                    <span className="inline-block" style={{ background: 'var(--color-primary)', color: 'var(--color-text)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                      You
                    </span>
                  )}
                  {player.id === room.hostPlayerId && (
                    <Crown className="w-3 h-3" style={{ color: '#FFD600' }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8" style={{ background: 'var(--color-card-background)' }}>
          {/* Player Image */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              {imageLoading && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: 'var(--input-background)' }}>
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              {gameState.roundState !== 'round-transition' && (
                <img
                  src={gameState.currentPlayer.imageUrl}
                  alt="NBA Player"
                  className={`w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
              {gameState.roundState === 'revealed' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-4" style={{ color: 'var(--color-text)' }}>
                    <h3 className="text-2xl font-bold mb-2">{gameState.currentPlayer.name}</h3>
                    <p className="text-lg">{gameState.currentPlayer.team}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {gameState.roundState === 'round-transition' && (
            <div className="text-center">
              <div className="rounded-xl p-8 border" style={{ background: 'var(--color-card-background)', borderColor: 'var(--color-card-border)' }}>
                <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                <h3 className="mb-2" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--header-color)' }}>Preparing Next Round</h3>
                <p style={{ color: 'var(--subheader-color)' }}>Round {gameState.roundNumber}</p>
              </div>
            </div>
          )}

          {gameState.roundState === 'guessing' && (
            <>
              {/* Guess Input */}
              <form onSubmit={handleSubmitGuess} className="mb-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium mb-2 text-center" style={{ color: 'var(--subheader-color)' }}>
                    Who is this NBA player?
                  </label>
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter player name..."
                      className="flex-1 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500 text-sm"
                      style={{ padding: '0.75rem 1rem', border: 'var(--input-border)', color: 'var(--input-color)', background: 'var(--input-background)', fontSize: 'var(--input-font-size)' }}
                      disabled={isSubmitting}
                      maxLength={50}
                    />
                    <button
                      type="submit"
                      disabled={!guess.trim() || isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Skip Button */}
              <div className="text-center mb-4">
                <button
                  onClick={handleSkipRound}
                  disabled={isSubmitting || gameState.skipVotes[playerId]}
                  className="font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg"
                  style={gameState.skipVotes[playerId]
                    ? { background: 'var(--color-primary)', color: '#fff', cursor: 'not-allowed' }
                    : { background: 'var(--chip-neutral-background)', color: 'var(--color-text)' }
                  }
                >
                  {gameState.skipVotes[playerId] ? 'Voted to Skip' : 'Skip Question'}
                </button>
              </div>

              {/* Show who has guessed and who has voted to skip */}
              <div className="text-center mb-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {connectedPlayers.map(player => {
                    let chipStyle = {};
                    let icon = null;
                    if (gameState.guesses[player.id]) {
                      chipStyle = {
                        background: 'var(--chip-success-background)',
                        color: 'var(--chip-success-color)'
                      };
                      icon = <CheckCircle className="w-4 h-4" style={{ color: 'var(--chip-success-color)' }} />;
                    } else if (gameState.skipVotes[player.id]) {
                      chipStyle = {
                        background: 'var(--chip-warning-background)',
                        color: 'var(--chip-warning-color)'
                      };
                      icon = <span style={{ color: 'var(--chip-warning-color)' }}>⏭️</span>;
                    } else {
                      chipStyle = {
                        background: 'var(--chip-neutral-background)',
                        color: 'var(--chip-neutral-color)'
                      };
                      icon = <Clock className="w-4 h-4" style={{ color: 'var(--chip-neutral-color)' }} />;
                    }
                    return (
                      <div
                        key={player.id}
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm"
                        style={chipStyle}
                      >
                        <span>{player.name}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {gameState.roundState === 'revealed' && (
            <div className="text-center">
              {/* Result Message */}
              <div className="mb-6">
                {gameState.correctGuesser ? (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-success-background)' }}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--chip-success-color)' }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-success-color)' }}>
                      {gameState.correctGuesser === playerId ? 'Correct!' : `${getPlayerName(gameState.correctGuesser)} got it!`}
                    </h3>
                    <p style={{ color: 'var(--chip-success-color)' }}>
                      That was <span className="font-bold">{gameState.currentPlayer.name}</span> from the {gameState.currentPlayer.team}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-error-background)' }}>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-error-color)' }}>No one got it!</h3>
                    <p style={{ color: 'var(--chip-error-color)' }}>
                      That was <span className="font-bold">{gameState.currentPlayer.name}</span> from the {gameState.currentPlayer.team}
                    </p>
                  </div>
                )}
              </div>

              {/* Show guesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {room.players.map(player => (
                  <div key={player.id} className="rounded-lg p-4" style={{ background: 'var(--input-background)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--subheader-color)' }}>{player.name}:</h4>
                      {!player.isConnected && (
                        <UserX className="w-4 h-4" style={{ color: '#EF4444' }} />
                      )}
                    </div>
                    <p style={{ color: 'var(--color-text)' }}>{gameState.guesses[player.id] || 'No guess'}</p>
                  </div>
                ))}
              </div>

              {/* Next Round Button */}
              <button
                onClick={handleNextRound}
                disabled={gameState.readyForNext[playerId]}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {gameState.readyForNext[playerId] ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Waiting for others...</span>
                  </div>
                ) : (
                  'Next Round'
                )}
              </button>

              {/* Show who's ready */}
              <div className="mt-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {connectedPlayers.map(player => {
                    let chipStyle = {};
                    let icon = null;
                    if (gameState.readyForNext[player.id]) {
                      chipStyle = {
                        background: 'var(--chip-success-background)',
                        color: 'var(--chip-success-color)'
                      };
                      icon = <CheckCircle className="w-4 h-4" style={{ color: 'var(--chip-success-color)' }} />;
                    } else {
                      chipStyle = {
                        background: 'var(--chip-neutral-background)',
                        color: 'var(--chip-neutral-color)'
                      };
                      icon = <Clock className="w-4 h-4" style={{ color: 'var(--chip-neutral-color)' }} />;
                    }
                    return (
                      <div
                        key={player.id}
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm"
                        style={chipStyle}
                      >
                        <span>{player.name}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};