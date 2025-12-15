/**
 * Utilitaires pour la manipulation des dates
 */

/**
 * Formatage d'une date en format localisé
 * @param {string|Date} date - La date à formater
 * @param {Object} options - Options de formatage (voir options de Intl.DateTimeFormat)
 * @returns {string} Date formatée
 */
export const formatDateFr = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return 'Date invalide';
  }
  
  // Format français par défaut: JJ/MM/AAAA
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Formatage d'une date en format localisé avec options personnalisées
 * @param {string|Date} date - La date à formater
 * @param {Object} options - Options de formatage (voir options de Intl.DateTimeFormat)
 * @returns {string} Date formatée
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return 'Date invalide';
  }
  
  const defaultOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('fr-FR', mergedOptions).format(dateObj);
};

/**
 * Formate une date et une heure
 * @param {string|Date} date - La date à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return formatDate(date, { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatage d'une date en format relatif (il y a X jours, etc.)
 * @param {string|Date} date - La date à formater
 * @returns {string} Date formatée en format relatif
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return 'Date invalide';
  }
  
  const now = new Date();
  const diffTime = now - dateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes === 0) {
        return "À l'instant";
      }
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `Il y a ${diffMonths} mois`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
  }
};

/**
 * Convertit une chaîne de date en objet Date
 * @param {string} dateString - La chaîne de date à convertir
 * @returns {Date} Objet Date
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Tente de parser la date
  const date = new Date(dateString);
  
  // Vérifie si la date est valide
  if (isNaN(date.getTime())) {
    console.error('Date invalide:', dateString);
    return null;
  }
  
  return date;
};

/**
 * Obtient l'âge à partir d'une date de naissance
 * @param {string|Date} birthDate - La date de naissance
 * @returns {number} L'âge en années
 */
export const getAge = (birthDate) => {
  if (!birthDate) return null;
  
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  if (isNaN(birthDateObj.getTime())) {
    console.error('Date de naissance invalide:', birthDate);
    return null;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Compare deux dates et retourne la différence en jours
 * @param {string|Date} date1 - Première date
 * @param {string|Date} date2 - Deuxième date
 * @returns {number} Différence en jours
 */
export const getDaysDifference = (date1, date2) => {
  if (!date1 || !date2) return null;
  
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2;
  
  if (isNaN(date1Obj.getTime()) || isNaN(date2Obj.getTime())) {
    console.error('Dates invalides:', date1, date2);
    return null;
  }
  
  // Calcul de la différence en jours
  const diffTime = Math.abs(date2Obj - date1Obj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} Vrai si la date est aujourd'hui
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return false;
  }
  
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear();
};

/**
 * Vérifie si une date est dans le futur
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} Vrai si la date est dans le futur
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return false;
  }
  
  const now = new Date();
  
  return dateObj > now;
};

/**
 * Alias pour isFutureDate - vérifie si une date est dans le futur
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} Vrai si la date est dans le futur
 */
export const isDateInFuture = isFutureDate;

/**
 * Formatage d'une durée en heures et minutes
 * @param {number} minutes - Nombre de minutes
 * @returns {string} Durée formatée
 */
export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return '';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minute${mins > 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} heure${hours > 1 ? 's' : ''} et ${mins} minute${mins > 1 ? 's' : ''}`;
  }
};

/**
 * Ajoute des jours à une date
 * @param {string|Date} date - La date de départ
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date} Nouvelle date
 */
export const addDays = (date, days) => {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return null;
  }
  
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Formate une date au format ISO (YYYY-MM-DD)
 * @param {string|Date} date - La date à formater
 * @returns {string} Date au format ISO
 */
export const formatISODate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Date invalide:', date);
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
