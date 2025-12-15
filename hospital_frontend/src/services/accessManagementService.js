import api from './api';

/**
 * Service unifié pour la gestion des autorisations d'accès aux dossiers médicaux
 * Utilisable à la fois par les médecins et les patients
 */

// Définition des préfixes d'API
const API_PREFIX_MEDECIN = '/api/medecin';
const API_PREFIX_PATIENT = '/api/patient';
const API_PREFIX_AUTORISATIONS = '/api/autorisations';

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
      throw new Error('Ressource non trouvée.');
    default:
      throw new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
  }
};

/**
 * Recherche un médecin par différents critères (email, nom, téléphone, numéro d'ordre)
 * @param {string} term - Terme de recherche
 * @param {Array<string>} fields - Champs de recherche (email, nom, prenom, telephone, numeroOrdre)
 * @returns {Promise<Array<Object>>} - Liste des médecins correspondants
 */
export const rechercherMedecin = async (term, fields = ['email', 'nom', 'prenom', 'telephone', 'numeroOrdre']) => {
  try {
    if (!term || term.trim() === '') {
      return [];
    }
    
    // Importer la fonction de recherche avec cache
    const { rechercherMedecinsWithCache } = await import('./medecinService');
    
    // Utiliser la fonction de recherche avec cache
    const medecins = await rechercherMedecinsWithCache(term, { fields });
    return medecins;
  } catch (error) {
    // En cas d'erreur 404, retourner un tableau vide
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Erreur lors de la recherche de médecins:', error);
    throw new Error(`Erreur lors de la recherche de médecins: ${error.message}`);
  }
};

/**
 * Recherche un médecin par son email
 * @param {string} email - Email du médecin à rechercher
 * @returns {Promise<Object>} - Informations du médecin trouvé (avec son ID)
 * @deprecated Utilisez rechercherMedecin à la place
 */
export const rechercherMedecinParEmail = async (email) => {
  try {
    if (!email || email.trim() === '') {
      throw new Error('Email du médecin requis');
    }
    
    // Utiliser la fonction plus générale
    const medecins = await rechercherMedecin(email, ['email']);
    
    // Vérifier qu'un médecin a été trouvé
    if (!medecins || medecins.length === 0) {
      throw new Error(`Aucun médecin trouvé avec l'email ${email}`);
    }
    
    // Retourner le premier médecin trouvé
    return medecins[0];
  } catch (error) {
    // Si l'email n'existe pas (404), on retourne une erreur explicite
    if (error.response?.status === 404) {
      throw new Error(`Aucun médecin trouvé avec l'email ${email}`);
    }
    handleError(error, 'Erreur lors de la recherche du médecin');
  }
};

/**
 * Convertit une chaîne de niveau d'accès en une valeur d'énumération pour le backend
 * @param {string} niveauAccesString - Niveau d'accès sous forme de chaîne
 * @returns {string} - Valeur d'énumération pour le backend
 */
export const convertirNiveauAcces = (niveauAccesString) => {
  switch (niveauAccesString.toUpperCase()) {
    case 'LECTURE':
    case 'LECTURE_SEULE':
      return 'LECTURE_SEULE';
    case 'ECRITURE':
    case 'MODIFICATION':
      return 'MODIFICATION';
    case 'COMPLET':
    case 'ADMINISTRATEUR':
    case 'ADMIN':
      return 'COMPLET';
    default:
      return 'LECTURE_SEULE'; // Valeur par défaut la plus restrictive
  }
};

// ==================== FONCTIONNALITÉS COMMUNES ====================

/**
 * Récupère les médecins ayant accès à un patient spécifique
 * @param {number} patientId - ID du patient
 * @returns {Promise<Array>} - Liste des autorisations d'accès
 */
export const getMedecinsAvecAcces = async (patientId) => {
  try {
    // URL correcte selon AutorisationController.java
    const response = await api.get(`${API_PREFIX_AUTORISATIONS}/patients/${patientId}/medecins`);
    console.log('Autorisations récupérées:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de la récupération des autorisations:', error);
    handleError(error, 'Erreur lors de la récupération des autorisations d\'accès');
  }
};

/**
 * Révoque une autorisation d'accès (utilisable par les médecins et les patients)
 * @param {string} autorisationId - ID de l'autorisation à révoquer
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const revoquerAcces = async (autorisationId) => {
  try {
    console.log('Tentative de révocation d\'accès pour l\'autorisation:', autorisationId);
    // Utiliser le préfixe d'API pour les autorisations au lieu du préfixe médecin
    const response = await api.delete(`${API_PREFIX_AUTORISATIONS}/acces/${autorisationId}`);
    console.log('Révocation d\'accès réussie pour:', autorisationId);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de la révocation d\'accès:', error);
    handleError(error, 'Erreur lors de la révocation d\'un accès');
  }
};

// ==================== FONCTIONNALITÉS MÉDECIN ====================

/**
 * Accorde une autorisation d'accès à un médecin pour un patient (par un médecin)
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin à autoriser
 * @param {string} niveauAcces - Niveau d'accès (LECTURE, ECRITURE, COMPLET)
 * @param {string} dateExpiration - Date d'expiration au format ISO (optionnel)
 * @returns {Promise<Object>} - Autorisation créée
 */
