import api from './api';


/**
 * Service pour la gestion des médecins
 * Interface entre le frontend et les endpoints de l'API liés aux médecins
 * Intègre la normalisation des données pour garantir la cohérence
 */

// Définition des préfixes d'API corrects pour aligner avec le backend
const API_PREFIX = '/api/medecin';

// --- Gestion centralisée des erreurs ---
const handleError = (error, contextMessage = 'Erreur inattendue') => {
  console.error(`${contextMessage}:`, error.response?.data || error.message);
  console.error('Status code:', error.response?.status);
  console.error('Headers:', error.response?.headers);
  throw new Error(error.message);
};

// Cache pour l'ID du médecin connecté
let cachedMedecinId = null;

/**
 * Récupère l'ID du médecin connecté directement depuis le backend
 * @returns {Promise<number>} - ID du médecin connecté
 */
export const getMedecinId = async () => {
  // Si nous avons déjà récupéré l'ID et qu'il est en cache, le retourner directement
  if (cachedMedecinId) {
    return cachedMedecinId;
  }
  
  try {
    // Récupérer directement l'information depuis le backend via notre nouvel endpoint
    console.log("Tentative de récupération de l'ID du médecin depuis /api/medecin/info");
    const response = await api.get('/api/medecin/info');
    
    // Vérifier si la réponse contient un ID
    if (response.data && response.data.id) {
      // Stocker l'ID dans le cache
      cachedMedecinId = Number(response.data.id);
      
      // Aussi le stocker dans localStorage pour une utilisation hors-ligne éventuelle
      localStorage.setItem('medecinId', cachedMedecinId);
      
      console.log("ID du médecin récupéré depuis le backend:", cachedMedecinId);
      return cachedMedecinId;
    }
    
    // Fallback : essayer l'ancien endpoint /profil si le nouveau ne fonctionne pas
    console.log("Fallback: tentative avec l'ancien endpoint /profil");
    const profilResponse = await api.get(`${API_PREFIX}/profil`);
    if (profilResponse.data && profilResponse.data.id) {
      cachedMedecinId = Number(profilResponse.data.id);
      localStorage.setItem('medecinId', cachedMedecinId);
      
      console.log("ID du médecin récupéré depuis le profil:", cachedMedecinId);
      return cachedMedecinId;
    }
    
    // Dernier recours : essayer de récupérer depuis localStorage/sessionStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userInfo') || sessionStorage.getItem('user') || '{}');
    const storedMedecinId = localStorage.getItem('medecinId') || userInfo.id || userInfo.medecinId;
    
    if (storedMedecinId) {
      cachedMedecinId = Number(storedMedecinId);
      console.log("ID du médecin récupéré depuis le stockage local:", cachedMedecinId);
      return cachedMedecinId;
    }
    
    throw new Error("Impossible de récupérer l'ID du médecin depuis le backend");
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du médecin:", error);
    
    // Dernier recours : essayer de récupérer depuis localStorage/sessionStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userInfo') || sessionStorage.getItem('user') || '{}');
    const storedMedecinId = localStorage.getItem('medecinId') || userInfo.id || userInfo.medecinId;
    
    if (storedMedecinId) {
      cachedMedecinId = Number(storedMedecinId);
      console.log("ID du médecin récupéré depuis le stockage local:", cachedMedecinId);
      return cachedMedecinId;
    }
    
    throw new Error("Impossible de récupérer l'ID du médecin");
  }
};

/**
 * Récupère les informations du médecin connecté
 * @returns {Promise<Object>} - Informations du médecin connecté normalisées
 */
export const getMedecinConnecte = async () => {
  try {
    // Essayer d'abord le nouvel endpoint info
    try {
      const response = await api.get(`${API_PREFIX}/info`);
      if (response.data) {
        return response.data;
      }
    } catch (infoError) {
      console.log("Endpoint /info non disponible, utilisation de /profil", infoError);
      // Continuer avec l'ancien endpoint
    }
    
    // Fallback vers l'ancien endpoint
    const response = await api.get(`${API_PREFIX}/profil`);
    
    // Retourner directement les données sans normalisation
    if (!response.data) {
      throw new Error('Profil médecin introuvable ou données invalides');
    }
    
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération du profil du médecin');
  }
};

/**
 * Crée un patient (Médecin uniquement)
 * @param {Object} patientData - Données du patient à créer
 * @returns {Promise<Object>} - Patient créé et normalisé
 */
export const createPatient = async (patientData) => {
  try {
    console.log('Tentative de création de patient avec les données:', patientData);
    
    // Vérification de base des données requises
    if (!patientData.nom || !patientData.prenom) {
      throw new Error('Les nom et prénom du patient sont requis');
    }
    
    const response = await api.post(`${API_PREFIX}/create-patient`, patientData);
    console.log('Réponse du serveur:', response.data);
    
    // Retourner directement les données sans normalisation
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la création du patient');
  }
};

