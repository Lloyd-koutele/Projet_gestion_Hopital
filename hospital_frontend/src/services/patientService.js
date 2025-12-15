import api from './api';

/**
 * Service pour la gestion des patients
 * Fournit des fonctions pour créer, récupérer, mettre à jour et supprimer des patients
 */

// Configuration des préfixes API
const API_PREFIX_MEDECIN = '/api/medecin';
const API_PREFIX_ADMIN = '/api/admin';
const API_PREFIX_PATIENT = '/api/patient';

// Gestion centralisée des erreurs
const handleError = (error, contextMessage = 'Erreur inattendue') => {
  console.error(`${contextMessage}:`, error.response?.data || error.message);
  console.error('Status code:', error.response?.status);
  console.error('Headers:', error.response?.headers);

  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (message) throw new Error(message);

  switch (status) {
    case 400:
      throw new Error('Champs invalides ou manquants.');
    case 401:
      throw new Error('Non autorisé. Veuillez vous reconnecter.');
    case 403:
      throw new Error('Accès refusé.');
    case 404:
      throw new Error('Patient non trouvé.');
    default:
      throw new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
  }
};

/**
 * Cache pour les patients
 * Permet d'optimiser les requêtes et réduire les appels API
 */
const patientsCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
  isValid() {
    return this.data && (Date.now() - this.timestamp < this.ttl);
  },
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  }
};

/**
 * Invalide le cache des patients
 * À appeler après création/modification/suppression
 */
export const invalidatePatientsCache = () => {
  patientsCache.invalidate();
};

/**
 * Création d'un nouveau patient
 * @param {Object} patientData - Données du patient à créer
 * @returns {Promise<Object>} - Patient créé
 */
export const createPatient = async (patientData) => {
  try {
    // Vérification des champs obligatoires selon le DTO du backend
    const requiredFields = [
      'nom', 'prenom', 'dateNaissance', 'email', 'telephone', 
      'sexe', 'poids', 'taille', 'groupeSanguin', 'contexte', 'password'
    ];
    
    for (const field of requiredFields) {
      if (!patientData[field] && patientData[field] !== 0) {
        throw new Error(`Le champ ${field} est obligatoire.`);
      }
    }

    // Formatage de la date si nécessaire
    if (patientData.dateNaissance instanceof Date) {
      patientData.dateNaissance = patientData.dateNaissance.toISOString().split('T')[0];
    }

    // Convertir les champs numériques en chaînes si nécessaire (le backend attend des chaînes)
    if (typeof patientData.poids !== 'string') {
      patientData.poids = String(patientData.poids);
    }
    
    if (typeof patientData.taille !== 'string') {
      patientData.taille = String(patientData.taille);
    }

    // Construire l'objet à envoyer au backend selon le DTO
    const patientToCreate = {
      nom: patientData.nom,
      prenom: patientData.prenom,
      email: patientData.email,
      dateNaissance: patientData.dateNaissance,
      telephone: patientData.telephone,
      sexe: patientData.sexe,
      poids: patientData.poids,
      taille: patientData.taille,
      groupeSanguin: patientData.groupeSanguin,
      contexte: patientData.contexte,
      password: patientData.password
    };

    const response = await api.post(`${API_PREFIX_MEDECIN}/create-patient`, patientToCreate);
    
    // Invalider le cache après création
    invalidatePatientsCache();
    
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la création du patient');
  }
};

/**
 * Récupération de tous les patients
 * @returns {Promise<Array>} - Liste de patients
 */
export const getAllPatients = async () => {
  try {
    // Utiliser le cache si valide
    if (patientsCache.isValid()) {
      console.log('Utilisation du cache pour les patients');
      return patientsCache.data;
    }

    const response = await api.get(`${API_PREFIX_MEDECIN}/patients`);
    
    // Mise en cache des données
    patientsCache.set(response.data);
    
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des patients');
  }
};

/**
 * Récupération d'un patient par son ID
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>} - Données du patient
 */
export const getPatientById = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    // Vérifier si le patient est dans le cache
    if (patientsCache.isValid()) {
      const cachedPatient = patientsCache.data.find(p => p.id === parseInt(patientId));
      if (cachedPatient) {
        console.log('Patient trouvé dans le cache:', patientId);
        return cachedPatient;
      }
    }

    // Comme il n'y a pas d'endpoint spécifique pour récupérer un patient par ID,
    // récupérer tous les patients et filtrer
    const allPatients = await getAllPatients();
    const patient = allPatients.find(p => p.id === parseInt(patientId));
    
    if (!patient) {
      throw new Error(`Patient avec ID ${patientId} non trouvé`);
    }
    
    return patient;
  } catch (error) {
    handleError(error, `Erreur lors de la récupération du patient ${patientId}`);
  }
};

