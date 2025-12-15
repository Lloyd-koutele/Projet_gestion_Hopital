import React, { useState, useRef, useEffect } from 'react';
import { createAdmin, createMedecin, createChercheur } from '../services/adminService';
import '../styles/users.css';

function CreateUser({ onSuccess }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: '',
    telephone: '',
    specialite: '',// Pour les médecins
    numeroOrdre: '',  // Pour les médecins
    domaineRecherche: '', // Pour les chercheurs
    departement: ''  // Pour les admins
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.role || !formData.telephone) {
      setError('Tous les champs de base sont obligatoires');
      return false;
    }

    if (formData.role === 'MEDECIN' && !formData.specialite && !formData.numeroOrdre) {
      setError('La spécialité et numéro du médécin sont obligatoires');
      return false;
    }

    if (formData.role === 'CHERCHEUR' && !formData.domaineRecherche) {
      setError('Le domaine de recherche est obligatoire pour un chercheur');
      return false;
    }

    if (formData.role === 'ADMIN' && !formData.departement) {
      setError('Le département est obligatoire pour un administrateur');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      let response;
      switch (formData.role) {
        case 'MEDECIN':
          response = await createMedecin({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            password: formData.password,
            telephone: formData.telephone,
            specialite: formData.specialite,
            numeroOrdre : formData.numeroOrdre
          });
          break;
        case 'CHERCHEUR':
          response = await createChercheur({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            password: formData.password,
            telephone: formData.telephone,
            specialiteRecherche: formData.domaineRecherche
          });
          break;
        case 'ADMIN':
          response = await createAdmin({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            password: formData.password,
            telephone: formData.telephone,
            departement: formData.departement
          });
          break;
        default:
          setError('Type d\'utilisateur non valide');
          return;
      }

      setSuccess('Utilisateur créé avec succès');
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: '',
        telephone: '',
        specialite: '',
        numeroOrdre: '',
        domaineRecherche: '',
        departement: ''
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Erreur lors de la création de l\'utilisateur');
      }
    }
  };

  // Référence pour le focus automatique
  const firstInputRef = useRef(null);
  
  // Focus sur le premier champ lors de l'ouverture
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Référence au conteneur du formulaire
  const formContainerRef = useRef(null);
  
  // Mise à jour uniquement en cas de changement de rôle
  useEffect(() => {
    // Assurer que le conteneur de la modale s'ajuste correctement
    if (formContainerRef.current) {
      // On laisse le CSS gérer le défilement maintenant, mais on s'assure que le contenu est visible
      const parentModalContent = formContainerRef.current.closest('.modal-content');
      if (parentModalContent) {
        // Forcer un recalcul du défilement
        setTimeout(() => {
          parentModalContent.scrollTop = 0;
        }, 50);
      }
    }
  }, [formData.role]); // Se déclenche lorsque le rôle change

  return (
    <div className="user-form-container" ref={formContainerRef}>
      
      {error && (
        <div className="user-alert user-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="user-alert user-alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="user-form-grid">
          <div className="user-form-field full-width">
            <label className="user-form-label">
              Rôle:
              <select
                ref={firstInputRef}
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="user-form-select"
              >
                <option value="">Sélectionnez un rôle</option>
                <option value="ADMIN">Administrateur</option>
                <option value="MEDECIN">Médecin</option>
                <option value="CHERCHEUR">Chercheur</option>
              </select>
            </label>
          </div>

          <div className="user-form-field">
            <label className="user-form-label">
              Nom:
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>

          <div className="user-form-field">
            <label className="user-form-label">
              Prénom:
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>

          <div className="user-form-field full-width">
            <label className="user-form-label">
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>

          <div className="user-form-field">
            <label className="user-form-label">
              Mot de passe:
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="user-form-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-button"
                >
                  {showPassword ? "Cacher" : "Montrer"}
                </button>
              </div>
            </label>
          </div>

          <div className="user-form-field">
            <label className="user-form-label">
              Téléphone:
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="user-form-input"
                placeholder="+221XXXXXXXXX"
              />
            </label>
          </div>
        </div>

        {formData.role === 'MEDECIN' && (
          <div className="user-form-field">
            <label className="user-form-label">
              Spécialité:
              <input
                type="text"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>

            <label className="user-form-label">
            Numero d'ordre:
              <input
                type="text"
                name="numeroOrdre"
                value={formData.numeroOrdre}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>
        )}

        {formData.role === 'CHERCHEUR' && (
          <div className="user-form-field">
            <label className="user-form-label">
              Domaine de recherche:
              <input
                type="text"
                name="domaineRecherche"
                value={formData.domaineRecherche}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>
        )}

        {formData.role === 'ADMIN' && (
          <div className="user-form-field">
            <label className="user-form-label">
              Département:
              <input
                type="text"
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                required
                className="user-form-input"
              />
            </label>
          </div>
        )}

        <div className="user-form-buttons">
          <button
            type="submit"
            className="user-form-button user-form-button-primary"
          >
            Créer l'utilisateur
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUser;
