import React, { useState, useEffect } from 'react';
import { getPatients } from '../services/medecinService';
import { isAuthenticated } from '../auth/authService';

function Medecin({ onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    if (!isAuthenticated()) {
      setError('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getPatients();
      console.log('Réponse de getPatients:', response);
      if (Array.isArray(response)) {
        setPatients(response);
      } else if (response && Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        setPatients([]);
        setError('Format de réponse inattendu');
      }
      setError(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Erreur lors de la récupération des patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userRole) {
      setError('Veuillez vous connecter pour accéder à cette page.');
      setLoading(false);
      return;
    }

    // On ne fait pas d'appel initial automatique pour éviter les requêtes multiples
    // fetchPatients sera appelé explicitement par MedecinDashboard quand nécessaire
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients
  };
}

export default Medecin;
