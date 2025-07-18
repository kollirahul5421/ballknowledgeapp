import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { CreateGame } from './components/CreateGame';
import { JoinGame } from './components/JoinGame';
import { RoomLobby } from './components/RoomLobby';
import { GameScreen } from './components/GameScreen';
import { AdminPage } from './components/AdminPage';
import { SinglePlayerGame } from './components/SinglePlayerGame';
import { SupabaseRoomManager } from './utils/supabaseRoomManager';
import { useSupabaseRoomPolling } from './hooks/useSupabaseRoomPolling';
import { GameState, Room, GameMode, MAX_PLAYERS, Decade } from './types/game';
import { useLocation } from 'react-router-dom';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentView: 'home',
    playerName: ''
  });
  const [joinError, setJoinError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState<string>('');

  const roomManager = SupabaseRoomManager.getInstance();
  const location = window.location;
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminQuery = urlParams.get('admin') === 'true';

  // Simple password protection for admin page
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem('adminAuthed') === 'true');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (!isAdminQuery) {
      setAdminAuthed(false);
      sessionStorage.removeItem('adminAuthed');
    }
  }, [isAdminQuery]);

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
      // If game started, move to 'game'
      if ((prev.currentView === 'create' || prev.currentView === 'lobby') && updatedRoom.status === 'playing') {
        return {
          ...prev,
          currentView: 'game',
          room: updatedRoom
        };
      }
      // If game resets, back to 'lobby'
      if (prev.currentView === 'game' && updatedRoom.status === 'lobby') {
        return {
          ...prev,
          currentView: 'lobby',
          room: updatedRoom
        };
      }
      // If there are 2 or more players and status is 'lobby', move to 'lobby' view
      if (updatedRoom.status === 'lobby' && updatedRoom.players.length >= 2) {
        return {
          ...prev,
          currentView: 'lobby',
          room: updatedRoom
        };
      }
      // If less than 2 players, keep in 'create' view
      if (updatedRoom.players.length < 2 && updatedRoom.status === 'waiting') {
        return {
          ...prev,
          currentView: 'create',
          room: updatedRoom
        };
      }
      // For all other cases, just update the room data
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

  const handleCreateGame = async (decades: Decade[] | 'all', playerName?: string) => {
    setIsLoading(true);
    try {
      const nameToUse = playerName || gameState.playerName;
      const roomCode = await roomManager.generateRoomCode();
      const result = await roomManager.createRoom(roomCode, nameToUse, decades);
      
      if (result) {
        // Update URL to show room path for easy sharing
        window.history.pushState({}, document.title, `/room/${roomCode}`);
        
        setGameState({
          currentView: 'create',
          playerName: nameToUse,
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

  const handleJoinGame = (playerName?: string) => {
    setJoinError('');
    setGameState(prev => ({
      ...prev,
      playerName: playerName || prev.playerName,
      currentView: 'join'
    }));
  };

  const handleSinglePlayer = (decades: Decade[] | 'all', playerName?: string) => {
    const nameToUse = playerName || gameState.playerName;
    setGameState({
      currentView: 'single-player',
      playerName: nameToUse,
      singlePlayerDecades: decades
    });
  };

  const handleJoinRoom = async (roomCode: string, playerName?: string) => {
    setIsLoading(true);
    try {
      const nameToUse = playerName || gameState.playerName;
      const result = await roomManager.joinRoom(roomCode, nameToUse);
      
      if ('error' in result) {
        switch (result.error) {
          case 'not_found':
            setJoinError('Room not found. Please check the code and try again.');
            break;
          case 'full':
            setJoinError(`Room is full (maximum ${MAX_PLAYERS} players). Please try another room.`);
            break;
          case 'already_started':
            setJoinError('This game has already started. Please join a different room.');
            break;
          case 'unknown':
          default:
            setJoinError('Failed to join room. Please try again.');
            break;
        }
        return;
      }

      // Update URL to show room path
      window.history.pushState({}, document.title, `/room/${roomCode}`);

      // Determine the view based on room status and player count
      let targetView: 'create' | 'lobby' | 'game';
      if (result.room.status === 'playing') {
        targetView = 'game';
      } else if (result.room.status === 'lobby' || result.room.players.length >= 2) {
        targetView = 'lobby';
      } else {
        targetView = 'create';
      }

      setGameState({
        currentView: targetView,
        playerName: nameToUse,
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
      <div className="min-h-screen bg-dot flex items-center justify-center p-4" style={{ background: 'var(--color-background)' }}>
        <div className="text-center" style={{ color: 'var(--color-text)' }}>
          <div
            className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p>Setting up your game...</p>
        </div>
      </div>
    );
  }

  // Render current view
  if (isAdminQuery && !adminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dot p-4" style={{ background: 'var(--color-background)' }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (adminPassword === 'kamathkolli123') {
              setAdminAuthed(true);
              sessionStorage.setItem('adminAuthed', 'true');
              setAdminError('');
            } else {
              setAdminError('Incorrect password.');
            }
          }}
          className="bg-black border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-xs text-center"
        >
          <h2 className="mb-4 text-xl font-bold text-white">Admin Access</h2>
          <input
            type="password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full mb-3 rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 mt-2 transition-all"
          >
            Enter
          </button>
          {adminError && <div className="mt-3 text-red-400 text-sm">{adminError}</div>}
        </form>
      </div>
    );
  }
  if (isAdminQuery && adminAuthed) {
    return <AdminPage onBackToHome={() => { sessionStorage.removeItem('adminAuthed'); window.location.href = '/'; }} />;
  }
  switch (gameState.currentView) {
    case 'admin':
      return <AdminPage onBackToHome={handleBackFromAdmin} />;

    case 'single-player':
      return (
        <SinglePlayerGame
          onBackToHome={handleBackToHome}
          decades={gameState.singlePlayerDecades || 'all'}
        />
      );

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
          onSinglePlayer={handleSinglePlayer}
          onShowAdmin={handleShowAdmin}
          isLoading={isLoading}
        />
      );
  }
}

export default App;