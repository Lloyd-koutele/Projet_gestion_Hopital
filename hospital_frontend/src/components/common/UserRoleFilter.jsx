import React from 'react';

const UserRoleFilter = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { value: 'all', label: 'Tous' },
    { value: 'ADMIN', label: 'Administrateurs' },
    { value: 'MEDECIN', label: 'Médecins' },
    { value: 'CHERCHEUR', label: 'Chercheurs' }
  ];

  return (
    <div className="role-filter-container">
      {roles.map(role => (
        <button
          key={role.value}
          className={`role-filter-button ${selectedRole === role.value ? 'active' : ''}`}
          onClick={() => onRoleChange(role.value)}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
};

export default UserRoleFilter;
