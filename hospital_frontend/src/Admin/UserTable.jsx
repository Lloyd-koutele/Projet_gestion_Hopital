import React, {memo} from 'react';
import UserTable from '../style/UserTable.css';

const UserTable = memo(({ users, onAction, actionInProgress }) => {

  // Mapping direct des rôles aux labels
  const normalizeRole = (role) => {
    if (!role || typeof role !== 'string') return '';
    return role
      .normalize('NFD')               // Sépare les accents
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .toUpperCase()
      .trim();
  };
    const getRoleLabel = (role) =>{
        const normalized = normalizeRole(role);
        switch (normalized) {
            case 'ADMIN':
                return 'Administrateur';
            case 'MEDECIN':
                return 'Médecin';
            case 'INFIRMIER':
                return 'Infirmier';
            case 'PATIENT':
                return 'Patient';
            default:
                return normalized;
        }   
    }

    const getStatusLabel = (actif) =>{
        const normalized = normalizeRole(actif);
        switch (normalized) {
            case 'true':
                return 'Actif';
            case 'false':
                return 'Inactif';
            default:
                return normalized;
        }   
    }

  if(!Array.isAsrray(users) || users.length ===0){
    return(
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
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}" " {user.prenom}</td>
              <td>{user.email}</td>
              <td>{getRoleLabel(user.role)}</td>
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
                >
                  {user.actif === 'true' ? 'Bloquer' : 'Debloquer'}
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