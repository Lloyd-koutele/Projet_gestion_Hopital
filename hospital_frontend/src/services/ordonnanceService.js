import api from './api';

/**
 * Récupère toutes les ordonnances associées à une consultation spécifique
 * @param {number} patientId - Identifiant du patient
 * @param {string} consultationId - Identifiant de la consultation
 * @returns {Promise<Array>} - Tableau d'ordonnances
 */
export const getOrdonnances = async (patientId, consultationId) => {
  try {
    const response = await api.get(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/ordonnances`
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des ordonnances:', error);
    throw error;
  }
};

/**
 * Récupère toutes les ordonnances de toutes les consultations d'un patient
 * Pour la compatibilité avec le code existant
 * @param {number} patientId - Identifiant du patient
 * @returns {Promise<Array>} - Tableau d'ordonnances
 */
export const getAllPatientOrdonnances = async (patientId) => {
  try {
    // D'abord, récupérer toutes les consultations
    const consultationsResponse = await api.get(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations`
    );
    
    // Ensuite, pour chaque consultation, récupérer les ordonnances
    const consultations = consultationsResponse.data;
    let allOrdonnances = [];
    
    // Si des consultations existent, récupérer les ordonnances pour chacune d'elles
    if (consultations && consultations.length > 0) {
      const ordonnancesPromises = consultations.map(consultation => 
        getOrdonnances(patientId, consultation.id)
          .then(ordonnances => ordonnances || [])
          .catch(() => []) // En cas d'erreur, renvoyer un tableau vide
      );
      
      // Attendre que toutes les requêtes soient terminées
      const ordonnancesResults = await Promise.all(ordonnancesPromises);
      
      // Fusionner tous les tableaux d'ordonnances
      allOrdonnances = ordonnancesResults.flat();
    }
    
    return allOrdonnances;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les ordonnances du patient:', error);
    throw error;
  }
};

/**
 * Ajoute une nouvelle ordonnance à une consultation spécifique
 * @param {number} patientId - Identifiant du patient
 * @param {string} consultationId - Identifiant de la consultation
 * @param {Object} ordonnanceData - Données de l'ordonnance à ajouter
 * @returns {Promise<Object>} - Ordonnance créée
 */
export const ajouterOrdonnanceConsultation = async (patientId, consultationId, ordonnanceData) => {
  try {
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/ordonnances`, 
      ordonnanceData
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'ordonnance à la consultation:', error);
    throw error;
  }
};
