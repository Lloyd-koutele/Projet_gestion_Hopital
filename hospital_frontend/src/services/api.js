import axios from 'axios';
import { isAuthenticated } from '../auth/authService';

// Configuration avec chemin relatif pour utiliser le proxy Vite
const api = axios.create({
  baseURL: '/',  // Le proxy Vite s'occupe du reste
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Configuration spécifique pour les requêtes d'images standard
const imageApi = axios.create({
  baseURL: '/api',  // Préfixe pour utiliser le proxy Vite correctement
  responseType: 'blob',
  headers: {
    'Accept': 'image/*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 30000, // 30 secondes
  withCredentials: true
});

// Configuration spécifique pour les images DICOM
const dicomApi = axios.create({
  baseURL: '/api',  // Préfixe pour utiliser le proxy Vite correctement
  responseType: 'arraybuffer',
  headers: {
    'Accept': 'application/dicom',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 60000 // 60 secondes pour les fichiers DICOM plus volumineux
});

// Liste des endpoints accessibles sans authentification
const publicEndpoints = ['/api/login', '/api/register', '/api/logout', '/api/error'];

// Intercepteur de requêtes
api.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint)) || 
                            config.url.includes('/api/error') || 
                            config.url.includes('/error');

    if (!isPublicEndpoint && !isAuthenticated()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      alert('Votre session a expiré. Veuillez vous reconnecter.');
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    const token = localStorage.getItem('token');
    if (token && isAuthenticated()) {
      // Le token du backend contient déjà 'Bearer '
      config.headers.Authorization = token;
    }

    // Log toujours activé pour faciliter le débogage
    // Nous supprimons la vérification de process.env pour éviter l'erreur "process is not defined"
    console.log('➡️ Requête envoyée:', {
      url: config.url,
      method: config.method,
      headers: { ...config.headers, Authorization: config.headers.Authorization ? '[TOKEN MASQUÉ]' : undefined }
    });

    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponses
api.interceptors.response.use(
  (response) => {
    // Log toujours activé pour faciliter le débogage
    // Nous supprimons la vérification de process.env pour éviter l'erreur "process is not defined"
    console.log('✅ Réponse reçue:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');

      const isPublic = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      if (!isPublic) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.href = '/login';
      }

      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    if (status === 403) {
      alert('Vous n\'avez pas les droits nécessaires pour cette action.');
      return Promise.reject(new Error('Accès refusé.'));
    }

    if (status >= 500) {
      alert('Erreur serveur. Veuillez réessayer plus tard.');
    }

    return Promise.reject(error);
  }
);

// Intercepteurs pour les images standards
imageApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur de chargement d\'image:', error);
    
    // Logs détaillés pour le débogage
    if (error.response) {
      console.error('Réponse d\'erreur:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('Requête sans réponse:', error.request);
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        case 403:
          throw new Error('Accès non autorisé à l\'image');
        case 404:
          throw new Error('Image non trouvée');
        default:
          throw new Error('Erreur lors du chargement de l\'image');
      }
    }
    throw error;
  }
);

// Intercepteurs pour les images DICOM
dicomApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur de chargement d\'image DICOM:', error);
    if (error.response) {
      switch (error.response.status) {
        case 404:
          throw new Error('Image DICOM non trouvée');
        case 403:
          throw new Error('Accès non autorisé à l\'image DICOM');
        default:
          throw new Error('Erreur lors du chargement de l\'image DICOM');
      }
    }
    throw error;
  }
);

// Configuration de l'authentification pour les deux APIs d'images
[imageApi, dicomApi].forEach(api => {
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated()) {
        // Le token du backend contient déjà 'Bearer '
        config.headers.Authorization = token;
        // Définir le bon Content-Type en fonction du type de réponse attendu
        config.headers['Content-Type'] = config.responseType === 'blob' ? 'image/*' : 'application/json';
      }
      return config;
    },
    error => Promise.reject(error)
  );
});

// Fonction utilitaire pour récupérer le token d'authentification
const getToken = () => {
  return localStorage.getItem('token');
};

export default api;
export { imageApi, dicomApi, getToken };
