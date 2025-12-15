import api from './api';
import { getMedecinId as getMedecinIdFromService } from './medecinService';

/**
 * Service pour la gestion des rendez-vous
 * Fournit des fonctions pour créer, récupérer, mettre à jour et annuler des rendez-vous
 */

// Configuration du préfixe API
const API_PREFIX = '/api/rendez-vous';

/**
 * Récupère l'ID du médecin connecté
 * Utilise l'implémentation plus robuste du service des médecins
 * @returns {Promise<number>} - ID du médecin connecté
 */
export const getMedecinId = async () => {
  try {
    console.log("Utilisation de getMedecinId depuis medecinService");
    return await getMedecinIdFromService();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du médecin:", error);
    throw error;
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
      throw new Error('Rendez-vous non trouvé.');
    default:
      throw new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
  }
};

/**
 * Récupère tous les rendez-vous du médecin connecté
 * @returns {Promise<Object>} - Réponse contenant la liste des rendez-vous
 */
export const getMesRendezVous = async () => {
  try {
    const response = await api.get(`${API_PREFIX}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des rendez-vous');
  }
};

/**
 * Récupère les rendez-vous du jour pour le médecin connecté
 * @returns {Promise<Object>} - Réponse contenant la liste des rendez-vous du jour
 */
export const getRendezVousDuJour = async () => {
  try {
    const response = await api.get(`${API_PREFIX}/aujourd-hui`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des rendez-vous du jour');
  }
};

/**
 * Récupère les rendez-vous à venir pour le médecin connecté
 * @returns {Promise<Object>} - Réponse contenant la liste des rendez-vous à venir
 */
export const getRendezVousAVenir = async () => {
  try {
    const response = await api.get(`${API_PREFIX}/a-venir`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération des rendez-vous à venir');
  }
};

/**
 * Récupère les rendez-vous d'un patient spécifique
 * @param {number} patientId - ID du patient
 * @returns {Promise<Object>} - Réponse contenant la liste des rendez-vous du patient
 */
export const getRendezVousPatient = async (patientId) => {
  try {
    const response = await api.get(`${API_PREFIX}/patient/${patientId}`);
    return response.data;
  } catch (error) {
    handleError(error, `Erreur lors de la récupération des rendez-vous du patient ${patientId}`);
  }
};

/**
 * Vérifie la disponibilité d'un créneau pour un rendez-vous
 * @param {Object} data - Données du créneau à vérifier
 * @returns {Promise<Object>} - Réponse indiquant si le créneau est disponible
 */
export const verifierDisponibilite = async (data) => {
  try {
    console.log("Vérification de disponibilité avec les données:", data);
    
    // Récupérer l'ID du médecin directement depuis le backend
    const medecinId = await getMedecinId();
    
    console.log("ID du médecin connecté (backend):", medecinId);
    
    // Vérification obligatoire de l'ID médecin
    if (!medecinId) {
      console.error("Erreur critique: ID du médecin non disponible malgré la tentative de récupération backend");
      throw new Error("ID du médecin non disponible pour vérifier la disponibilité");
    }
    
    // Format requis par le DTO VerifierDisponibiliteDTO du backend
    const requestData = {
      patientId: Number(data.patientId),
      medecinId: Number(medecinId),      // CRUCIAL: Le DTO requiert ce champ
      dateHeure: typeof data.dateHeure === 'string' 
        ? data.dateHeure 
        : data.dateHeure.toISOString(),
      duree: Number(data.duree || 30)
    };
    
    console.log("Données formatées pour vérification:", requestData);
    
    // Préparation des paramètres pour la requête GET
    const params = new URLSearchParams();
    params.append('patientId', requestData.patientId);
    params.append('medecinId', requestData.medecinId);
    params.append('dateHeure', requestData.dateHeure);
    params.append('duree', requestData.duree);
    
    try {
      // Appel direct au backend - sans simulation
      const response = await api.get(`/api/disponibilite-rendez-vous?${params.toString()}`);
      console.log("Réponse de vérification disponibilité:", response.data);
      
      // Normalisation de la réponse pour correspondre au format attendu
      if (response.data && response.data.disponible !== undefined) {
        return {
          success: true,
          data: {
            disponible: response.data.disponible,
            message: response.data.message || 'Vérification effectuée'
          }
        };
      }
      
      return {
        success: false,
        message: 'Format de réponse non reconnu'
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la vérification de disponibilité',
        error: error.message
      };
    }
  } catch (error) {
    console.error('Erreur globale lors de la vérification de disponibilité:', error);
    
    return {
      success: false,
      message: error.message || 'Erreur inattendue lors de la vérification de disponibilité'
    };
  }
};

/**
 * Crée un nouveau rendez-vous
 * @param {Object} rendezVousData - Données du rendez-vous à créer
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous créé
 */
export const creerRendezVous = async (rendezVousData) => {
  try {
    console.log("Tentative de création de rendez-vous avec le backend");
    
    // Récupérer l'ID du médecin directement depuis le backend
    const medecinId = await getMedecinId();
    
    console.log("ID du médecin connecté pour création de RDV (backend):", medecinId);
    
    // Si nous n'avons pas d'ID médecin, la création ne peut pas fonctionner
    if (!medecinId) {
      console.error("Erreur critique: ID du médecin non disponible malgré la tentative de récupération backend");
      throw new Error("ID du médecin non disponible pour créer un rendez-vous");
    }
    
    // Format strictement conforme à la classe RendezVousCreationDTO du backend
    // Le contrôleur récupère le médecin à partir de la session authentifiée
    // Attention: Le format de la date doit être compatible avec LocalDateTime côté serveur Java
    const dateObj = new Date(rendezVousData.dateHeure);
    
    // Format compatible avec Spring Boot LocalDateTime (sans 'Z' à la fin)
    // Format: "2025-06-17T04:45:00" - sans le 'Z' à la fin qui indique UTC
    const formattedDate = dateObj.toISOString().replace(/\.\d{3}Z$/, '');
    
    const rendezVousDTO = {
      patientId: Number(rendezVousData.patientId),
      dateHeure: formattedDate,
      duree: Number(rendezVousData.duree),
      motif: rendezVousData.motif || '',
      notes: rendezVousData.notes || ''
    };
    
    console.log("Données formatées pour création:", JSON.stringify(rendezVousDTO));
    
    // Tentative avec l'endpoint correct
    try {
      // Utiliser le bon endpoint d'après le RendezVousController
      const response = await api.post(`${API_PREFIX}`, rendezVousDTO, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log("Réponse de création réussie:", response);
      return {
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: response.data
      };
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      
      // Propager l'erreur sans simulation
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du rendez-vous',
        error: error.message,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      };
    }
  } catch (error) {
    console.error("Erreur globale:", error);
    
    // Retourner une erreur structurée
    return {
      success: false,
      message: 'Erreur inattendue lors de la création du rendez-vous',
      error: error.message
    };
  }
};

/**
 * Annule un rendez-vous
 * @param {string} id - ID du rendez-vous à annuler
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous annulé
 */
export const annulerRendezVous = async (id) => {
  try {
    const response = await api.post(`${API_PREFIX}/${id}/annuler`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de l\'annulation du rendez-vous');
  }
};

/**
 * Reporte un rendez-vous à une nouvelle date
 * @param {string} id - ID du rendez-vous à reporter
 * @param {Date} nouvelleDateHeure - Nouvelle date et heure du rendez-vous
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous reporté
 */
export const reporterRendezVous = async (id, nouvelleDateHeure) => {
  try {
    const response = await api.post(`${API_PREFIX}/${id}/reporter`, { nouvelleDateHeure });
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors du report du rendez-vous');
  }
};

/**
 * Confirme un rendez-vous
 * @param {string} id - ID du rendez-vous à confirmer
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous confirmé
 */
export const confirmerRendezVous = async (id) => {
  try {
    const response = await api.post(`${API_PREFIX}/${id}/confirmer`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la confirmation du rendez-vous');
  }
};

/**
 * Marque un rendez-vous comme terminé
 * @param {string} id - ID du rendez-vous à marquer comme terminé
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous terminé
 */
export const terminerRendezVous = async (id) => {
  try {
    const response = await api.post(`${API_PREFIX}/${id}/terminer`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la terminaison du rendez-vous');
  }
};

/**
 * Marque l'absence d'un patient à un rendez-vous
 * @param {string} id - ID du rendez-vous où le patient est absent
 * @returns {Promise<Object>} - Réponse contenant le rendez-vous mis à jour
 */
export const marquerAbsence = async (id) => {
  try {
    const response = await api.post(`${API_PREFIX}/${id}/absence`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors du marquage de l\'absence');
  }
};

/**
 * Récupère les rendez-vous du patient connecté (interface patient)
 * @returns {Promise<Object>} - Réponse contenant les rendez-vous du patient
 */
export const getMesRendezVousPatient = async () => {
  try {
    const response = await api.get(`${API_PREFIX}/mes-rendez-vous`);
    return response.data;
  } catch (error) {
    handleError(error, 'Erreur lors de la récupération de vos rendez-vous');
  }
};
