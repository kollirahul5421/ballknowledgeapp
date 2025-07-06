import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, X, RotateCcw, Home, Heart, Trophy } from 'lucide-react';
import { PlayerManager } from '../utils/playerManager';
import { Player } from '../types/player';
import { Decade } from '../types/game';

interface SinglePlayerGameProps {
  onBackToHome: () => void;
  decades: Decade[] | 'all';
}

export const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({
  onBackToHome,
  decades
}) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [usedPlayerIds, setUsedPlayerIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | 'giveup' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerManager = PlayerManager.getInstance();

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('nba-single-player-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Load first player on mount
  useEffect(() => {
    loadNextPlayer();
  }, []);

  // Focus input when round starts
  useEffect(() => {
    if (!isRevealed && !isTransitioning && !gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRevealed, roundNumber, isTransitioning, gameOver]);

  const loadNextPlayer = async () => {
    setIsLoading(true);
    setIsTransitioning(false);
    try {
      const decadeSelection = decades === 'all' ? { all: true, decades: [] } : { all: false, decades };
      const nextPlayer = await playerManager.getRandomPlayer(usedPlayerIds, decadeSelection);
      
      if (!nextPlayer) {
        // Reset used players if we've exhausted all options
        const fallbackPlayer = await playerManager.getRandomPlayer([], decadeSelection);
        if (fallbackPlayer) {
          setCurrentPlayer(fallbackPlayer);
          setUsedPlayerIds([fallbackPlayer.id]);
        }
      } else {
        setCurrentPlayer(nextPlayer);
        setUsedPlayerIds(prev => [...prev, nextPlayer.id]);
      }
      
      // Reset round state
      setGuess('');
      setIsRevealed(false);
      setShowAnswer(false);
      setImageLoading(true);
      setLastGuessResult(null);
    } catch (error) {
      console.error('Error loading next player:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400";
    setImageLoading(false);
  };

  const isCorrectGuess = (guess: string, correctName: string): boolean => {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedCorrect = correctName.toLowerCase().trim();
    
    // Exact match
    if (normalizedGuess === normalizedCorrect) return true;
    
    // Check if guess contains the correct name or vice versa
    if (normalizedGuess.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedGuess)) {
      return true;
    }
    
    // Simple Levenshtein distance check for typos (allow 1-2 character differences)
    return calculateLevenshteinDistance(normalizedGuess, normalizedCorrect) <= 2;
  };

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isSubmitting || !currentPlayer || isRevealed || gameOver) {
      return;
    }

    setIsSubmitting(true);

    const isCorrect = isCorrectGuess(guess.trim(), currentPlayer.name);
    
    if (isCorrect) {
      // Correct guess - add point and reveal
      setScore(prev => prev + 1);
      setLastGuessResult('correct');
      setIsRevealed(true);
      setShowAnswer(true);
    } else {
      // Incorrect guess - lose a life and reveal
      const newLives = lives - 1;
      setLives(newLives);
      setLastGuessResult('incorrect');
      setIsRevealed(true);
      setShowAnswer(true);
      
      // Check if game over
      if (newLives <= 0) {
        setGameOver(true);
        // Update high score if current score is higher
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('nba-single-player-high-score', score.toString());
        }
      }
    }

    setGuess('');
    setIsSubmitting(false);
  };

  const handleGiveUp = () => {
    if (gameOver || isRevealed) return;
    
    const newLives = lives - 1;
    setLives(newLives);
    setLastGuessResult('giveup');
    setIsRevealed(true);
    setShowAnswer(true);
    
    // Check if game over
    if (newLives <= 0) {
      setGameOver(true);
      // Update high score if current score is higher
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('nba-single-player-high-score', score.toString());
      }
    }
  };

  const handleNextRound = () => {
    if (gameOver) return;
    
    setIsTransitioning(true);
    setRoundNumber(prev => prev + 1);
    
    // Small delay to show transition state
    setTimeout(() => {
      loadNextPlayer();
    }, 500);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setLives(3);
    setRoundNumber(1);
    setUsedPlayerIds([]);
    setGameOver(false);
    setLastGuessResult(null);
    setIsTransitioning(true);
    
    // Small delay to show transition state
    setTimeout(() => {
      loadNextPlayer();
    }, 500);
  };

  if (isLoading || !currentPlayer) {
    return (
      <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="text-center" style={{ color: 'var(--color-text)' }}>
          <div
            className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p>{isTransitioning ? 'Loading next player...' : 'Loading player...'}</p>
        </div>
      </div>
    );
  }

  const selectedDecadesLabel = decades === 'all' 
    ? 'All Players' 
    : decades.map(d => `${d} Era`).join(', ');

  // Game Over Screen
  if (gameOver) {
    const isNewHighScore = score === highScore && score > 0;
    
    return (
      <div className="min-h-screen bg-dot p-4" style={{ background: 'var(--color-background)' }}>
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2"
              style={{ color: 'var(--color-primary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="text-center">
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--header-color)' }}>Game Over</h1>
              <p style={{ color: 'var(--subheader-color)' }}>{selectedDecadesLabel}</p>
            </div>
            <div></div>
          </div>

          {/* Game Over Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center" style={{ background: 'var(--color-card-background)' }}>
            <div className="mb-8">
              {isNewHighScore ? (
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: '#FFF9C4' }}>
                  <Trophy className="w-12 h-12" style={{ color: '#FFD600' }} />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: '#FEF2F2' }}>
                  <X className="w-12 h-12" style={{ color: '#EF4444' }} />
                </div>
              )}
              
              <h2 className="mb-4" style={{ fontSize: '2.25rem', fontWeight: 'bold', color: isNewHighScore ? '#FFD600' : 'var(--header-color)' }}>
                {isNewHighScore ? 'New High Score!' : 'Game Over'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-md mx-auto">
                <div className="rounded-xl p-6" style={{ background: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{score}</div>
                  <div className="text-sm" style={{ color: 'var(--subheader-color)' }}>Final Score</div>
                </div>
                
                <div className="rounded-xl p-6" style={{ background: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: '#FFD600' }}>{highScore}</div>
                  <div className="text-sm" style={{ color: 'var(--subheader-color)' }}>High Score</div>
                </div>
              </div>

              <p className="mb-8" style={{ fontSize: '1.125rem', color: 'var(--subheader-color)' }}>
                You answered {score} player{score !== 1 ? 's' : ''} correctly in {roundNumber - 1} round{roundNumber - 1 !== 1 ? 's' : ''}!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Play Again
              </button>

              <button
                onClick={onBackToHome}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 inline mr-2" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dot p-4" style={{ background: 'var(--color-background)' }}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <div className="text-center">
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--header-color)' }}>Single Player</h1>
            <p style={{ color: 'var(--subheader-color)' }}>Round {roundNumber} • {selectedDecadesLabel}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{score}</div>
                <div className="text-sm" style={{ color: 'var(--subheader-color)' }}>Score</div>
              </div>
              {highScore > 0 && (
                <div className="text-center">
                  <div className="text-xl font-bold" style={{ color: '#FFD600' }}>{highScore}</div>
                  <div className="text-xs" style={{ color: 'var(--subheader-color)' }}>High Score</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lives Display */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl" style={{ background: 'var(--color-card-background)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--subheader-color)' }}>Lives:</span>
            {Array.from({ length: 3 }).map((_, index) => (
              <Heart
                key={index}
                className={`w-5 h-5 ${index < lives ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            ))}
          </div>
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
              <img
                src={currentPlayer.imageUrl}
                alt="NBA Player"
                className={`w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {showAnswer && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-4" style={{ color: 'var(--color-text)' }}>
                    <h3 className="text-2xl font-bold">{currentPlayer.name}</h3>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isRevealed ? (
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
                      style={{ 
                        padding: '0.75rem 1rem', 
                        border: 'var(--input-border)', 
                        color: 'var(--input-color)', 
                        background: 'var(--input-background)', 
                        fontSize: 'var(--input-font-size)' 
                      }}
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

              {/* Give Up Button */}
              <div className="text-center">
                <button
                  onClick={handleGiveUp}
                  disabled={isSubmitting}
                  className="font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg"
                  style={{ background: 'var(--chip-neutral-background)', color: 'var(--color-text)' }}
                >
                  Give Up
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              {/* Result Message */}
              <div className="mb-6">
                {lastGuessResult === 'correct' ? (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-success-background)' }}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--chip-success-color)' }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-success-color)' }}>
                      Correct! +1 Point
                    </h3>
                    <p style={{ color: 'var(--chip-success-color)' }}>
                      That was <span className="font-bold">{currentPlayer.name}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-error-background)' }}>
                    <X className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--chip-error-color)' }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-error-color)' }}>
                      {lastGuessResult === 'giveup' ? 'You gave up!' : 'Incorrect!'} -1 Life
                    </h3>
                    <p style={{ color: 'var(--chip-error-color)' }}>
                      That was <span className="font-bold">{currentPlayer.name}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Next Round Button (only if not game over) */}
              {!gameOver && (
                <button
                  onClick={handleNextRound}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Next Player
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};