import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/adminService';

function Admin({ onSuccess }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      console.log('Réponse de getUsers:', response);
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError('Format de réponse inattendu');
      }
      setError(null);
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers
  };
}

export default Admin;