import React from 'react';

const UserList = ({ users, onUserAction, actionInProgress }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#4299e1';
      case 'MEDECIN':
        return '#48bb78';
      case 'CHERCHEUR':
        return '#ed8936';
      default:
        return '#718096';
    }
  };

  return (
    <div className="user-list">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.nom}</td>
              <td>{user.prenom}</td>
              <td>{user.email}</td>
              <td>{user.telephone}</td>
              <td>
                <span
                  className="role-badge"
                  style={{
                    backgroundColor: getRoleBadgeColor(user.role),
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`status-badge ${user.actif ? 'active' : 'inactive'}`}>
                  {user.actif ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td>
                <button
                  className="action-button"
                  onClick={() => onUserAction(user.id)}
                  disabled={actionInProgress}
                >
                  {user.actif ? 'Désactiver' : 'Activer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