// Cache de promesse pour la requête getPatients
let patientsPromiseCache = null;
let patientsCacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 secondes

/**
 * Récupère tous les patients accessibles par le médecin connecté
 * Cette fonction est conservée pour compatibilité mais il est recommandé
 * d'utiliser patientService.getPatients() à la place
 * @returns {Promise<Array>} - Liste des patients normalisée
 * @deprecated Utiliser patientService.getPatients() à la place
 */
export const getPatients = async () => {
  const now = Date.now();
  
  // Si une promesse est en cours ou si le cache est encore valide, retourner la promesse mise en cache
  if (patientsPromiseCache && (now - patientsCacheTimestamp < CACHE_DURATION)) {
    console.log('Utilisation du cache pour la liste des patients');
    return patientsPromiseCache;
  }
  
  // Sinon, créer une nouvelle promesse
  console.log('Récupération de la liste des patients...');
  patientsCacheTimestamp = now;
  
  // Créer et mettre en cache la promesse
  patientsPromiseCache = (async () => {
    try {
      const response = await api.get(`${API_PREFIX}/patients`);
      return response.data;
    } catch (error) {
      // En cas d'erreur, invalider le cache
      patientsPromiseCache = null;
      handleError(error, 'Erreur lors de la récupération des patients');
    }
  })();
  
  return patientsPromiseCache;
};

/**
 * Réinitialise le cache des patients
 * À appeler après une opération qui modifie la liste des patients (création, suppression, etc.)
 */
export const invalidatePatientsCache = () => {
  console.log('Invalidation du cache des patients');
  patientsPromiseCache = null;
  patientsCacheTimestamp = 0;
};

/**
 * Récupère un patient par son ID
 * Cette fonction est conservée pour compatibilité mais il est recommandé
 * d'utiliser patientService.getPatientById() à la place
 * @param {number} patientId - ID du patient à récupérer
 * @returns {Promise<Object>} - Données du patient normalisées
 * @deprecated Utiliser patientService.getPatientById() à la place
 */
export const getPatientById = async (patientId) => {
  try {
    const response = await api.get(`${API_PREFIX}/patients/${patientId}`);
    
    if (!response.data) {
      throw new Error(`Patient ${patientId} introuvable ou données invalides`);
    }
    
    // Retourner directement les données sans normalisation
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la récupération du patient ${patientId}`);
  }
};

/**
 * Vérifie si le médecin connecté a accès au dossier d'un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<boolean>} - Indique si le médecin a accès
 */
export const verifierAccesPatient = async (patientId) => {
  try {
    const response = await api.get(`${API_PREFIX}/patients/${patientId}/acces`);
    return response.data.acces || false;
  } catch (error) {
    // En cas d'erreur 403, on retourne false au lieu de lever une exception
    if (error.response?.status === 403) {
      return false;
    }
    handleError(error, `Erreur lors de la vérification d'accès au patient ${patientId}`);
    return false;
  }
};

/**
 * Met à jour un dossier médical
 * @param {number} patientId - ID du patient
 * @param {Object} dossierData - Données du dossier médical
 * @returns {Promise<Object>} - Dossier médical mis à jour
 */
export const updateDossierMedical = async (patientId, dossierData) => {
  try {
    console.log('Tentative de mise à jour du dossier médical:', {
      patientId,
      dossierData
    });
    
    // Vérification des données requises
    if (!patientId) {
      throw new Error('ID du patient manquant');
    }
    
    if (!dossierData || typeof dossierData !== 'object') {
      throw new Error('Données du dossier médical invalides');
    }
    
    const response = await api.put(`${API_PREFIX}/patients/${patientId}/dossier-medical`, dossierData);
    console.log('Mise à jour du dossier médical réussie:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier médical:', error);
    
    // Gestion spécifique des erreurs 400
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          'Données invalides. Vérifiez les champs requis.';
      
      console.error('Détails de l\'erreur 400:', {
        message: errorMessage,
        data: error.response.data
      });
      
      throw new Error(`Erreur de validation: ${errorMessage}`);
    }
    
    // Autres types d'erreurs
    throw error;
  }
};

/**
 * Ajoute une consultation médical à un patient
 * @param {number} patientId - ID du patient
 * @param {Object} consultationData - Données de la consultation
 * @returns {Promise<Object>} - Consultation créée
 */
