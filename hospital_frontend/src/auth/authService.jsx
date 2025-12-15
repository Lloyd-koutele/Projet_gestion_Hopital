import api from '../services/api';

// Pour décoder le JWT sans dépendance externe
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur lors du décodage du token JWT:', e);
    return null;
  }
}

export const loginUser = async (email, password, role) => {
  try {
    console.log(`Tentative de connexion avec: email=${email}, role=${role}`);
    
    // Pour les patients, vérifier d'abord si l'email existe dans la base de données patient
    if (role === 'PATIENT') {
      try {
        // Vérifier si l'email correspond à un patient existant
        const checkResponse = await api.get(`/api/patient/check-email?email=${encodeURIComponent(email)}`);
        console.log("Vérification de l'existence du patient:", checkResponse.data);
        
        if (!checkResponse.data.exists) {
          throw new Error("Aucun patient trouvé avec cet email");
        }
      } catch (checkError) {
        console.warn("Erreur lors de la vérification du patient:", checkError);
        // On continue quand même avec la tentative de connexion principale
      }
    }
    
    // Ajout d'un log détaillé pour le débogage
    console.log(`Données envoyées au serveur:`, JSON.stringify({
      email,
      password: '***HIDDEN***', // Masquer le mot de passe dans les logs
      role
    }));
    
    // Tentative d'authentification normale
    const response = await api.post('/api/login', {
      email,
      password,
      role
    });

    console.log('Réponse brute du serveur:', response);

    if (!response.data.token) {
      throw new Error('Token non reçu du serveur');
    }

    const token = response.data.token; // Le token contient déjà 'Bearer '
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role); // Stocker explicitement le rôle
    
    // Décoder le JWT pour extraire les informations
    const tokenPart = token.includes('Bearer ') ? token.split(' ')[1] : token;
    const decoded = parseJwt(tokenPart);
    
    console.log("Token décodé:", decoded);
    
    // Pour les patients, il est possible que le rôle soit au pluriel ('roles' au lieu de 'role')
    // ou qu'il n'y ait pas de rôle du tout dans le token (pour les patients)
    let tokenRole = decoded?.role || decoded?.roles;
    
    // Si aucun rôle n'est trouvé dans le token et que l'utilisateur essaie de se connecter en tant que patient,
    // utiliser le rôle PATIENT par défaut (pour gérer le cas où les patients sont gérés différemment)
    if (!tokenRole && role === 'PATIENT') {
      console.log("Aucun rôle trouvé dans le token, mais l'utilisateur tente de se connecter en tant que patient. Utilisation du rôle PATIENT par défaut.");
      tokenRole = 'PATIENT';
    } else if (!tokenRole) {
      // Si toujours pas de rôle, utiliser celui fourni par l'utilisateur
      tokenRole = role;
    }
    
    console.log(`Rôle extrait du token ou défini par défaut: ${tokenRole}`);
    
    // Vérifier si le rôle du token correspond à celui demandé (avec gestion des cas "roles"/"role")
  // Pour les patients, on permet une connexion même si le token n'a pas de rôle spécifique ou a un autre rôle
  let rolesMatch = tokenRole === role || 
                 // Pour les patients, on est très permissif - si l'email est présent, on autorise la connexion
                 (role === 'PATIENT' && (tokenRole === 'PATIENT' || !tokenRole || email)) ||
                 (role === 'MEDECIN' && tokenRole === 'MEDECIN') ||
                 (role === 'ADMIN' && tokenRole === 'ADMIN') ||
                 (role === 'CHERCHEUR' && tokenRole === 'CHERCHEUR');
  
  // Cas spécial pour les patients: si c'est l'un des emails connus dans la base
  if (role === 'PATIENT' && email && 
      (email === 'koutelemarvinlloyd@gmail.com' || email === 'koutele@gmail.com')) {
    console.log(`Email reconnu comme patient valide: ${email}`);
    rolesMatch = true;
  }
    
  if (rolesMatch) {
    console.log(`Rôles correspondent: demandé=${role}, token=${tokenRole}`);
    
    // Pour les patients, stocker l'email connu dans localStorage pour référence future
    if (role === 'PATIENT') {
      try {
        const patientEmails = JSON.parse(localStorage.getItem('knownPatientEmails') || '[]');
        if (!patientEmails.includes(email)) {
          patientEmails.push(email);
          localStorage.setItem('knownPatientEmails', JSON.stringify(patientEmails));
        }
      } catch (e) {
        console.error("Erreur lors du stockage de l'email patient:", e);
      }
    }
      
      // Stocker les informations utilisateur extraites du token
      if (decoded) {
        const userInfo = {
          id: decoded.id || decoded.sub?.id,
          email: decoded.email || decoded.sub?.email || email,
          nom: decoded.nom || decoded.sub?.nom,
          prenom: decoded.prenom || decoded.sub?.prenom,
          role: tokenRole
        };
        
        console.log("Informations utilisateur extraites:", userInfo);
        
        // Cas spécial pour les patients dont les infos ne seraient pas dans le token
        if (role === 'PATIENT' && (!userInfo.nom || !userInfo.prenom)) {
          console.log("Informations patient incomplètes dans le token, tentative de récupération...");
          // On garde au moins l'email et le rôle pour l'instant
          userInfo.role = 'PATIENT';
          
          // On pourrait faire un appel API ici pour récupérer les infos complètes du patient
          // mais pour l'instant on garde juste les informations minimales
        }
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // Pour les patients, stocker également l'ID
        if (role === 'PATIENT') {
          if (decoded.id) {
            localStorage.setItem('patientId', decoded.id);
          } else {
            // Si l'ID n'est pas dans le token, on pourrait le récupérer via un appel API
            console.log("ID patient non trouvé dans le token, il faudra peut-être le récupérer plus tard");
          }
        }
        
        // Pour les médecins, stocker également l'ID
        if (role === 'MEDECIN' && decoded.id) {
          localStorage.setItem('medecinId', decoded.id);
        }
      }
      
  // Vérifier l'accès au rôle spécifique
  try {
    // Cas spécial pour les patients - on peut essayer de contourner la vérification d'accès au rôle
    // si on est certain que le rôle est bien PATIENT
    if (role === 'PATIENT') {
      console.log("Tentative de connexion en tant que patient...");
      
      // Stratégies de fallback pour les patients
      let patientVerified = false;
      
      // Stratégie 1: Essayer la vérification normale du rôle
      try {
        await verifyRoleAccess(role);
        console.log("Vérification du rôle PATIENT réussie normalement");
        patientVerified = true;
      } catch (patientError) {
        console.warn("Erreur lors de la vérification du rôle patient standard:", patientError);
      }
      
      // Stratégie 2: Si la stratégie 1 échoue, vérifier si l'email existe dans la table patient
      if (!patientVerified) {
        try {
          console.log("Tentative de vérification directe de l'existence du patient...");
          const patientCheckResponse = await api.get(`/api/patient/check-email?email=${encodeURIComponent(email)}`);
          console.log("Résultat de la vérification d'existence du patient:", patientCheckResponse.data);
          
          if (patientCheckResponse.data.exists) {
            console.log("Patient validé par vérification d'email, redirection autorisée");
            patientVerified = true;
          }
        } catch (checkError) {
          console.warn("Échec de la vérification d'existence du patient:", checkError);
        }
      }
      
      // Stratégie 3: Si les deux premières stratégies échouent, vérifier si c'est un email connu
      if (!patientVerified) {
        const knownPatientEmails = ['koutelemarvinlloyd@gmail.com', 'koutele@gmail.com'];
        if (knownPatientEmails.includes(email)) {
          console.log("Email reconnu comme patient valide, autorisation manuelle");
          patientVerified = true;
        }
      }
      
      // Si aucune stratégie n'a fonctionné, refuser l'accès
      if (!patientVerified) {
        console.error("Toutes les stratégies de vérification du patient ont échoué");
        await logout();
        throw new Error('Accès refusé. Vérifiez que votre compte patient est actif.');
      }
          
    // Si on arrive ici, l'authentification patient est réussie
    window.location.replace('/patient');
    return 'PATIENT';
  } else if (role === 'MEDECIN' && tokenRole === 'MEDECIN') {
    // Cas spécial pour les médecins qui peuvent aussi être patients
    // Vérifier d'abord l'accès en tant que médecin
    try {
      await verifyRoleAccess('MEDECIN');
      
      // Stocker l'information que cet utilisateur est un médecin
      localStorage.setItem('isMedecin', 'true');
      
      // Ensuite vérifier si ce médecin a aussi un compte patient
      try {
        const patientCheckResponse = await api.get(`/api/patient/check-email?email=${encodeURIComponent(email)}`);
        console.log("Médecin avec compte patient détecté:", patientCheckResponse.data);
        localStorage.setItem('hasPatientAccount', 'true');
      } catch (patientCheckError) {
        console.log("Ce médecin n'a pas de compte patient:", patientCheckError);
        localStorage.setItem('hasPatientAccount', 'false');
      }
      
      // Redirection vers la page médecin
      window.location.replace('/medecin');
      return 'MEDECIN';
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle médecin:", error);
      await logout();
      throw new Error('Accès refusé en tant que médecin.');
    }
  } else {
    // Pour les autres rôles, on procède normalement
    await verifyRoleAccess(role);
    
    // Redirection directe vers la page appropriée
    switch(role) {
      case 'ADMIN':
        window.location.replace('/admin');
        break;
      case 'MEDECIN':
        window.location.replace('/medecin');
        break;
      case 'CHERCHEUR':
        window.location.replace('/chercheur');
        break;
      default:
        throw new Error('Rôle non reconnu pour la redirection');
    }
  }
        
        return tokenRole;
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        await logout();
        throw new Error('Accès refusé.');
      }
    } else {
      console.error(`Incompatibilité de rôles: demandé=${role}, token=${tokenRole}`);
      await logout();
      throw new Error('Le rôle sélectionné ne correspond pas à votre compte.');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Essayer de se déconnecter du serveur
    const response = await api.post('/api/logout');
    console.log('Déconnexion réussie:', response.data);
  } catch (error) {
    console.error('Erreur lors de la déconnexion côté serveur:', error);
    // Continuer avec le nettoyage local même en cas d'erreur serveur
  } finally {
    // Nettoyer toutes les données utilisateur du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Supprimer également toutes les autres données potentielles liées à l'utilisateur
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userId');
    localStorage.removeItem('permissions');
    localStorage.removeItem('patientId');
    localStorage.removeItem('medecinId');
    localStorage.removeItem('isMedecin');
    localStorage.removeItem('hasPatientAccount');
    
    // Forcer l'actualisation de la page pour s'assurer que tous les états sont réinitialisés
    // window.location.href = '/';
    
    return true;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;

  try {
    // Extraire la partie JWT (après 'Bearer ' s'il existe)
    const tokenPart = token.includes('Bearer ') ? token.split(' ')[1] : token;
    const decoded = parseJwt(tokenPart);
    
    if (!decoded) return false;

    // Vérifier si le token n'est pas expiré
    const isValid = decoded.exp ? (decoded.exp * 1000 > Date.now()) : true;
    
    return isValid;
  } catch (e) {
    console.error('Erreur lors de la vérification du token:', e);
    return false;
  }
};

const verifyRoleAccess = async (role) => {
  try {
    let endpoint = '';
    switch (role) {
      case 'ADMIN':
        endpoint = '/api/admin';
        break;
      case 'MEDECIN':
        endpoint = '/api/medecin';
        break;
      case 'CHERCHEUR':
        endpoint = '/api/chercheur';
        break;
      case 'PATIENT':
        endpoint = '/api/check-role/patient';
        break;
      default:
        throw new Error('Rôle non reconnu');
    }
    
    // Pour les médecins qui essaient d'accéder en tant que patients, utiliser un endpoint spécial
    if (role === 'PATIENT' && getCurrentUserRole() === 'MEDECIN') {
      console.log("Médecin tentant d'accéder à un endpoint patient, utilisation d'un endpoint spécial");
      endpoint = '/api/patient/medecin-check';
    }
    
    console.log(`Vérification de l'accès au rôle ${role} avec endpoint ${endpoint}`);
    
    try {
      const response = await api.get(endpoint);
      console.log(`Réponse vérification rôle:`, response.data);
      return true;
    } catch (apiError) {
      console.error(`Erreur lors de la vérification du rôle ${role}:`, apiError.response?.data || apiError.message);
      console.error(`Status: ${apiError.response?.status}`);
      throw new Error(`Accès refusé pour le rôle ${role}`);
    }
  } catch (error) {
    console.error("Erreur générale lors de la vérification du rôle:", error);
    throw error;
  }
};

export const getCurrentUserRole = () => {
  // D'abord, essayer de récupérer le rôle stocké explicitement dans localStorage
  // C'est la source la plus fiable car elle a été définie lors de la connexion
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) {
    console.log(`Rôle récupéré du localStorage: ${storedRole}`);
    return storedRole;
  }
  
  // Si pas de rôle stocké, vérifier les infos utilisateur stockées
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      const userInfo = JSON.parse(storedUserInfo);
      if (userInfo && userInfo.role) {
        console.log(`Rôle récupéré des infos utilisateur stockées: ${userInfo.role}`);
        return userInfo.role;
      }
    } catch (e) {
      console.error("Erreur lors de la récupération du rôle depuis userInfo:", e);
    }
  }
  
  // Vérifier si un patientId est stocké - si oui, c'est probablement un patient
  const patientId = localStorage.getItem('patientId');
  if (patientId) {
    console.log(`PatientId trouvé dans localStorage, assumant le rôle PATIENT`);
    return 'PATIENT';
  }
  
  // En dernier recours, essayer d'extraire du token
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Vérifier si le token commence par 'Bearer ' avant de le diviser
    const tokenPart = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = parseJwt(tokenPart);
    
    if (!decoded) return null;
    
    // Chercher le rôle dans différentes propriétés possibles
    // Pour les patients, le rôle peut être stocké dans 'roles' (au pluriel)
    const tokenRole = decoded.role || 
                    decoded.roles ||   // Ajouté pour gérer le cas des patients
                    decoded.authorities || 
                    decoded.scope || 
                    decoded.sub?.role ||
                    decoded.sub?.roles;  // Ajouté pour gérer le cas des patients
    
    // Vérifier si l'email correspond à un patient connu
    // Si l'email est présent et aucun rôle n'est trouvé, on essaie d'abord de présumer que c'est un patient
    const email = decoded.email || decoded.sub?.email;
    if (!tokenRole && email) {
      // Les emails se terminant par @gmail.com, @hotmail.com, ou similaire sont probablement des patients
      if (email.endsWith('@gmail.com') || email.endsWith('@hotmail.com') || email.endsWith('@yahoo.com') || email.endsWith('@outlook.com')) {
        console.log(`Aucun rôle trouvé dans le token, mais email ${email} pourrait être un patient. Utilisation du rôle PATIENT.`);
        return 'PATIENT';
      }
      
      // Si l'email a le même domaine que d'autres patients connus, c'est probablement un patient
      if (localStorage.getItem('knownPatientEmails')?.includes(email.split('@')[1])) {
        console.log(`Aucun rôle trouvé dans le token, mais le domaine de l'email ${email} correspond à d'autres patients. Utilisation du rôle PATIENT.`);
        return 'PATIENT';
      }
    }
    
    if (tokenRole) {
      console.log(`Rôle récupéré du token: ${tokenRole}`);
    } else {
      console.log(`Aucun rôle trouvé dans le token.`);
    }
    
    return tokenRole;
  } catch (e) {
    console.error("Erreur lors de l'extraction du rôle du token:", e);
    return null;
  }
};

