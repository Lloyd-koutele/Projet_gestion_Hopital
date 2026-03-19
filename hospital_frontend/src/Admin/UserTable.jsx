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

    const getStatusLabel = (status) =>{
        const normalized = normalizeRole(status);
        switch (normalized) {
            case 'true':
                return 'Actif';
            case 'false':
                return 'Inactif';
            default:
                return normalized;
        }   
    }

    const getRoleColor = (role) => {
    const normalized = normalizeRole(role);
    return {
      'ADMIN': '#3b82f6',
      'MEDECIN': '#10b981',
      'CHERCHEUR': '#f59e0b'
    }[normalized] || '#6b7280';
  };

  if(!Array.isAsrray(users) || users.length ===0){
    return(
        <div className='empty-state'>
            <h3 className='mt-4 text-lg font-medium'>Aucun utilisateur trouvé</h3>
            <p className="mt-1 text-sm">Modifiez vos critères de recherche </p>
        </div>
    );
  }

});

export default UserTable;