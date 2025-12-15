import api from './api';

/**
 * Récupère toutes les analyses associées à une consultation spécifique
 * @param {number} patientId - Identifiant du patient
 * @param {string} consultationId - Identifiant de la consultation
 * @returns {Promise<Array>} - Tableau d'analyses
 */
export const getAnalyses = async (patientId, consultationId) => {
  try {
    const response = await api.get(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/analyses`
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des analyses:', error);
    throw error;
  }
};

/**
 * Récupère toutes les analyses de toutes les consultations d'un patient
 * Pour la compatibilité avec le code existant
 * @param {number} patientId - Identifiant du patient
 * @returns {Promise<Array>} - Tableau d'analyses
 */
export const getAllPatientAnalyses = async (patientId) => {
  try {
    // D'abord, récupérer toutes les consultations
    const consultationsResponse = await api.get(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations`
    );
    
    // Ensuite, pour chaque consultation, récupérer les analyses
    const consultations = consultationsResponse.data;
    let allAnalyses = [];
    
    // Si des consultations existent, récupérer les analyses pour chacune d'elles
    if (consultations && consultations.length > 0) {
      const analysesPromises = consultations.map(consultation => 
        getAnalyses(patientId, consultation.id)
          .then(analyses => analyses || [])
          .catch(() => []) // En cas d'erreur, renvoyer un tableau vide
      );
      
      // Attendre que toutes les requêtes soient terminées
      const analysesResults = await Promise.all(analysesPromises);
      
      // Fusionner tous les tableaux d'analyses
      allAnalyses = analysesResults.flat();
    }
    
    return allAnalyses;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les analyses du patient:', error);
    throw error;
  }
};

/**
 * Ajoute une nouvelle analyse à une consultation spécifique
 * @param {number} patientId - Identifiant du patient
 * @param {string} consultationId - Identifiant de la consultation
 * @param {Object} analyseData - Données de l'analyse à ajouter
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
    console.error('Erreur lors de l\'ajout de l\'analyse à la consultation:', error);
    throw error;
  }
};