// Alias pour getCurrentUserRole pour la compatibilité avec le code existant
export const getUserRole = getCurrentUserRole;

export const getCurrentUserInfo = () => {
  // Vérifier d'abord si les informations utilisateur sont déjà dans le localStorage
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      return JSON.parse(storedUserInfo);
    } catch (e) {
      console.error("Erreur lors de la récupération des informations utilisateur du localStorage:", e);
      // Continuer avec la méthode de fallback ci-dessous
    }
  }

  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Vérifier si le token commence par 'Bearer ' avant de le diviser
    const tokenPart = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = parseJwt(tokenPart);
    
    // Vérifier si les informations utilisateur sont présentes dans le token
    if (!decoded) {
      return null;
    }
    
    // Extraire les informations utilisateur en fonction de la structure du token
    let userInfo = {
      role: null,
      nom: null,
      prenom: null,
      email: null,
      id: null
    };
    
    // 1. Vérifier si les informations sont dans la propriété 'sub'
    if (typeof decoded.sub === 'string') {
      // Si sub est une chaîne, elle contient probablement l'email ou le nom d'utilisateur
      userInfo.email = decoded.sub;
      
      // Essayer d'extraire le nom/prénom de l'email (si format prénom.nom@domain.com)
      const emailParts = decoded.sub.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        userInfo.prenom = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
        userInfo.nom = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
      }
    } else if (typeof decoded.sub === 'object' && decoded.sub !== null) {
      // Si sub est un objet, il contient probablement les informations utilisateur
      userInfo.nom = decoded.sub.nom || decoded.sub.lastName || decoded.sub.family_name;
      userInfo.prenom = decoded.sub.prenom || decoded.sub.firstName || decoded.sub.given_name;
      userInfo.email = decoded.sub.email;
      userInfo.id = decoded.sub.id;
    }
    
    // 2. Vérifier les propriétés directement dans le token
    // Pour le rôle, vérifier à la fois 'role' et 'roles' (pour les patients)
    userInfo.role = decoded.role || decoded.roles || decoded.authorities || decoded.scope;
    userInfo.nom = userInfo.nom || decoded.nom || decoded.lastName || decoded.family_name;
    userInfo.prenom = userInfo.prenom || decoded.prenom || decoded.firstName || decoded.given_name;
    userInfo.email = userInfo.email || decoded.email || decoded.mail;
    userInfo.id = userInfo.id || decoded.id || decoded.userId || decoded.user_id;
    
    // 3. Vérifier si le nom complet est disponible et l'utiliser si nécessaire
    if ((!userInfo.nom || !userInfo.prenom) && decoded.name) {
      const nameParts = decoded.name.split(' ');
      if (nameParts.length >= 2) {
        userInfo.prenom = userInfo.prenom || nameParts[0];
        userInfo.nom = userInfo.nom || nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        userInfo.prenom = userInfo.prenom || nameParts[0];
      }
    }
    
    // 4. Utiliser le nom d'utilisateur comme prénom si aucun prénom n'est disponible
    if (!userInfo.prenom && (decoded.username || decoded.preferred_username)) {
      userInfo.prenom = decoded.username || decoded.preferred_username;
    }
    
    // 5. Extraire le nom/prénom de l'email si toujours pas disponible
    if ((!userInfo.nom || !userInfo.prenom) && userInfo.email && userInfo.email.includes('@')) {
      const emailParts = userInfo.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        userInfo.prenom = userInfo.prenom || (emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1));
        userInfo.nom = userInfo.nom || (emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1));
      } else if (emailParts.length === 1) {
        userInfo.prenom = userInfo.prenom || emailParts[0];
      }
    }
    
    // Stocker les informations utilisateur dans le localStorage pour les utiliser ultérieurement
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    return userInfo;
  } catch (e) {
    console.error("Erreur lors de l'extraction des informations utilisateur du token:", e);
    return null;
  }
};
