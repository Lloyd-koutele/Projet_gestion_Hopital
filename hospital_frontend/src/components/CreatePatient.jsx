import React, { useState, useEffect, useRef } from 'react';
import { getMedecinConnecte } from '../services/medecinService';
import { createPatient } from '../services/patientService';
import '../styles/patient.css';

function CreatePatient({ onSuccess }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',   
    email: '',
    dateNaissance: '',
    telephone: '',
    sexe: '',
    taille: '',
    poids:'',
    groupeSanguin: '',
    contexte: '',
    password: ''

  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medecinConnecte, setMedecinConnecte] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer les informations du médecin connecté
  useEffect(() => {
    const fetchMedecinConnecte = async () => {
      try {
        const medecin = await getMedecinConnecte();
        setMedecinConnecte(medecin);
      } catch (err) {
        console.error("Erreur lors de la récupération du médecin connecté:", err);
      }
    };

    fetchMedecinConnecte();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser les messages d'erreur lors de la modification
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    // Validation des champs requis
    if (!formData.nom || !formData.prenom || !formData.email || !formData.dateNaissance || 
        !formData.telephone || !formData.sexe || !formData.taille || !formData.poids || 
        !formData.groupeSanguin || !formData.contexte || !formData.password) {
      setError('Tous les champs sont obligatoires');
      return false;
    }
    
    // Validation du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Validation de la date de naissance
    const birthDate = new Date(formData.dateNaissance);
    const today = new Date();
    if (birthDate >= today) {
      setError('La date de naissance doit être dans le passé');
      return false;
    }

    // Validation du numéro de téléphone (format sénégalais)
    const phoneRegex = /^(70|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setError('Le numéro de téléphone doit être un numéro valide au Sénégal');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Le backend associe automatiquement le médecin connecté comme médecin référent
      const patientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        dateNaissance: formData.dateNaissance,
        telephone: formData.telephone.trim(),
        sexe: formData.sexe,
        taille: formData.taille,
        poids: formData.poids,
        groupeSanguin: formData.groupeSanguin,
        contexte: formData.contexte,
        password:formData.password
      };

      await createPatient(patientData);
      setSuccess('Patient créé avec succès !');
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        dateNaissance: '',
        telephone: '',
        sexe: '',
        taille:'',
        poids: '',
        groupeSanguin: '',
        contexte: '',
        password:''
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création du patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-form-container">
      <h2 className="patient-form-title">Création d'un nouveau patient</h2>
      
      {error && (
        <div className="patient-alert patient-alert-error">
          <div className="patient-alert-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="patient-alert-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="patient-alert patient-alert-success">
          <div className="patient-alert-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="patient-alert-content">
            <p>{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="patient-form-grid">
        <div className="patient-form-field">
          <label className="patient-input-label">
            Nom
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="patient-input"
              required
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Prénom
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="patient-input"
              required
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="patient-input"
              required
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Mot de passe
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="patient-input"
                required
                minLength="6"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button"
              >
                {showPassword ? "Cacher" : "Montrer"}
              </button>
            </div>
            <small className="password-hint">Le mot de passe doit contenir au moins 6 caractères</small>
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Date de naissance
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              className="patient-input"
              required
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Téléphone
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="7XXXXXXXX"
              className="patient-input"
              required
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Sexe
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              className="patient-select"
              required
            >
              <option value="">Sélectionnez</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Taille (cm)
            <input
              type="number"
              name="taille"
              value={formData.taille}
              onChange={handleChange}
              className="patient-input"
              required
              min="0"
              max="300"
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Poids (kg)
            <input
              type="number"
              name="poids"
              value={formData.poids}
              onChange={handleChange}
              className="patient-input"
              required
              min="0"
              max="500"
            />
          </label>
        </div>

        <div className="patient-form-field">
          <label className="patient-input-label">
            Groupe Sanguin
            <select
              name="groupeSanguin"
              value={formData.groupeSanguin}
              onChange={handleChange}
              className="patient-select"
              required
            >
              <option value="">Sélectionnez</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </label>
        </div>

        <div className="patient-form-field full-width">
          <label className="patient-input-label">
            Contexte médical
            <textarea
              name="contexte"
              value={formData.contexte}
              onChange={handleChange}
              rows="4"
              className="patient-textarea"
              required
            ></textarea>
          </label>
        </div>

        <div className="patient-button-container">
          <button
            type="submit"
            disabled={isSubmitting}
            className="patient-submit-button"
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : 'Créer le patient'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePatient;