export const accorderAccesMedecin = async (patientId, medecinId, niveauAcces, dateExpiration = null) => {
  try {
    // Validation des données
    if (!patientId) {
      throw new Error('ID du patient manquant');
    }
    if (!medecinId) {
      throw new Error('ID du médecin manquant');
    }
    if (!niveauAcces) {
      throw new Error('Niveau d\'accès manquant');
    }

    // Conversion de l'ID médecin en nombre
    const medecinIdNumber = parseInt(medecinId, 10);
    if (isNaN(medecinIdNumber)) {
      throw new Error('ID du médecin invalide: ' + medecinId);
    }

    // Correction du format de la date
    let dateExpirationFormatted = dateExpiration;
    if (dateExpiration && typeof dateExpiration === 'string' && dateExpiration.trim() !== '') {
      // S'assurer que la date est au format ISO
      try {
        dateExpirationFormatted = new Date(dateExpiration).toISOString().split('T')[0];
      } catch (e) {
        console.warn("Erreur lors du formatage de la date:", e);
        // Garder la date originale si le formatage échoue
      }
    } else {
      // Si la date est vide ou null, l'envoyer comme null explicitement
      dateExpirationFormatted = null;
    }
    
    const payload = {
      medecinAutoriseId: medecinIdNumber,
      niveauAcces,
      dateExpiration: dateExpirationFormatted
    };
    
    console.log('Demande d\'autorisation d\'accès avec les données:', payload);
    
    const response = await api.post(`${API_PREFIX_AUTORISATIONS}/patients/${patientId}/accorder`, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse du serveur:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de l\'attribution d\'accès:', error);
    
    if (error.message === 'Network Error') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet ou contactez l\'administrateur.');
    }
    
    handleError(error, 'Erreur lors de l\'attribution d\'un accès');
  }
};

/**
 * Vérifie si un médecin a accès à un patient
 * @param {number} medecinId - ID du médecin
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>} - Informations sur l'accès (accès, niveau, etc.)
 */
export const verifierAccesMedecin = async (medecinId, patientId) => {
  try {
    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/${patientId}/acces/verification?medecinId=${medecinId}`);
    return response.data;
  } catch (error) {
    // En cas d'erreur 403 (accès refusé), on retourne un objet avec accès = false
    if (error.response?.status === 403) {
      return { acces: false };
    }
    handleError(error, 'Erreur lors de la vérification d\'un accès');
  }
};

/**
 * Vérifie si le médecin connecté est le médecin référent d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<boolean>} - true si le médecin connecté est le référent, false sinon
 */
export const verifierSiMedecinReferent = async (patientId) => {
  try {
    const response = await api.get(`${API_PREFIX_MEDECIN}/patients/${patientId}/verification-referent`);
    return response.data.isReferent || false;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de référent:', error);
    return false;
  }
};

/**
 * Récupère tous les patients auxquels un médecin a accès
 * @returns {Promise<Array>} - Liste des patients accessibles
 */
export const getPatientsAccessibles = async () => {
  try {
    const response = await api.get(`${API_PREFIX_AUTORISATIONS}/patients-accessibles`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des patients accessibles');
  }
};

// ==================== FONCTIONNALITÉS PATIENT ====================

/**
 * Récupère les médecins ayant accès au dossier du patient connecté
 * @returns {Promise<Array>} - Liste des médecins avec accès
 */
export const getMesMedecinsAvecAcces = async () => {
  try {
    const response = await api.get(`${API_PREFIX_PATIENT}/mes-acces`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des médecins avec accès');
  }
};

/**
 * Accorde l'accès à un médecin au dossier du patient connecté
 * @param {number} medecinId - ID du médecin
 * @param {Date} dateExpiration - Date d'expiration de l'accès (optionnelle)
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const accorderAccesPatient = async (medecinId, dateExpiration = null) => {
  try {
    // Formater la date d'expiration si nécessaire
    let dateExpirationFormatted = null;
    if (dateExpiration) {
      if (typeof dateExpiration === 'string') {
        dateExpirationFormatted = new Date(dateExpiration).toISOString();
      } else if (dateExpiration instanceof Date) {
        dateExpirationFormatted = dateExpiration.toISOString();
      }
    }
    
    const response = await api.post(`${API_PREFIX_PATIENT}/acces-medecin`, {
      medecinId,
      dateExpiration: dateExpirationFormatted
    });
    
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de l'attribution de l'accès au médecin ${medecinId}`);
  }
};

/**
 * Révoque l'accès d'un médecin au dossier du patient connecté
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const revoquerAccesPatient = async (medecinId) => {
  try {
    const response = await api.delete(`${API_PREFIX_PATIENT}/acces-medecin/${medecinId}`);
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la révocation de l'accès du médecin ${medecinId}`);
  }
};
