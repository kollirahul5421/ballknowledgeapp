import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, AlertCircle, CheckCircle, ExternalLink, Home } from 'lucide-react';
import { Player, CreatePlayerRequest, UpdatePlayerRequest, DECADES } from '../types/player';
import { PlayerManager } from '../utils/playerManager';

interface AdminPageProps {
  onBackToHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    imageUrl: '',
    primaryDecade: '2020s' as string
  });

  const playerManager = PlayerManager.getInstance();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const playersData = await playerManager.getAllPlayers();
      setPlayers(playersData);
    } catch (error) {
      setError('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.team.trim() || !formData.imageUrl.trim() || !formData.primaryDecade) {
      showMessage('All fields are required', true);
      return;
    }

    try {
      const newPlayer = await playerManager.createPlayer(formData as CreatePlayerRequest);
      if (newPlayer) {
        setPlayers(prev => [newPlayer, ...prev]);
        setFormData({ name: '', team: '', imageUrl: '', primaryDecade: '2020s' });
        setShowAddForm(false);
        showMessage('Player added successfully!');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to add player', true);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !formData.name.trim() || !formData.team.trim() || !formData.imageUrl.trim() || !formData.primaryDecade) {
      showMessage('All fields are required', true);
      return;
    }

    try {
      const updatedPlayer = await playerManager.updatePlayer({
        id: editingPlayer.id,
        ...formData
      } as UpdatePlayerRequest);
      
      if (updatedPlayer) {
        setPlayers(prev => prev.map(p => p.id === editingPlayer.id ? updatedPlayer : p));
        setEditingPlayer(null);
        setFormData({ name: '', team: '', imageUrl: '', primaryDecade: '2020s' });
        showMessage('Player updated successfully!');
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update player', true);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      const success = await playerManager.deletePlayer(playerId);
      if (success) {
        setPlayers(prev => prev.filter(p => p.id !== playerId));
        showMessage('Player deleted successfully!');
      } else {
        showMessage('Failed to delete player', true);
      }
    } catch (error) {
      showMessage('Failed to delete player', true);
    }
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      team: player.team,
      imageUrl: player.imageUrl,
      primaryDecade: player.primaryDecade
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
    setFormData({ name: '', team: '', imageUrl: '', primaryDecade: '2020s' });
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingPlayer(null);
    setFormData({ name: '', team: '', imageUrl: '', primaryDecade: '2020s' });
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormData({ name: '', team: '', imageUrl: '', primaryDecade: '2020s' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToHome}
            className="text-purple-200 hover:text-white transition-colors flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Game</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Player Management</h1>
            <p className="text-purple-200">Manage NBA players for the guessing game</p>
          </div>
          
          <div className="flex items-center space-x-2 text-purple-200">
            <Users className="w-5 h-5" />
            <span>{players.length} Players</span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-xl border border-green-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add Player Button */}
        {!showAddForm && !editingPlayer && (
          <div className="mb-6">
            <button
              onClick={startAdd}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Player</span>
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingPlayer) && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h2>
              <button
                onClick={editingPlayer ? cancelEdit : cancelAdd}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., LeBron James"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team *
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                    placeholder="e.g., Los Angeles Lakers"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Decade *
                </label>
                <select
                  value={formData.primaryDecade}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryDecade: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                >
                  {DECADES.map(decade => (
                    <option key={decade} value={decade}>
                      {decade} Era
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the decade when this player was most prominent
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/player-image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingPlayer ? 'Update Player' : 'Add Player'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={editingPlayer ? cancelEdit : cancelAdd}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Players Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Players ({players.length})</h2>
          </div>

          {players.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No players yet</h3>
              <p className="text-gray-500 mb-6">Add your first NBA player to get started</p>
              <button
                onClick={startAdd}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Player</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Team</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Decade</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Added</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={player.imageUrl}
                            alt={player.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400";
                            }}
                          />
                          <a
                            href={player.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{player.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{player.team}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {player.primaryDecade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(player.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(player)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit player"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete player"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};