/**
 * Mise à jour d'un patient
 * @param {number} patientId - ID du patient
 * @param {Object} patientData - Nouvelles données du patient
 * @returns {Promise<Object>} - Patient mis à jour
 */
export const updatePatient = async (patientId, patientData) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    // Formatage de la date si nécessaire
    if (patientData.dateNaissance instanceof Date) {
      patientData.dateNaissance = patientData.dateNaissance.toISOString().split('T')[0];
    }

    const response = await api.put(`${API_PREFIX_MEDECIN}/patients/${patientId}`, patientData);
    
    // Invalider le cache après modification
    invalidatePatientsCache();
    
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la mise à jour du patient ${patientId}`);
  }
};

/**
 * Suppression d'un patient
 * @param {number} patientId - ID du patient à supprimer
 * @returns {Promise<Object>} - Confirmation de suppression
 */
export const deletePatient = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    const response = await api.delete(`${API_PREFIX_ADMIN}/patients/${patientId}`);
    
    // Invalider le cache après suppression
    invalidatePatientsCache();
    
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la suppression du patient ${patientId}`);
  }
};

/**
 * Recherche de patients
 * @param {string} searchTerm - Terme de recherche
 * @param {Object} options - Options de recherche
 * @returns {Promise<Array>} - Résultats de recherche
 */
export const searchPatients = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const params = {
      term: searchTerm,
      ...options
    };

    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/search`, { params });
    return response.data;
  } catch (error) {
    // En cas d'erreur 404, retourner un tableau vide
    if (error.response?.status === 404) {
      return [];
    }
    handleError(error, 'Erreur lors de la recherche de patients');
  }
};

/**
 * Récupération du dossier médical d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>} - Dossier médical
 */
export const getPatientDossierMedical = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/${patientId}/dossier-medical`);
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la récupération du dossier médical du patient ${patientId}`);
  }
};

/**
 * Vérification de l'existence d'un patient par email
 * @param {string} email - Email à vérifier
 * @returns {Promise<boolean>} - True si le patient existe
 */
export const checkPatientExists = async (email) => {
  try {
    if (!email || email.trim() === '') {
      throw new Error('Email requis');
    }

    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/check-email?email=${encodeURIComponent(email)}`);
    return response.data.exists;
  } catch (error) {
    // Si erreur 404, retourner false (patient n'existe pas)
    if (error.response?.status === 404) {
      return false;
    }
    handleError(error, `Erreur lors de la vérification de l'email ${email}`);
  }
};

/**
 * Obtention des statistiques d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>} - Statistiques du patient
 */
export const getPatientStats = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/${patientId}/stats`);
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la récupération des statistiques du patient ${patientId}`);
  }
};

/**
 * Mise à jour du statut actif/inactif d'un patient
 * @param {number} patientId - ID du patient
 * @param {boolean} active - Nouveau statut
 * @returns {Promise<Object>} - Patient mis à jour
 */
export const updatePatientStatus = async (patientId, active) => {
  try {
    if (!patientId) {
      throw new Error('ID du patient requis');
    }

    const response = await api.patch(`${API_PREFIX_ADMIN}/patients/${patientId}/status`, { active });
    
    // Invalider le cache après modification
    invalidatePatientsCache();
    
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la mise à jour du statut du patient ${patientId}`);
  }
};

/**
 * Récupération du profil du patient connecté (pour l'interface patient)
 * @returns {Promise<Object>} - Profil du patient
 */
export const getMyProfile = async () => {
  try {
    // Utiliser l'endpoint racine du contrôleur Patient qui vérifie l'authentification
    // et renvoie les informations de base du patient
    const response = await api.get(`${API_PREFIX_PATIENT}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération de votre profil');
  }
};

/**
 * Mise à jour du profil du patient connecté (pour l'interface patient)
 * @param {Object} profileData - Nouvelles données du profil
 * @returns {Promise<Object>} - Profil mis à jour
 */
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put(`${API_PREFIX_PATIENT}/profile`, profileData);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la mise à jour de votre profil');
  }
};
