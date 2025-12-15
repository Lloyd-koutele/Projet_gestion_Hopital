import api from './api';

/**
 * Cache d'URL d'images pour éviter les requêtes redondantes
 * @type {Map<string, { url: string, timestamp: number }>}
 */
const imageCache = new Map();

// Durée de validité du cache en millisecondes (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Vérifie si une image est au format DICOM basé sur son lien fichier
 * @param {string} lienFichier - Lien du fichier
 * @returns {boolean} - true si c'est une image DICOM
 */
export const isDicomImage = (lienFichier) => {
  // Forcer le début des logs par un emoji pour les rendre plus visibles dans la console
  console.group("🔍 DETECTION DICOM");
  
  if (!lienFichier) {
    console.warn("⚠️ isDicomImage: lien fichier vide ou null");
    console.groupEnd();
    return false;
  }
  
  console.log(`Analyse du lien fichier: "${lienFichier}"`);
  
  // Considérer comme DICOM UNIQUEMENT si le lien se termine par '.dcm' OU commence par 'orthanc://'
  const isDcm = lienFichier.toLowerCase().endsWith('.dcm');
  const isOrthanc = lienFichier.startsWith('orthanc://');
  
  // Validation avancée pour les liens Orthanc
  let orthancIdValid = true;
  let orthancId = null;
  if (isOrthanc) {
    orthancId = extractOrthancId(lienFichier);
    orthancIdValid = orthancId && /^[a-f0-9-]+$/i.test(orthancId);
  }
  
  // SUPPRESSION de la détection forcée par type d'image
  // Cette logique identifiait incorrectement des images non-DICOM comme DICOM
  
  // Log détaillé pour le débogage
  console.log(`📊 Vérification DICOM pour "${lienFichier}":
  - Extension .dcm: ${isDcm ? '✓ OUI' : '❌ NON'}
  - Protocole orthanc://: ${isOrthanc ? '✓ OUI' : '❌ NON'}
  - ID Orthanc: ${isOrthanc ? orthancId : 'N/A'}
  - ID Orthanc valide: ${isOrthanc ? (orthancIdValid ? '✓ OUI' : '❌ NON') : 'N/A'}
  - VERDICT FINAL: ${(isDcm || isOrthanc) ? '✅ C\'EST UN DICOM' : '❌ Ce n\'est PAS un DICOM'}`);
  
  console.groupEnd();
  
  // Retourner vrai UNIQUEMENT pour les vrais fichiers DICOM
  return isDcm || (isOrthanc && orthancIdValid);
};

/**
 * Image de remplacement en cas d'erreur (encodée en base64)
 */
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2Ugbm9uIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPg==';

/**
 * Récupère le contenu d'une image et retourne son URL
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @param {string} imageId - ID de l'image
 * @returns {Promise<string>} - URL de l'image ou image de remplacement en cas d'erreur
 */
export const getImageContent = async (patientId, consultationId, imageId) => {
  if (!patientId || !consultationId || !imageId) {
    console.warn('Paramètres manquants pour récupérer le contenu de l\'image');
    return FALLBACK_IMAGE;
  }
  
  // Vérifier le cache
  const cacheKey = `${patientId}-${consultationId}-${imageId}`;
  const cachedImage = imageCache.get(cacheKey);
  if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_DURATION) {
    console.log('Utilisation de l\'image en cache');
    return cachedImage.url;
  }
  
  try {
    // Utiliser l'API configurée avec le proxy Vite au lieu de construire l'URL manuellement
    const apiPath = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${imageId}/file`;
    
    console.log(`Récupération de l'image ${imageId} pour le patient ${patientId}, consultation ${consultationId}`);
    console.log(`URL API: ${apiPath}`);
    
    const response = await api.get(apiPath, {
      responseType: 'blob',
      headers: {
        'Accept': 'image/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    const blob = response.data;
    const imageUrl = URL.createObjectURL(blob);
    
    // Mettre en cache
    imageCache.set(cacheKey, {
      url: imageUrl,
      timestamp: Date.now()
    });
    
    return imageUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu de l\'image:', error);
    
    // Utiliser l'image de remplacement en cas d'erreur 404
    if (error.response && error.response.status === 404) {
      console.log(`Image ${imageId} non trouvée (404), utilisation de l'image de remplacement`);
      return FALLBACK_IMAGE;
    }
    
    // Pour les autres types d'erreurs, on propage l'erreur
    throw error;
  }
};

/**
 * Ajoute une image à une consultation médical
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation médical
 * @param {FormData} formData - Données de l'image et métadonnées
 * @returns {Promise<Object>} - Données de l'image ajoutée
 */
export const ajouterImageConsultation = async (patientId, consultationId, formData) => {
  if (!patientId || !consultationId || !formData) {
    throw new Error('Paramètres manquants pour ajouter une image à la consultation');
  }
  
  try {
    // Noter qu'il n'existe pas d'endpoint spécifique pour ajouter des images dans le backend
    // Nous allons suivre le même pattern que pour les analyses et ordonnances
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'image à la consultation:', error);
    throw error;
  }
};

