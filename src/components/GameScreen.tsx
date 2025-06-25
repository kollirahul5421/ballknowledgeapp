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
    if (gameState?.roundState === 'guessing') {
      setGuess('');
    }
  }, [gameState?.roundNumber]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Check if only one player remains
  if (connectedPlayers.length === 1 && connectedPlayers[0].id === playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
              <UserX className="w-12 h-12 text-orange-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              You are the only player left
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              All other players have disconnected. You can return home or wait for them to reconnect.
            </p>

            <button
              onClick={onLeaveGame}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mx-auto"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                isWinner ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {isWinner ? (
                  <Crown className="w-12 h-12 text-yellow-600" />
                ) : (
                  <Trophy className="w-12 h-12 text-gray-600" />
                )}
              </div>
              
              <h2 className={`text-4xl font-bold mb-4 ${
                isWinner ? 'text-yellow-600' : 'text-gray-700'
              }`}>
                {isWinner ? 'You Won!' : 'Game Over'}
              </h2>
              
              <p className="text-xl text-gray-600 mb-6">
                {winnerName} wins with {gameState.scores[gameState.gameWinner]} correct guesses!
              </p>

              {/* Final Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {room.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-6 rounded-xl border-2 ${
                      player.id === playerId
                        ? 'bg-blue-50 border-blue-300'
                        : player.isConnected
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <h3 className={`text-lg font-bold ${
                        player.id === playerId
                          ? 'text-blue-800'
                          : player.isConnected
                          ? 'text-gray-700'
                          : 'text-red-700'
                      }`}>
                        {player.name}
                      </h3>
                      {!player.isConnected && (
                        <UserX className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {gameState.scores[player.id] || 0}
                    </div>
                    {player.id === playerId && (
                      <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                    {player.id === room.hostPlayerId && (
                      <Crown className="w-4 h-4 text-yellow-600 mx-auto mt-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handlePlayAgain}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
                
                <button
                  onClick={onLeaveGame}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onLeaveGame}
            className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Game</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">NBA Head-to-Head</h1>
            <p className="text-blue-200">Room: {room.code} • Round {gameState.roundNumber}</p>
          </div>
          
          <div className="flex items-center space-x-2 text-blue-200">
            <Users className="w-4 h-4" />
            <span className="text-sm">{connectedPlayers.length} players</span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {room.players.map((player) => (
            <div
              key={player.id}
              className={`bg-white rounded-xl p-4 border-2 ${
                player.id === playerId
                  ? 'border-blue-300'
                  : player.isConnected
                  ? 'border-gray-300'
                  : 'border-red-300'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <h3 className={`text-sm font-bold ${
                    player.id === playerId
                      ? 'text-blue-800'
                      : player.isConnected
                      ? 'text-gray-700'
                      : 'text-red-700'
                  }`}>
                    {player.name}
                  </h3>
                  {!player.isConnected && (
                    <UserX className="w-3 h-3 text-red-500 ml-1" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {gameState.scores[player.id] || 0}
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {player.id === playerId && (
                    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                  {player.id === room.hostPlayerId && (
                    <Crown className="w-3 h-3 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Game Area */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Player Image */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              <img
                src={gameState.currentPlayer.imageUrl}
                alt="NBA Player"
                className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400";
                }}
              />
              {gameState.roundState === 'revealed' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <h3 className="text-2xl font-bold mb-2">{gameState.currentPlayer.name}</h3>
                    <p className="text-lg">{gameState.currentPlayer.team}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {gameState.roundState === 'guessing' && (
            <>
              {/* Guess Input */}
              <form onSubmit={handleSubmitGuess} className="mb-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Who is this NBA player?
                  </label>
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter player name..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
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

              {/* Show who has guessed */}
              <div className="text-center mb-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {connectedPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                        gameState.guesses[player.id]
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      <span>{player.name}</span>
                      {gameState.guesses[player.id] ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {gameState.roundState === 'revealed' && (
            <div className="text-center">
              {/* Result Message */}
              <div className="mb-6">
                {gameState.correctGuesser ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      {gameState.correctGuesser === playerId ? 'Correct!' : `${getPlayerName(gameState.correctGuesser)} got it!`}
                    </h3>
                    <p className="text-green-700">
                      That was <span className="font-bold">{gameState.currentPlayer.name}</span> from the {gameState.currentPlayer.team}
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-red-800 mb-2">No one got it!</h3>
                    <p className="text-red-700">
                      That was <span className="font-bold">{gameState.currentPlayer.name}</span> from the {gameState.currentPlayer.team}
                    </p>
                  </div>
                )}
              </div>

              {/* Show guesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {room.players.map(player => (
                  <div key={player.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700">{player.name}:</h4>
                      {!player.isConnected && (
                        <UserX className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-900">{gameState.guesses[player.id] || 'No guess'}</p>
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
                  {connectedPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                        gameState.readyForNext[player.id]
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      <span>{player.name}</span>
                      {gameState.readyForNext[player.id] ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};