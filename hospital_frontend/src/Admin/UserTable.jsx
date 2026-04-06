import React, { memo } from 'react';
import '../style/UserTable.css';
import '../style/UpdateUser.css';

const UserTable = memo(({ users, onAction, actionInProgress }) => {

  // Mapping direct des rôles aux labels
  const normalizeRole = (role) => {
    if (!role || typeof role !== 'string') return '';
    return role
      .normalize('NFD')               
      .replace(/[\u0300-\u036f]/g, '') 
      .toUpperCase()
      .trim();
  };
  const getRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MEDECIN':
        return 'Médecin';
      case 'CHERCHEUR':
        return 'Chercheur';
      default:
        return normalized;
    }
  }

  const getStatusLabel = (actif) => {
    if (actif === 'true' || actif === true) return 'Actif';
    if (actif === 'false' || actif === false) return 'Inactif';
    return actif;
  };

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className='empty-state'>
        <h3 className='mt-4 text-lg font-medium'>Aucun utilisateur trouvé</h3>
        <p className="mt-1 text-sm">Modifiez vos critères de recherche </p>
      </div>
    );
  }

  return (

    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Téléphone</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.nom} {user.prenom}</td>
              <td>{user.email}</td>
              <td>{getRoleLabel(user.roles)}</td>
              <td>{user.telephone}</td>
              <td>{getStatusLabel(user.actif)}</td>
              <td>
                <button
                  onClick={() => onAction(user.id, 'edit')}
                  disabled={actionInProgress}
                  className="action-button edit"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onAction(user.id, 'block-unblock')}
                  disabled={actionInProgress}
                  className="block-unblock"
                  style={{ backgroundColor: user.actif ? 'green' : 'red', color: 'white' }}
                >
                  {user.actif === true ? 'Active' : 'Bloquer'}
                </button>

                <button
                  onClick={() => onAction(user.id, 'delete')}
                  disabled={actionInProgress}
                  className="delete-btn"
                >
                  Supprimer
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )

});

export default UserTable;