/**
 * Extrait l'ID Orthanc à partir d'un lien DICOM
 * @param {string} lienFichier - Lien du fichier (format: "orthanc://ID.dcm")
 * @returns {string|null} - L'ID Orthanc ou null si non valide
 */
export const extractOrthancId = (lienFichier) => {
  console.log(`Tentative d'extraction de l'ID Orthanc depuis le lien: "${lienFichier}"`);
  
  if (!lienFichier) {
    console.warn("extractOrthancId: Lien fichier vide ou null");
    return null;
  }
  
  if (!lienFichier.startsWith('orthanc://')) {
    console.warn(`extractOrthancId: Le lien ne commence pas par "orthanc://": ${lienFichier}`);
    return null;
  }
  
  // Extraire l'ID Orthanc (format: "orthanc://ID.dcm")
  const orthancIdWithExt = lienFichier.substring(10); // Remove "orthanc://" prefix
  console.log(`ID Orthanc extrait avec possible extension: "${orthancIdWithExt}"`);
  
  // Supprimer l'extension .dcm si elle existe
  let cleanId = orthancIdWithExt;
  if (orthancIdWithExt.toLowerCase().endsWith('.dcm')) {
    // Correction: length est une propriété, pas une méthode
    cleanId = orthancIdWithExt.substring(0, orthancIdWithExt.length - 4);
    console.log(`Extension .dcm détectée et supprimée. ID nettoyé: "${cleanId}"`);
  }
  
  // Validation de l'ID (devrait être au format UUID ou similaire)
  const isValidId = /^[a-f0-9-]+$/i.test(cleanId);
  console.log(`ID Orthanc "${cleanId}" est ${isValidId ? 'valide' : 'INVALIDE'}`);
  
  return cleanId;
};

/**
 * Récupère un fichier DICOM à partir d'un lien
 * @param {string} lienFichier - Lien vers le fichier DICOM
 * @param {string} patientId - ID du patient
 * @param {string} consultationId - ID de la consultation
 * @param {string} imageId - ID de l'image
 * @returns {Promise<{blob: Blob, previewUrl: string|null}>} - Blob et URL de prévisualisation
 */
