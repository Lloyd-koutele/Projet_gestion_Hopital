import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUserRole, logout, getCurrentUserInfo } from '../auth/authService';

function Navbar() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Vérifier l'état d'authentification à intervalles réguliers
  useEffect(() => {
    // Fonction pour vérifier l'authentification et mettre à jour l'état
    const checkAuthStatus = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        // Récupérer les informations utilisateur et le rôle
        const info = getCurrentUserInfo();
        const role = getCurrentUserRole();
        
        console.log('Informations utilisateur récupérées dans Navbar:', info);
        console.log('Rôle utilisateur récupéré dans Navbar:', role);
        
        setUserInfo(info);
        setUserRole(role);
      } else {
        // Réinitialiser les informations utilisateur si non authentifié
        setUserInfo(null);
        setUserRole(null);
      }
    };
    
    // Vérifier immédiatement au chargement du composant
    checkAuthStatus();
    
    // Vérifier périodiquement mais moins fréquemment (toutes les 5 minutes)
    // Cela réduit les risques de conflit avec d'autres processus d'authentification
    const intervalId = setInterval(checkAuthStatus, 300000); // 5 minutes = 300000 ms
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);
  
  // La vérification des pages protégées est maintenant gérée par le composant PrivateRoute dans App.jsx
  // Nous n'avons plus besoin de cette logique ici pour éviter les redirections en boucle
  // Cette suppression résout le problème de redirection automatique après connexion réussie

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUserInfo(null);
    setUserRole(null);
    navigate('/');
  };

  if (!authenticated) {
    return null;
  }

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '1rem',
      color: 'white'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>
            Gestion Hôpital
          </Link>
        </div>
        
        {/* Menu de navigation selon le rôle */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {userRole === 'MEDECIN' && (
            <>
              <Link to="/medecin" style={{ color: 'white', textDecoration: 'none' }}>Tableau de bord</Link>
              <Link to="/medecin/rendez-vous" style={{ color: 'white', textDecoration: 'none' }}>Rendez-vous</Link>
            </>
          )}
          {userRole === 'PATIENT' && (
            <>
              <Link to="/patient" style={{ color: 'white', textDecoration: 'none' }}>Tableau de bord</Link>
              <Link to="/patient/dossier" style={{ color: 'white', textDecoration: 'none' }}>Mon dossier</Link>
              <Link to="/patient/rendez-vous" style={{ color: 'white', textDecoration: 'none' }}>Mes rendez-vous</Link>
              <Link to="/patient/acces" style={{ color: 'white', textDecoration: 'none' }}>Gestion des accès</Link>
            </>
          )}
          {userRole === 'ADMIN' && (
            <>
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Administration</Link>
            </>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#ecf0f1' }}>
            {userRole === 'MEDECIN' && (
              <>
                <span style={{ fontWeight: 'bold' }}>Médecin :</span> Dr. {userInfo?.email?.split('@')[0] || 'Utilisateur'}
              </>
            )}
            {userRole === 'ADMIN' && (
              <>
                <span style={{ fontWeight: 'bold' }}>Administrateur :</span> {userInfo?.email?.split('@')[0] || 'Utilisateur'}
              </>
            )}
            {userRole === 'CHERCHEUR' && (
              <>
                <span style={{ fontWeight: 'bold' }}>Chercheur :</span> {userInfo?.email?.split('@')[0] || 'Utilisateur'}
              </>
            )}
            {userRole === 'PATIENT' && (
              <>
                <span style={{ fontWeight: 'bold' }}>Patient :</span> {userInfo?.email?.split('@')[0] || 'Utilisateur'}
              </>
            )}
            {!userRole && 'Utilisateur'}
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
