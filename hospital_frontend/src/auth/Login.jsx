// src/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './authService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Tentative de connexion avec:', { email, password, role });

    if (!email || !password || !role) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const userRole = await loginUser(email, password, role);
      console.log('Connexion réussie, rôle:', userRole);

      // La redirection est maintenant gérée directement dans la fonction loginUser
      console.log('Connexion réussie, la redirection est gérée par le service d\'authentification');
      
      // Pas besoin de redirection ici, elle est gérée par loginUser
    } catch (error) {
      console.error('Erreur de connexion:', error);
      console.error('Détails:', error.response?.data);
      
      const errorMessage = error.response?.data?.message ||
        (error.message === 'Rôle non autorisé' ? "Le rôle sélectionné ne correspond pas à votre compte." :
        error.message === 'Network Error' ? "Impossible de se connecter au serveur. Vérifiez votre connexion." :
        "Email ou mot de passe invalide.");
      
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">Connectez-vous pour accéder à votre espace</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select 
              id="role"
              className="form-control"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">-- Choisir un rôle --</option>
              <option value="ADMIN">Admin</option>
              <option value="MEDECIN">Médecin</option>
              <option value="CHERCHEUR">Chercheur</option>
              <option value="PATIENT">Patient</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="login-button"
          >
            Se connecter
          </button>
        </form>

        <div className="login-footer">
          <p>© {new Date().getFullYear()} - Système de Gestion Hospitalière</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
