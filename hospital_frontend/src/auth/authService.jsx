import api from '../services/api';

// Décodage JWT (conservé mais compacté)
const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
};

export const loginUser = async (email, password, role) => {
  try {
    // 1. Authentification API
    const { data } = await api.post('/login', { email, password, role });
    if (!data.token) throw new Error('Token non reçu');

    const token = data.token;
    const decoded = parseJwt(token);

    // Normalisation du rôle venant du token (supporte 'role' ou 'roles')
    const tokenRole = decoded?.role || decoded?.roles || role;

    // 3. Construction et stockage de l'objet utilisateur unifié
    const userInfo = {
      id: decoded.id || decoded.sub?.id,
      email: decoded.email || decoded.sub?.email || email,
      nom: decoded.nom || decoded.sub?.nom,
      prenom: decoded.prenom || decoded.sub?.prenom,
      role: tokenRole
    };

    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // 4. Redirection automatique via une Map
    const routes = {
      ADMIN: '/admin',
      MEDECIN: '/medecin',
      CHERCHEUR: '/chercheur',
      PATIENT: '/patient'
    };

    if (routes[role]) window.location.replace(routes[role]);

    return tokenRole;

  } catch (error) {
    console.error('Erreur connexion:', error);
    await logout(); // Nettoyage en cas d'erreur
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/logout');
  }
  catch (e) {
  }
  localStorage.clear();
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const decoded = parseJwt(token);
  // Vérifie l'expiration (si présente)
  return decoded ? (!decoded.exp || decoded.exp * 1000 > Date.now()) : false;
};

// Récupération simple : on lit le localStorage (plus besoin de parser le token à chaque fois)
export const getCurrentUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo'));
  } catch { return null; }
};

export const getCurrentUserRole = () => {
  return getCurrentUserInfo()?.role || null;
};

// Alias pour compatibilité
export const getUserRole = getCurrentUserRole;