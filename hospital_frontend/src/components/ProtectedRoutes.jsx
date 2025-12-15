import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUserRole } from '../auth/authService';

/**
 * Composant pour protéger les routes en fonction du rôle utilisateur
 * Vérifie l'authentification et les autorisations avant d'afficher les pages
 * @param {Array} allowedRoles - Liste des rôles autorisés pour accéder à cette route
 * @returns {JSX.Element} Outlet (contenu de la route) ou redirection
 */
const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const isAuth = isAuthenticated();
        if (!isAuth) {
          setAuthorized(false);
          return;
        }

        // Si aucun rôle spécifique n'est requis, autoriser l'accès
        if (allowedRoles.length === 0) {
          setAuthorized(true);
          return;
        }

        // Vérifier si l'utilisateur a un rôle autorisé
        const userRole = getCurrentUserRole();
        const hasRequiredRole = allowedRoles.includes(userRole);

        console.log('Vérification des rôles:', {
          userRole,
          allowedRoles,
          hasRequiredRole
        });

        setAuthorized(hasRequiredRole);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #3498db', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              margin: '0 auto 20px', 
              animation: 'spin 1s linear infinite' 
            }} 
          />
          <p>Vérification des autorisations...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!authorized) {
    // Rediriger vers la page de connexion si non authentifié
    if (!isAuthenticated()) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Rediriger vers une page d'accès refusé si authentifié mais non autorisé
    return <Navigate to="/acces-refuse" state={{ from: location }} replace />;
  }

  // Si autorisé, afficher le contenu de la route
  return <Outlet />;
};

export default ProtectedRoutes;
