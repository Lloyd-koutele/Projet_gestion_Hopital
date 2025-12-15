import api from './api';

/**
 * Récupérer toutes les consultations d'un patient
 * @param {string} patientId - ID du patient
 * @returns {Promise} - Réponse de l'API
 */
export const getConsultation = async (patientId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations:', error);
    throw error;
  }
};


/**
 * Ajouter une consultation au dossier médical
 * @param {string} patientId - ID du patient
 * @param {Object} consultationData - Données de l'antécédent
 * @returns {Promise} - Réponse de l'API
 */
export const ajouterConsultation = async (patientId, consultationData) => {
  try {
    const response = await api.post(`/api/medecin/patients/${patientId}/dossier-medical/consultations`, consultationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la consultation:', error);
    throw error;
  }
};

/**
 * Mettre à jour une consultation existante
 * @param {string} patientId - ID du patient
 * @param {string} consultationtId - ID de la consultation à mettre à jour
 * @param {Object} consultationData - Nouvelles données de la consultation
 * @returns {Promise} - Réponse de l'API
 */
export const updateConsultation = async (patientId, consultationId, consultationData) => {
  try {
    const response = await api.put(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}`, consultationData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la consultation ${consultationId}:`, error);
    throw error;
  }
};


/**
 * Récupérer les analyses associées à une consultation spécifique
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @returns {Promise} - Réponse de l'API
 */
export const getAnalysesParConsultation = async (patientId, consultationId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/analyses`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des analyses pour la consultation ${consultationId}:`, error);
    throw error;
  }
};

/**
 * Récupérer les ordonnances associées à une consultation spécifique
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @returns {Promise} - Réponse de l'API
 */
export const getOrdonnancesParConsultation = async (patientId, consultationId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/ordonnances`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des ordonnances pour la consultation ${consultationId}:`, error);
    throw error;
  }
};

/**
 * Récupérer une consultation spécifique par son ID
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @returns {Promise} - Réponse de l'API
 */
export const getConsultationById = async (patientId, consultationId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la consultation ${consultationId}:`, error);
    throw error;
  }
};

/**
 * Récupérer les images associées à une consultation spécifique
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @returns {Promise} - Réponse de l'API
 */
export const getImagesParConsultation = async (patientId, consultationId) => {
  try {
    const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des images pour la consultation ${consultationId}:`, error);
    throw error;
  }
};