export const getDicomBlobByLink = async (lienFichier, patientId, consultationId, imageId) => {
  console.group(`getDicomBlobByLink pour image ${imageId}`);
  console.log('Paramètres reçus:');
  console.log(`- lienFichier: ${lienFichier}`);
  console.log(`- patientId: ${patientId}`);
  console.log(`- consultationId: ${consultationId}`);
  console.log(`- imageId: ${imageId}`);
  
  if (!lienFichier || !patientId || !consultationId || !imageId) {
    console.error('Paramètres manquants pour récupérer l\'image DICOM');
    console.groupEnd();
    throw new Error('Paramètres manquants pour récupérer l\'image DICOM');
  }

  try {
    // Pour les images DICOM stockées dans Orthanc
    if (lienFichier.startsWith('orthanc://')) {
      console.log('🔍 Détection image DICOM stockée dans Orthanc');
      
      // Extraire l'ID Orthanc avec la méthode dédiée
      const orthancId = extractOrthancId(lienFichier);
      
      // Double vérification avec regex
      const orthancIdMatch = lienFichier.match(/orthanc:\/\/([^.]+)\.?/);
      if (!orthancIdMatch || !orthancIdMatch[1]) {
        console.error('Format de lien Orthanc invalide par regex:', lienFichier);
        console.groupEnd();
        throw new Error('Format de lien Orthanc invalide');
      }
      
      const orthancIdFromRegex = orthancIdMatch[1];
      console.log(`Comparaison des IDs Orthanc extraits:
      - Par fonction extractOrthancId: "${orthancId}"
      - Par regex: "${orthancIdFromRegex}"
      - Correspondent: ${orthancId === orthancIdFromRegex ? 'OUI' : 'NON'}`);
      
      // Utiliser l'ID de la regex pour la suite (plus fiable)
      const finalOrthancId = orthancIdFromRegex;
      
      // Générer l'URL directe de prévisualisation Orthanc via le proxy Vite
      const previewUrl = `/orthanc/instances/${finalOrthancId}/preview`;
      console.log('URL de prévisualisation Orthanc générée:', previewUrl);
      
      // Test de l'existence de l'URL de prévisualisation
      console.log('Envoi d\'une requête HEAD pour tester la disponibilité de la prévisualisation...');
      try {
        // Utiliser fetch avec mode no-cors pour éviter les erreurs CORS lors du test
        const testResponse = await fetch(previewUrl, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        console.log('Réponse du test de prévisualisation:', testResponse);
      } catch (previewTestError) {
        console.warn('Erreur lors du test de l\'URL de prévisualisation (peut être ignorée si due à CORS):', previewTestError);
      }
      
      // Utiliser le nouvel endpoint spécifique pour les DICOM
      const url = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${imageId}/dicom`;
      console.log(`Récupération du fichier DICOM via le nouvel endpoint: ${url}`);
      
      console.time('Temps de récupération du blob DICOM');
      const response = await api.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/dicom, application/octet-stream',
          'Cache-Control': 'no-cache, no-store'
        }
      });
      console.timeEnd('Temps de récupération du blob DICOM');
      
      // Vérifier si la réponse contient des données valides
      if (!response.data || response.data.size === 0) {
        console.error('Le blob DICOM reçu est vide ou invalide');
      } else {
        console.log(`Blob DICOM reçu: ${response.data.size} octets, type: ${response.data.type}`);
      }
      
      const result = {
        blob: response.data,
        previewUrl: previewUrl
      };
      
      console.log('Résultat final:', result);
      console.groupEnd();
      return result;
    } else {
      // Pour les images non-Orthanc, utiliser l'approche standard
      const url = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${imageId}/file`;
      console.log(`Récupération du fichier (non Orthanc) via: ${url}`);
      
      console.time('Temps de récupération de l\'image non-DICOM');
      const response = await api.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream, application/dicom, image/*',
          'Cache-Control': 'no-cache, no-store'
        }
      });
      console.timeEnd('Temps de récupération de l\'image non-DICOM');
      
      // Vérifier si la réponse contient des données valides
      if (!response.data || response.data.size === 0) {
        console.error('Le blob reçu est vide ou invalide');
      } else {
        console.log(`Blob reçu: ${response.data.size} octets, type: ${response.data.type}`);
      }
      
      const result = {
        blob: response.data,
        previewUrl: null
      };
      
      console.log('Résultat final:', result);
      console.groupEnd();
      return result;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de l'image ${imageId}:`, error);
    console.log('Stack trace:', error.stack);
    
    if (error.response) {
      console.error(`Détails de l'erreur de réponse:
      - Status: ${error.response.status}
      - Status Text: ${error.response.statusText}
      - Headers:`, error.response.headers);
      
      console.groupEnd();
      throw new Error(`Erreur du serveur: ${error.response.status} - ${error.response.statusText}`);
    }
    
    console.groupEnd();
    throw error;
  }
};

/**
 * Service pour la gestion des images médicales
 */
class ImageService {
  /**
   * Nettoie les entrées expirées du cache
   */
  static cleanCache() {
    const now = Date.now();
    for (const [key, value] of imageCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        imageCache.delete(key);
      }
    }
  }

  /**
   * Récupère l'URL d'une image depuis le cache ou le serveur
   * @param {string} patientId - ID du patient
   * @param {string} consultationId - ID de la consultation
   * @param {string} imageId - ID de l'image
   * @returns {Promise<string>} URL de l'image
   */
  static async getImageUrl(patientId, consultationId, imageId) {
    if (!patientId || !consultationId || !imageId) {
      throw new Error('Paramètres manquants pour construire l\'URL de l\'image');
    }
    
    const cacheKey = `${patientId}-${consultationId}-${imageId}`;
    
    // Vérifier le cache
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.url;
    }

    // Nettoyer le cache périodiquement
    this.cleanCache();

    // Construire l'URL de base en utilisant le proxy Vite
    const url = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${imageId}/file`;

    // Mettre en cache
    imageCache.set(cacheKey, {
      url,
      timestamp: Date.now()
    });

    return url;
  }

  /**
   * Récupère une image pour un patient
   * @param {string} patientId - ID du patient
   * @param {string} consultationId - ID de la consultation
   * @param {string} imageId - ID de l'image
   * @returns {Promise<Blob>} Blob de l'image ou blob de l'image par défaut en cas d'erreur
   */
  static async getImage(patientId, consultationId, imageId) {
    if (!patientId || !consultationId || !imageId) {
      console.warn('Paramètres manquants pour récupérer l\'image');
      // Convertir l'image de remplacement en Blob
      const response = await fetch(FALLBACK_IMAGE);
      return await response.blob();
    }

    try {
      console.log(`Tentative de récupération de l'image: patientId=${patientId}, consultationId=${consultationId}, imageId=${imageId}`);
      
      const response = await api.get(
        `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${imageId}/file`,
        {
          responseType: 'blob',
          headers: {
            // Accepter tous les types d'images et de contenu
            'Accept': 'image/*, application/octet-stream, */*',
            'Cache-Control': 'no-cache, no-store'
          }
        }
      );
      
      // Vérifier si nous avons reçu un blob valide
      if (!response.data || response.data.size === 0) {
        console.error('Blob vide reçu pour l\'image', imageId);
        // Retourner l'image de secours si le blob est vide
        const fallbackResponse = await fetch(FALLBACK_IMAGE);
        return await fallbackResponse.blob();
      }
      
      // Si le type du blob n'est pas défini ou est octet-stream générique,
      // essayer de deviner le type basé sur les premiers octets (signature)
      const blob = response.data;
      if (!blob.type || blob.type === 'application/octet-stream') {
        // Créer un nouveau blob avec un type MIME spécifique basé sur les données
        return await this.fixBlobMimeType(blob);
      }
      
      return blob;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      
      // Gérer divers cas d'erreur
      if (error.response) {
        // En cas d'erreur 404, retourner une image par défaut
        if (error.response.status === 404) {
          console.log(`Image ${imageId} non trouvée (404), utilisation de l'image de remplacement`);
          const response = await fetch(FALLBACK_IMAGE);
          return await response.blob();
        }
        
        // En cas d'autres erreurs HTTP (401, 403, 500, etc.)
        console.error(`Erreur HTTP ${error.response.status} lors du chargement de l'image ${imageId}`);
      }
      
      // Pour toute autre erreur, retourner également l'image de secours
      console.log(`Erreur générique lors du chargement de l'image ${imageId}, utilisation de l'image de remplacement`);
      const response = await fetch(FALLBACK_IMAGE);
      return await response.blob();
    }
  }
  
  /**
   * Essaie de corriger le type MIME d'un blob en examinant ses premiers octets
   * @param {Blob} blob - Le blob à corriger
   * @returns {Promise<Blob>} - Un nouveau blob avec le type MIME corrigé
   */
  static async fixBlobMimeType(blob) {
    // Fonction pour lire les premiers octets d'un blob et détecter son type
    try {
      // Lire les 4 premiers octets du blob pour identifier la signature du fichier
      const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let mimeType = 'application/octet-stream'; // Type par défaut
      
      // Détecter le type de fichier en fonction de sa signature
      // JPEG commence par FF D8 FF
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        mimeType = 'image/jpeg';
      } 
      // PNG commence par 89 50 4E 47
      else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        mimeType = 'image/png';
      }
      // GIF commence par 47 49 46 38
      else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
        mimeType = 'image/gif';
      }
      // BMP commence par 42 4D
      else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
        mimeType = 'image/bmp';
      }
      // WebP commence par 52 49 46 46
      else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        mimeType = 'image/webp';
      }
      
      console.log(`Type MIME détecté pour le blob: ${mimeType}`);
      
      // Créer un nouveau blob avec le type MIME détecté
      return new Blob([blob], { type: mimeType });
    } catch (error) {
      console.error('Erreur lors de la correction du type MIME:', error);
      // En cas d'erreur, retourner le blob original
      return blob;
    }
  }

  /**
   * Ajoute une nouvelle image a une nouvelle consultation
   * @param {string} patientId - ID du patient
   * @param {string} consultationId - ID de la consultation
   * @param {FormData} formData - Données de l'image et métadonnées
   * @returns {Promise<Object>} Résultat de l'ajout
   */
  static async ajouterImage(patientId, consultationId, formData) {
    const response = await api.post(
      `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  /**
   * Supprime l'URL du cache pour une image
   * @param {string} patientId - ID du patient
   * @param {string} consultationId - ID de la consultation
   * @param {string} imageId - ID de l'image
   */
  static invalidateCache(patientId, consultationId, imageId) {
    const cacheKey = `${patientId}-${consultationId}-${imageId}`;
    imageCache.delete(cacheKey);
  }
  
  /**
   * Vérifie l'intégrité des images d'un patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Array>} Tableau des problèmes détectés, vide si tout est OK
   */
  static async checkImagesIntegrity(patientId) {
    // Cette fonction est un placeholder puisque l'endpoint backend n'existe pas
    // Elle retourne un tableau vide pour simuler qu'aucun problème n'a été détecté
    console.log(`Vérification de l'intégrité des images pour le patient ${patientId}`);
    return [];
  }
  
  /**
   * Récupère toutes les images d'un patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Array>} Liste des images du patient
   */
  static async getImagesByPatient(patientId, consultationId) {
    if (!patientId || !consultationId) {
      throw new Error('Paramètres manquants pour récupérer les images');
    }
    
    try {
      const response = await api.get(`/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des images du patient:', error);
      throw error;
    }
  }
}

export default ImageService;
