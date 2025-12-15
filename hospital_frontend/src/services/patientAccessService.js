import api from './api';

/**
 * Service pour la gestion des autorisations d'accès aux patients
 * Interface avec les fonctionnalités d'autorisation du backend
 */

// Définition des préfixes d'API corrects pour aligner avec le backend
const API_PREFIX_MEDECIN = '/api/medecin';
const API_PREFIX_AUTORISATIONS = '/api/autorisations';

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
    
    // Utiliser la nouvelle fonction plus générale
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
 * Récupère la liste des autorisations d'accès pour un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<Array>} - Liste des autorisations d'accès
 */
export const getAutorisationsPatient = async (patientId) => {
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
 * Accorde une autorisation d'accès à un médecin pour un patient
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin à autoriser
 * @param {string} niveauAcces - Niveau d'accès (LECTURE, ECRITURE, COMPLET)
 * @param {string} dateExpiration - Date d'expiration au format ISO (optionnel)
 * @returns {Promise<Object>} - Autorisation créée
 */
export const accorderAcces = async (patientId, medecinId, niveauAcces, dateExpiration = null) => {
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
      medecinAutoriseId: parseInt(medecinId, 10), // S'assurer que l'ID est un nombre
      niveauAcces,
      dateExpiration: dateExpirationFormatted
    };
    
    console.log('Demande d\'autorisation d\'accès avec les données:', payload);
    console.log('URL de la requête:', `${API_PREFIX_AUTORISATIONS}/patients/${patientId}/accorder`);
    
    // Utiliser un timeout plus long pour les requêtes d'autorisation
    const response = await api.post(`${API_PREFIX_AUTORISATIONS}/patients/${patientId}/accorder`, payload, {
      timeout: 10000, // 10 secondes
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse du serveur:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de l\'attribution d\'accès:', error);
    
    // Gérer spécifiquement les erreurs réseau
    if (error.message === 'Network Error') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet ou contactez l\'administrateur.');
    }
    
    // Pour les autres erreurs, utiliser le handler standard
    handleError(error, 'Erreur lors de l\'attribution d\'un accès');
  }
};

/**
 * Révoque une autorisation d'accès
 * @param {string} autorisationId - ID de l'autorisation à révoquer
 * @returns {Promise<Object>} - Résultat de l'opération
 */ 
export const revoquerAcces = async (autorisationId) => {
  try {
    // URL correcte selon AutorisationController.java
    // On a besoin de patientId et medecinId au lieu de autorisationId
    // Mais comme notre interface front utilise autorisationId, il faut faire une adaptation
    
    // Comme nous n'avons pas l'information patientId et medecinId facilement,
    // nous allons utiliser un endpoint compatible dans le contrôleur
    const response = await api.delete(`${API_PREFIX_MEDECIN}/acces/${autorisationId}`);
    console.log('Révocation d\'accès réussie pour:', autorisationId);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de la révocation d\'accès:', error);
    handleError(error, 'Erreur lors de la révocation d\'un accès');
  }
};

/**
 * Modifie le niveau d'accès d'une autorisation existante
 * @param {string} autorisationId - ID de l'autorisation
 * @param {string} niveauAcces - Nouveau niveau d'accès
 * @param {string} dateExpiration - Nouvelle date d'expiration (optionnel)
 * @returns {Promise<Object>} - Autorisation mise à jour
 */
export const modifierAcces = async (autorisationId, niveauAcces, dateExpiration = null) => {
  try {
    const payload = {
      niveauAcces,
      dateExpiration
    };
    
    console.log(`Modification de l'accès ${autorisationId} avec:`, payload);
    
    // Cette URL doit pointer vers un endpoint de MedecinController qui gère la modification
    const response = await api.put(`${API_PREFIX_MEDECIN}/acces/${autorisationId}`, payload);
    console.log('Modification d\'accès réussie:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur complète lors de la modification d\'accès:', error);
    handleError(error, 'Erreur lors de la modification d\'un accès');
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
 * Récupère tous les patients auxquels un médecin a accès
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Array>} - Liste des patients accessibles
 */
export const getPatientsAccessibles = async (medecinId) => {
  try {
    // URL correcte selon AutorisationController.java
    const response = await api.get(`${API_PREFIX_AUTORISATIONS}/patients-accessibles`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des patients accessibles');
  }
};

/**
 * Récupère tous les médecins ayant accès à un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<Array>} - Liste des médecins ayant accès
 */
export const getMedecinsAvecAcces = async (patientId) => {
  try {
    // URL correcte selon AutorisationController.java
    const response = await api.get(`${API_PREFIX_AUTORISATIONS}/patients/${patientId}/medecins`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des médecins ayant accès');
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
