import React, { useState, useEffect } from 'react';
import { getAllUsers, getUsersByRole, getInactiveUsers, updateUserStatus } from '../services/adminService';
import CreateUser from './CreateUser';
import UserRoleFilter from './common/UserRoleFilter';
import UserTable from './common/UserTable';
import Modal from './common/Modal';
import { searchEntities } from '../utils/searchUtils';
import '../styles/adminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  const fetchUsers = async (role = null) => {
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (role === 'inactive') {
        data = await getInactiveUsers();
      } else if (role && role !== 'all') {
        data = await getUsersByRole(role);
      } else {
        data = await getAllUsers();
      }
      
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs');
      console.error('Erreur:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(selectedTab);
  }, [selectedTab]);
  
  // Filtrer les utilisateurs en fonction du terme de recherche
  useEffect(() => {
    if (users && users.length > 0) {
      if (searchTerm.trim() === '') {
        // Si aucun terme de recherche, on montre les 5 premiers utilisateurs ou tous selon l'état
        setFilteredUsers(showAllUsers ? users : users.slice(0, 5));
      } else {
        // Sinon on filtre avec TF-IDF
        const searchResults = searchEntities(users, searchTerm, {
          fields: ['nom', 'prenom', 'email', 'role', 'telephone'],
          weights: { nom: 2, prenom: 2, email: 1.5, role: 1, telephone: 1 }
        });
        setFilteredUsers(searchResults);
      }
    } else {
      setFilteredUsers([]);
    }
  }, [users, searchTerm, showAllUsers]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchUsers(selectedTab);
  };

  const handleUserAction = async (userId) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(true);
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        setError('Utilisateur non trouvé');
        return;
      }

      await updateUserStatus(userId, !userToUpdate.actif);
      await fetchUsers(selectedTab);
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut de l\'utilisateur');
      console.error('Erreur:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Gestion des Utilisateurs</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="create-button"
        >
          Créer un utilisateur
        </button>
      </div>

      <Modal 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Créer un nouvel utilisateur"
      >
        <CreateUser onSuccess={handleCreateSuccess} />
      </Modal>

      <div className="search-filter-container">
        <UserRoleFilter 
          selectedRole={selectedTab} 
          onRoleChange={setSelectedTab} 
        />
        
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, rôle..."
            className="search-input"
          />
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="toggle-button"
          >
            {showAllUsers ? 'Afficher 5' : 'Afficher tous'}
          </button>
        </div>
      </div>
      
      {/* Information sur le nombre d'utilisateurs */}
      {users.length > 0 && (
        <div className="stats-container">
          <span className="stats-badge">📊</span> Affichage de {filteredUsers.length} utilisateur(s) sur un total de {users.length}
          {searchTerm && <span className="stats-badge"> - Recherche: "{searchTerm}"</span>}
        </div>
      )}

      {error && (
        <div className="error-message">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Chargement...</span>
        </div>
      ) : filteredUsers.length === 0 && users.length > 0 ? (
        <div className="no-results">
          <p className="no-results-title">Aucun résultat</p>
          <p className="no-results-message">Aucun utilisateur ne correspond à votre recherche. Essayez d'autres termes.</p>
        </div>
      ) : (
        <div className="users-container">
          <UserTable 
            users={filteredUsers} 
            onAction={handleUserAction}
            actionInProgress={actionInProgress}
          />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
