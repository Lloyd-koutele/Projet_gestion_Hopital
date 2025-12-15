/**
 * Utilitaires de recherche et implémentation de l'algorithme TF-IDF
 * pour une recherche avancée des entités dans l'application
 */

/**
 * Calcule le Term Frequency (TF) pour un terme dans un document
 * @param {string} term - Le terme à rechercher
 * @param {string} doc - Le document dans lequel chercher
 * @returns {number} - La fréquence du terme dans le document
 */
export const calculateTF = (term, doc) => {
  if (!term || !doc) return 0;
  
  // Normalisation: convertir en minuscules et supprimer les accents
  const normalizedTerm = normalizeString(term);
  const normalizedDoc = normalizeString(doc);
  
  // Compter les occurrences du terme
  const regex = new RegExp(escapeRegExp(normalizedTerm), 'gi');
  const matches = normalizedDoc.match(regex);
  
  // Si aucune occurrence, retourner 0
  if (!matches) return 0;
  
  // Calculer TF: nombre d'occurrences / nombre total de mots
  const words = normalizedDoc.split(/\s+/).filter(word => word.length > 0);
  return matches.length / words.length;
};

/**
 * Calcule l'Inverse Document Frequency (IDF) pour un terme dans une collection de documents
 * @param {string} term - Le terme à rechercher
 * @param {string[]} documents - La collection de documents
 * @returns {number} - L'IDF du terme
 */
export const calculateIDF = (term, documents) => {
  if (!term || !documents || documents.length === 0) return 0;
  
  // Normalisation du terme
  const normalizedTerm = normalizeString(term);
  
  // Compter le nombre de documents contenant le terme
  const docsWithTerm = documents.filter(doc => {
    const normalizedDoc = normalizeString(doc);
    const regex = new RegExp(escapeRegExp(normalizedTerm), 'i');
    return regex.test(normalizedDoc);
  });
  
  // Calculer IDF: log(nombre total de documents / nombre de documents contenant le terme)
  return Math.log(documents.length / (docsWithTerm.length || 1));
};

/**
 * Calcule le score TF-IDF pour un terme dans un document par rapport à une collection
 * @param {string} term - Le terme à rechercher
 * @param {string} doc - Le document dans lequel chercher
 * @param {string[]} documents - La collection de documents
 * @returns {number} - Le score TF-IDF
 */
export const calculateTFIDF = (term, doc, documents) => {
  const tf = calculateTF(term, doc);
  const idf = calculateIDF(term, documents);
  return tf * idf;
};

/**
 * Échappe les caractères spéciaux dans une expression régulière
 * @param {string} string - La chaîne à échapper
 * @returns {string} - La chaîne échappée
 */
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Normalise une chaîne de caractères (minuscules, sans accents)
 * @param {string} string - La chaîne à normaliser
 * @returns {string} - La chaîne normalisée
 */
export const normalizeString = (string) => {
  if (!string) return '';
  
  return string
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Fonction utilitaire pour découper un texte en termes (tokens)
 * @param {string} text - Le texte à tokeniser
 * @returns {string[]} - Les tokens extraits
 */
export const tokenize = (text) => {
  if (!text) return [];
  
  // Normaliser et découper en mots
  return normalizeString(text)
    .split(/\s+/)
    .filter(word => word.length > 0)
    .filter(word => !isStopWord(word));
};

/**
 * Liste de mots vides (stopwords) en français
 */
const frenchStopWords = [
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'aux',
  'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses',
  'notre', 'votre', 'leur', 'nos', 'vos', 'leurs', 'je', 'tu', 'il', 'elle', 'nous',
  'vous', 'ils', 'elles', 'qui', 'que', 'quoi', 'dont', 'où', 'par', 'pour', 'en',
  'avec', 'sans', 'à', 'sur', 'sous', 'dans', 'entre', 'mais', 'donc', 'car', 'ni',
  'est', 'sont', 'suis', 'es'
];

/**
 * Vérifie si un mot est un mot vide (stopword)
 * @param {string} word - Le mot à vérifier
 * @returns {boolean} - Vrai si c'est un mot vide
 */
export const isStopWord = (word) => {
  if (!word) return false;
  
  const normalizedWord = normalizeString(word);
  return frenchStopWords.includes(normalizedWord);
};

/**
 * Recherche des entités dans une collection selon des termes de recherche
 * et renvoie les résultats triés par pertinence (score TF-IDF)
 * 
 * @param {Object[]} entities - Collection d'entités à rechercher
 * @param {string} searchTerm - Terme de recherche
 * @param {Object} options - Options de recherche
 * @param {string[]} options.fields - Champs dans lesquels rechercher
 * @param {Object} options.weights - Poids pour chaque champ (facultatif)
 * @returns {Object[]} - Entités triées par pertinence
 */
export const searchEntities = (entities, searchTerm, options = {}) => {
  if (!entities || !searchTerm || searchTerm.trim() === '') {
    return entities;
  }
  
  const { fields = [], weights = {} } = options;
  
  if (fields.length === 0) {
    return entities;
  }
  
  // Préparer les termes de recherche
  const searchTerms = tokenize(searchTerm);
  
  if (searchTerms.length === 0) {
    return entities;
  }
  
  // Calculer les scores pour chaque entité
  const scoredEntities = entities.map(entity => {
    let totalScore = 0;
    
    // Pour chaque champ à rechercher
    fields.forEach(field => {
      // Récupérer la valeur du champ (peut être imbriquée comme "user.name")
      const fieldValue = field.split('.').reduce((obj, key) => 
        obj && obj[key] !== undefined ? obj[key] : '', entity);
      
      if (!fieldValue) return;
      
      // Pour chaque terme de recherche
      searchTerms.forEach(term => {
        // Préparer tous les documents pour calculer l'IDF
        const allFieldValues = entities.map(e => {
          return field.split('.').reduce((obj, key) => 
            obj && obj[key] !== undefined ? obj[key] : '', e);
        }).filter(Boolean);
        
        // Calculer le score TF-IDF pour ce terme dans ce champ
        const tfidfScore = calculateTFIDF(term, fieldValue, allFieldValues);
        
        // Appliquer le poids du champ si défini
        const fieldWeight = weights[field] || 1;
        
        totalScore += tfidfScore * fieldWeight;
      });
    });
    
    return {
      entity,
      score: totalScore
    };
  });
  
  // Trier par score décroissant et filtrer les entités avec un score de 0
  return scoredEntities
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.entity,
      relevanceScore: item.score
    }));
};

/**
 * Extrait le meilleur contexte autour d'une correspondance dans un texte
 * @param {string} text - Le texte complet
 * @param {string} match - Le terme correspondant
 * @param {number} contextSize - Nombre de caractères avant/après la correspondance
 * @returns {string} - Le contexte avec mise en évidence de la correspondance
 */
export const extractMatchContext = (text, match, contextSize = 30) => {
  if (!text || !match) return text;
  
  const normalizedText = text;
  const normalizedMatch = match;
  
  const index = normalizedText.toLowerCase().indexOf(normalizedMatch.toLowerCase());
  
  if (index === -1) return text;
  
  const start = Math.max(0, index - contextSize);
  const end = Math.min(normalizedText.length, index + normalizedMatch.length + contextSize);
  
  let context = '';
  
  if (start > 0) {
    context += '...';
  }
  
  context += normalizedText.substring(start, index);
  context += `<strong>${normalizedText.substring(index, index + normalizedMatch.length)}</strong>`;
  context += normalizedText.substring(index + normalizedMatch.length, end);
  
  if (end < normalizedText.length) {
    context += '...';
  }
  
  return context;
};
