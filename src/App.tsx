import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { CreateGame } from './components/CreateGame';
import { JoinGame } from './components/JoinGame';
import { RoomLobby } from './components/RoomLobby';
import { GameScreen } from './components/GameScreen';
import { AdminPage } from './components/AdminPage';
import { SupabaseRoomManager } from './utils/supabaseRoomManager';
import { useSupabaseRoomPolling } from './hooks/useSupabaseRoomPolling';
import { GameState, Room, GameMode } from './types/game';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentView: 'home',
    playerName: ''
  });
  const [joinError, setJoinError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState<string>('');

  const roomManager = SupabaseRoomManager.getInstance();

  // Check for room code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    // Check for direct room link format: /room/ABCDE
    const pathMatch = window.location.pathname.match(/^\/room\/([A-Z0-9]{5})$/i);
    const roomCodeFromPath = pathMatch ? pathMatch[1].toUpperCase() : null;
    
    const roomCode = joinCode || roomCodeFromPath;
    
    if (roomCode) {
      setPrefilledRoomCode(roomCode);
      setGameState(prev => ({ ...prev, currentView: 'join' }));
      
      // Clear URL parameter but keep the room path for sharing
      if (joinCode) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Room polling for real-time updates
  const handleRoomUpdate = useCallback((updatedRoom: Room | null) => {
    if (!updatedRoom) {
      // Room expired or deleted
      if (gameState.currentView !== 'home') {
        setGameState({
          currentView: 'home',
          playerName: gameState.playerName
        });
        setJoinError('Room has expired or been deleted');
      }
      return;
    }

    setGameState(prev => {
      if (prev.currentView === 'create' && updatedRoom.status === 'lobby') {
        // Another player joined
        return {
          ...prev,
          currentView: 'lobby',
          room: updatedRoom
        };
      }
      
      if (prev.currentView === 'lobby' && updatedRoom.status === 'playing') {
        // Game started
        return {
          ...prev,
          currentView: 'game',
          room: updatedRoom
        };
      }

      if (prev.currentView === 'game' && updatedRoom.status === 'lobby') {
        // Game reset, back to lobby
        return {
          ...prev,
          currentView: 'lobby',
          room: updatedRoom
        };
      }
      
      return {
        ...prev,
        room: updatedRoom
      };
    });
  }, [gameState.currentView, gameState.playerName]);

  const { stopPolling } = useSupabaseRoomPolling(
    gameState.roomCode,
    handleRoomUpdate,
    2000
  );

  const handleCreateGame = async (gameMode: GameMode = 'all') => {
    setIsLoading(true);
    try {
      const roomCode = await roomManager.generateRoomCode();
      const result = await roomManager.createRoom(roomCode, gameState.playerName, gameMode);
      
      if (result) {
        // Update URL to show room path for easy sharing
        window.history.pushState({}, document.title, `/room/${roomCode}`);
        
        setGameState({
          currentView: 'create',
          playerName: gameState.playerName,
          playerId: result.playerId,
          roomCode,
          room: result.room
        });
      } else {
        setJoinError('Failed to create room. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setJoinError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = () => {
    setJoinError('');
    setGameState(prev => ({
      ...prev,
      currentView: 'join'
    }));
  };

  const handleJoinRoom = async (roomCode: string) => {
    setIsLoading(true);
    try {
      const result = await roomManager.joinRoom(roomCode, gameState.playerName);
      
      if (!result) {
        setJoinError('Room not found, full, or already started. Please check the code and try again.');
        return;
      }

      // Update URL to show room path
      window.history.pushState({}, document.title, `/room/${roomCode}`);

      setGameState({
        currentView: result.room.status === 'waiting' ? 'create' : 'lobby',
        playerName: gameState.playerName,
        playerId: result.playerId,
        roomCode,
        room: result.room
      });
      setJoinError('');
    } catch (error) {
      console.error('Error joining room:', error);
      setJoinError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!gameState.room || !gameState.roomCode || !gameState.playerId) return;

    setIsLoading(true);
    try {
      const currentReady = gameState.room.playersReady[gameState.playerId] || false;
      const updatedRoom = await roomManager.updatePlayerReady(
        gameState.roomCode,
        gameState.playerId,
        !currentReady
      );

      if (updatedRoom) {
        setGameState(prev => ({ ...prev, room: updatedRoom }));
      }
    } catch (error) {
      console.error('Error toggling ready:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, currentView: 'game' }));
  };

  const handleBackToHome = async () => {
    stopPolling();
    if (gameState.roomCode && gameState.playerId) {
      await roomManager.updatePlayerConnection(gameState.roomCode, gameState.playerId, false);
    }
    
    // Clear URL back to home
    window.history.pushState({}, document.title, '/');
    
    setGameState({
      currentView: 'home',
      playerName: gameState.playerName
    });
    setJoinError('');
    setPrefilledRoomCode('');
  };

  const handleLeaveRoom = async () => {
    stopPolling();
    if (gameState.roomCode && gameState.playerId) {
      await roomManager.updatePlayerConnection(gameState.roomCode, gameState.playerId, false);
    }
    
    // Clear URL back to home
    window.history.pushState({}, document.title, '/');
    
    setGameState({
      currentView: 'home',
      playerName: gameState.playerName
    });
    setJoinError('');
    setPrefilledRoomCode('');
  };

  const handleLeaveGame = () => {
    handleLeaveRoom();
  };

  const handleRoomUpdateFromGame = (updatedRoom: Room) => {
    setGameState(prev => ({ ...prev, room: updatedRoom }));
  };

  const handleShowAdmin = () => {
    setGameState(prev => ({ ...prev, currentView: 'admin' }));
  };

  const handleBackFromAdmin = () => {
    setGameState(prev => ({ ...prev, currentView: 'home' }));
  };

  // Show loading state for async operations
  if (isLoading && gameState.currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Setting up your game...</p>
        </div>
      </div>
    );
  }

  // Render current view
  switch (gameState.currentView) {
    case 'admin':
      return <AdminPage onBackToHome={handleBackFromAdmin} />;

    case 'create':
      return gameState.room ? (
        <CreateGame
          room={gameState.room}
          playerId={gameState.playerId!}
          onBack={handleBackToHome}
          onRoomUpdate={(room) => setGameState(prev => ({ ...prev, room }))}
        />
      ) : null;

    case 'join':
      return (
        <JoinGame
          onBack={handleBackToHome}
          onJoinRoom={handleJoinRoom}
          error={joinError}
          isLoading={isLoading}
          prefilledRoomCode={prefilledRoomCode}
          playerName={gameState.playerName}
          setPlayerName={(name) => setGameState(prev => ({ ...prev, playerName: name }))}
        />
      );

    case 'lobby':
      return gameState.room ? (
        <RoomLobby
          room={gameState.room}
          playerId={gameState.playerId!}
          playerName={gameState.playerName}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          isLoading={isLoading}
        />
      ) : null;

    case 'game':
      return gameState.room ? (
        <GameScreen
          room={gameState.room}
          playerId={gameState.playerId!}
          onLeaveGame={handleLeaveGame}
          onRoomUpdate={handleRoomUpdateFromGame}
        />
      ) : null;

    default:
      return (
        <HomePage
          playerName={gameState.playerName}
          setPlayerName={(name) => setGameState(prev => ({ ...prev, playerName: name }))}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onShowAdmin={handleShowAdmin}
          isLoading={isLoading}
        />
      );
  }
}

export default App;