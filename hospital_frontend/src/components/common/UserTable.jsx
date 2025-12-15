import React, { memo } from 'react';

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
  
  const getRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    return {
      'ADMIN': 'Administrateur',
      'MEDECIN': 'Médecin',
      'CHERCHEUR': 'Chercheur'
    }[normalized] || role;
  };
  
  const getRoleColor = (role) => {
    const normalized = normalizeRole(role);
    return {
      'ADMIN': '#3b82f6',
      'MEDECIN': '#10b981',
      'CHERCHEUR': '#f59e0b'
    }[normalized] || '#6b7280';
  };
  


  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="mt-4 text-lg font-medium">Aucun utilisateur trouvé</h3>
        <p className="mt-1 text-sm">Modifiez vos critères de recherche ou ajoutez de nouveaux utilisateurs.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Contact</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={!user.actif ? 'blocked' : ''}>
              <td>
                <div className="flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {user.nom.charAt(0)}{user.prenom.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.nom} {user.prenom}</div>
                    <div className="text-sm text-gray-500">{user.id}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div className="text-sm">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.telephone}</div>
                </div>
              </td>
              <td>
                <span style={{
                  backgroundColor: getRoleColor(user.role),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {getRoleLabel(user.role)}
                </span>
              </td>
              <td>
                <span className={`status-badge ${user.actif ? 'active' : 'inactive'}`}>
                  {user.actif ? 'Actif' : 'Bloqué'}
                </span>
              </td>
              <td>
                <button
                  className={`action-button ${user.actif ? 'block' : 'unblock'}`}
                  onClick={() => !actionInProgress && onAction(user.id)}
                  disabled={actionInProgress}
                >
                  {actionInProgress ? (
                    <>
                      <span className="loading-spinner w-4 h-4"></span>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      {user.actif ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Bloquer</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span>Débloquer</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

UserTable.displayName = 'UserTable';

export default UserTable;
