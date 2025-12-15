import api from './api';

/**
 * Service pour gérer les fonctionnalités du tableau de bord patient
 */

/**
 * Récupère les informations du dossier médical du patient connecté
 * @returns {Promise<Object>} Les données du dossier médical
 */
export const getMonDossierMedical = async () => {
  try {
    const response = await api.get('/api/patient/mon-dossier-medical');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier médical:', error);
    throw error;
  }
};

/**
 * Récupère la liste des consultations du patient connecté
 * @returns {Promise<Array>} Liste des consultations
 */
export const getMesConsultations = async () => {
  try {
    const response = await api.get('/api/patient/mes-consultations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'une consultation spécifique
 * @param {number} consultationId - ID de la consultation
 * @returns {Promise<Object>} Détails de la consultation
 */
export const getConsultationDetails = async (consultationId) => {
  try {
    const response = await api.get(`/api/patient/mes-consultations/${consultationId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la consultation ${consultationId}:`, error);
    throw error;
  }
};

/**
 * Récupère la liste des ordonnances du patient connecté
 * @returns {Promise<Array>} Liste des ordonnances
 */
export const getMesOrdonnances = async () => {
  try {
    const response = await api.get('/api/patient/mes-ordonnances');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des ordonnances:', error);
    throw error;
  }
};

/**
 * Récupère la liste des images médicales du patient connecté
 * @returns {Promise<Array>} Liste des images médicales
 */
export const getMesImagesMedicales = async () => {
  try {
    const response = await api.get('/api/patient/mes-images');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des images médicales:', error);
    throw error;
  }
};

/**
 * Récupère la liste des analyses du patient connecté
 * @returns {Promise<Array>} Liste des analyses
 */
export const getMesAnalyses = async () => {
  try {
    const response = await api.get('/api/patient/mes-analyses');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des analyses:', error);
    throw error;
  }
};

/**
 * Récupère la liste des médecins ayant accès au dossier médical du patient
 * @returns {Promise<Array>} Liste des médecins avec accès
 */
export const getMedecinsAvecAcces = async () => {
  try {
    const response = await api.get('/api/patient/mes-acces');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins avec accès:', error);
    throw error;
  }
};

/**
 * Révoque l'accès d'un médecin au dossier médical du patient
 * @param {number} medecinId - ID du médecin
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const revoquerAccesMedecin = async (medecinId) => {
  try {
    const response = await api.delete(`/api/patient/acces-medecin/${medecinId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la révocation de l'accès du médecin ${medecinId}:`, error);
    throw error;
  }
};

/**
 * Accorde l'accès à un médecin au dossier médical du patient
 * @param {number} medecinId - ID du médecin
 * @param {Date} dateExpiration - Date d'expiration de l'accès (optionnelle)
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const accorderAccesMedecin = async (medecinId, dateExpiration = null) => {
  try {
    const response = await api.post('/api/patient/acces-medecin', {
      medecinId,
      dateExpiration
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'attribution de l'accès au médecin ${medecinId}:`, error);
    throw error;
  }
};

/**
 * Met à jour les informations de contact du patient
 * @param {Object} infosContact - Informations de contact à mettre à jour
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const updateInfosContact = async (infosContact) => {
  try {
    const response = await api.put('/api/patient/infos-contact', infosContact);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations de contact:', error);
    throw error;
  }
};
