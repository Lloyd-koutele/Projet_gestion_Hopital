import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PatientAccess from '../Patient/PatientAccess';
import { getCurrentUserInfo } from '../../auth/authService';
import { getMyProfile } from '../../services/patientService';

/**
 * Composant wrapper pour la gestion des accès côté patient
 * Récupère l'ID du patient connecté et rend le composant PatientAccess
 */
const GestionAcces = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'ID du patient depuis le localStorage
        const storedPatientId = localStorage.getItem('patientId');
        
        if (storedPatientId) {
          setPatientId(storedPatientId);
          // On pourrait aussi récupérer les détails du patient ici si nécessaire
          setLoading(false);
          return;
        }
        
        // Si l'ID n'est pas dans le localStorage, récupérer les infos utilisateur
        const userInfo = getCurrentUserInfo();
        
        if (!userInfo || !userInfo.email) {
          throw new Error("Impossible de récupérer les informations de l'utilisateur connecté");
        }
        
        // Récupérer les informations du patient connecté
        const profileData = await getMyProfile();
        
        // L'API renvoie les données dans un format différent (Map)
        if (!profileData || !profileData.patientId) {
          throw new Error("Impossible de récupérer les informations du patient");
        }
        
        // Extraire l'ID du patient
        const patientId = profileData.patientId;
        
        // Construire l'objet patient à partir des données reçues
        const patientData = {
          id: patientId,
          nom: profileData.nom,
          prenom: profileData.prenom,
          email: profileData.email,
          role: profileData.role
        };
        
        setPatientId(patientId);
        setPatient(patientData);
        
        // Stocker l'ID du patient pour les prochaines utilisations
        localStorage.setItem('patientId', patientData.id);
      } catch (err) {
        console.error("Erreur lors de la récupération des informations du patient:", err);
        setError(err.message || "Une erreur est survenue lors de la récupération de vos informations");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientInfo();
  }, []);
  
  const handleClose = () => {
    // Rediriger vers le dashboard patient
    navigate('/patient');
  };
  
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des informations...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-danger" onClick={handleClose}>
            Retour
          </button>
        </div>
      </Alert>
    );
  }
  
  if (!patientId) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Information non disponible</Alert.Heading>
        <p>Impossible de récupérer votre identifiant patient. Veuillez vous reconnecter.</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-warning" onClick={handleClose}>
            Retour
          </button>
        </div>
      </Alert>
    );
  }
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestion des accès à mon dossier</h2>
      <PatientAccess 
        patientId={patientId} 
        onClose={handleClose} 
        patient={patient}
      />
    </div>
  );
};

export default GestionAcces;
