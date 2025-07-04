import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, X, RotateCcw, Home } from 'lucide-react';
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
  const [guessAttempts, setGuessAttempts] = useState<Array<{ guess: string; isCorrect: boolean; timestamp: number }>>([]);
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [usedPlayerIds, setUsedPlayerIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerManager = PlayerManager.getInstance();

  // Load first player on mount
  useEffect(() => {
    loadNextPlayer();
  }, []);

  // Focus input when round starts
  useEffect(() => {
    if (!isRevealed && !isTransitioning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRevealed, roundNumber, isTransitioning]);

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
      setGuessAttempts([]);
      setShowIncorrectFeedback(false);
      setIsRevealed(false);
      setShowAnswer(false);
      setImageLoading(true);
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
    if (!guess.trim() || isSubmitting || !currentPlayer || isRevealed) {
      return;
    }

    setIsSubmitting(true);
    setShowIncorrectFeedback(false);

    const isCorrect = isCorrectGuess(guess.trim(), currentPlayer.name);
    
    // Add to attempts history
    const newAttempt = {
      guess: guess.trim(),
      isCorrect,
      timestamp: Date.now()
    };
    setGuessAttempts(prev => [...prev, newAttempt]);

    if (isCorrect) {
      // Correct guess - update score and reveal
      setScore(prev => prev + 1);
      setIsRevealed(true);
      setShowAnswer(true);
      setGuess('');
    } else {
      // Incorrect guess - show feedback and allow retry
      setShowIncorrectFeedback(true);
      setGuess('');
      
      // Hide feedback after 3 seconds
      setTimeout(() => {
        setShowIncorrectFeedback(false);
      }, 3000);
    }

    setIsSubmitting(false);
  };

  const handleGiveUp = () => {
    setIsRevealed(true);
    setShowAnswer(true);
  };

  const handleNextRound = () => {
    setIsTransitioning(true);
    setRoundNumber(prev => prev + 1);
    
    // Small delay to show transition state
    setTimeout(() => {
      loadNextPlayer();
    }, 500);
  };

  const handleRestart = () => {
    setScore(0);
    setRoundNumber(1);
    setUsedPlayerIds([]);
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
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{score}</div>
            <div className="text-sm" style={{ color: 'var(--subheader-color)' }}>Score</div>
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
                      className={`flex-1 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500 text-sm ${
                        showIncorrectFeedback ? 'border-red-500 bg-red-50' : ''
                      }`}
                      style={{ 
                        padding: '0.75rem 1rem', 
                        border: showIncorrectFeedback ? '2px solid #EF4444' : 'var(--input-border)', 
                        color: 'var(--input-color)', 
                        background: showIncorrectFeedback ? '#FEF2F2' : 'var(--input-background)', 
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
                  
                  {/* Incorrect Feedback */}
                  {showIncorrectFeedback && (
                    <div className="mt-3 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Incorrect guess! Try again.</span>
                    </div>
                  )}
                </div>
              </form>

              {/* Previous Attempts */}
              {guessAttempts.length > 0 && (
                <div className="mb-6 max-w-md mx-auto">
                  <h4 className="text-sm font-medium mb-2 text-center" style={{ color: 'var(--subheader-color)' }}>
                    Your attempts:
                  </h4>
                  <div className="space-y-2">
                    {guessAttempts.slice(-3).map((attempt, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          attempt.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <span className={attempt.isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {attempt.guess}
                        </span>
                        {attempt.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                {guessAttempts.some(a => a.isCorrect) ? (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-success-background)' }}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--chip-success-color)' }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-success-color)' }}>
                      Correct!
                    </h3>
                    <p style={{ color: 'var(--chip-success-color)' }}>
                      That was <span className="font-bold">{currentPlayer.name}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl p-6" style={{ background: 'var(--chip-error-background)' }}>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--chip-error-color)' }}>
                      That was {currentPlayer.name}
                    </h3>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleNextRound}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Next Player
                </button>

                <button
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  Restart
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
          )}
        </div>
      </div>
    </div>
  );
};