export const ajouterConsultation = async (patientId, consultationData) => {
  try {
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations`, 
      consultationData
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de l\'ajout d\'une consultation');
  }
};

/**
 * Ajoute une analyse à une consultation
 * @param {number} patientId - ID du patient
 * @param {number} consultationId - ID de la consultation
 * @param {Object} analyseData - Données de l'analyse
 * @returns {Promise<Object>} - Analyse créée
 */
export const ajouterAnalyseConsultation = async (patientId, consultationId, analyseData) => {
  try {
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/analyses`, 
      analyseData
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de l\'ajout d\'une analyse');
  }
};


/**
 * Ajoute une ordonnance à une consultation
 * @param {number} patientId - ID du patient
 * @param {number} consultationId - ID de la consultation
 * @param {Object} ordonnanceData - Données de l'ordonnance
 * @returns {Promise<Object>} - Ordonnance créée
 */
export const ajouterOrdonnanceAntecedent = async (patientId, consultationId, ordonnanceData) => {
  try {
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/ordonnances`, 
      ordonnanceData
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de l\'ajout d\'une ordonnance');
  }
};

/**
 * Accorde un accès à un autre médecin pour un patient
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin à autoriser
 * @param {string} niveauAcces - Niveau d'accès (LECTURE, ECRITURE, COMPLET)
 * @param {string} dateExpiration - Date d'expiration de l'accès (format ISO)
 * @returns {Promise<Object>} - Autorisation créée
 */
export const accorderAccesMedecin = async (patientId, medecinId, niveauAcces, dateExpiration) => {
  try {
    const response = await api.post(`/api/medecin/patients/${patientId}/acces`, {
      medecinId,
      niveauAcces,
      dateExpiration
    });
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de l\'attribution d\'un accès');
  }
};

/**
 * Révoque l'accès d'un médecin à un patient
 * @param {number} patientId - ID du patient
 * @param {number} medecinId - ID du médecin dont l'accès doit être révoqué
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const revoquerAccesMedecin = async (patientId, medecinId) => {
  try {
    const response = await api.delete(`/api/medecin/patients/${patientId}/acces/${medecinId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la révocation d\'un accès');
  }
};

/**
 * Récupère la liste des médecins ayant accès à un patient
 * @param {number} patientId - ID du patient
 * @returns {Promise<Array>} - Liste des médecins avec leurs droits d'accès
 */
export const getMedecinsAvecAcces = async (patientId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/acces`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des médecins ayant accès');
  }
};

/**
 * Récupère tous les médecins du système (avec pagination)
 * @param {number} page - Numéro de la page (commence à 0)
 * @param {number} size - Nombre d'éléments par page
 * @returns {Promise<Object>} - Données paginées des médecins
 */
export const getAllMedecins = async (page = 0, size = 20) => {
  try {
    const response = await api.get(`/api/medecin/all?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des médecins');
  }
};

/**
 * Recherche des médecins selon un terme de recherche
 * @param {string} term - Terme de recherche (email, nom, téléphone, etc.)
 * @param {Object} options - Options de recherche
 * @returns {Promise<Array>} - Liste des médecins correspondants
 */
export const rechercherMedecins = async (term, options = {}) => {
  try {
    // Par défaut, rechercher dans tous les champs
    const fields = options.fields || ['email', 'nom', 'prenom', 'telephone', 'numeroOrdre'];
    const fieldsParam = fields.join(',');
    
    const response = await api.get(`/api/medecin/search?term=${encodeURIComponent(term)}&fields=${fieldsParam}`);
    return response.data;
  } catch (error) {
    // En cas d'erreur 404 (aucun résultat), retourner un tableau vide
    if (error.response?.status === 404) {
      return [];
    }
    handleError(error, 'Erreur lors de la recherche de médecins');
  }
};

/**
 * Cache local pour éviter des appels API répétés
 * Structure: { query: { timestamp, results } }
 */
const searchCache = {};

/**
 * Recherche des médecins avec cache local
 * @param {string} term - Terme de recherche
 * @param {Object} options - Options de recherche
 * @returns {Promise<Array>} - Médecins correspondants
 */
export const rechercherMedecinsWithCache = async (term, options = {}) => {
  // Si le terme est vide, ne pas faire de recherche
  if (!term || term.trim().length < 2) {
    return [];
  }
  
  const cacheKey = `${term}-${JSON.stringify(options)}`;
  const now = Date.now();
  const cacheEntry = searchCache[cacheKey];
  
  // Utiliser le cache si disponible et récent (moins de 5 minutes)
  if (cacheEntry && (now - cacheEntry.timestamp < 5 * 60 * 1000)) {
    return cacheEntry.results;
  }
  
  // Sinon, faire une nouvelle requête
  const results = await rechercherMedecins(term, options);
  
  // Mettre en cache les résultats
  searchCache[cacheKey] = {
    timestamp: now,
    results
  };
  
  return results;
};
