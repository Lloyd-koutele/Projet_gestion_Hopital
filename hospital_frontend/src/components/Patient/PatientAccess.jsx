import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import AccessManagement from '../common/AccessManagement';
import { getPatientById } from '../../services/patientService';
import * as accessService from '../../services/accessManagementService';
import { getCurrentUserInfo } from '../../auth/authService';

/**
 * Composant pour gérer les autorisations d'accès à un patient
 * Utilise le composant unifié AccessManagement en mode médecin
 * @param {Object} props - Propriétés du composant
 * @param {number} props.patientId - ID du patient
 * @param {Function} props.onClose - Fonction appelée à la fermeture
 * @param {Object} props.patient - Informations du patient (optionnel)
 */
const PatientAccess = ({ patientId, onClose, patient: initialPatient }) => {
  const [patient, setPatient] = useState(initialPatient);
  const [isMedecinReferent, setIsMedecinReferent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientAndCheckReferent = async () => {
      if (!patientId) {
        setError("ID du patient manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Si les informations du patient ne sont pas fournies, les récupérer
        let patientData = initialPatient;
        if (!patientData) {
          patientData = await getPatientById(patientId);
          setPatient(patientData);
        }
        
        // Utiliser la fonction dédiée pour vérifier si le médecin est référent
        const isReferent = await accessService.verifierSiMedecinReferent(patientId);
        console.log('Vérification API - Est médecin référent:', isReferent);
        
        // Pour le débogage, afficher aussi les informations utilisées pour la comparaison
        const medecinConnecteId = parseInt(localStorage.getItem('medecinId') || '0');
        const userInfo = getCurrentUserInfo();
        console.log('ID du médecin connecté (localStorage):', medecinConnecteId);
        console.log('Informations utilisateur:', userInfo);
        console.log('Patient data:', patientData);
        
        if (patientData && patientData.medecinReferent) {
          console.log('ID du médecin référent (patient data):', patientData.medecinReferent.id);
        }
        
        // Définir l'état en fonction du résultat de l'API
        setIsMedecinReferent(isReferent);
      } catch (err) {
        console.error('Erreur lors de la récupération des informations du patient:', err);
        setError(err.message || 'Erreur lors de la récupération des informations du patient');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientAndCheckReferent();
  }, [patientId, initialPatient]);
  
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des informations...</p>
      </div>
    );
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  if (!patientId) {
    return <Alert variant="danger">ID du patient manquant</Alert>;
  }
  
  return (
    <>
      {!isMedecinReferent && (
        <Alert variant="info" className="mb-4">
          <strong>Note :</strong> Vous n'êtes pas le médecin référent de ce patient. 
          Vous pouvez consulter les autorisations d'accès, mais seul le médecin référent 
          peut accorder de nouveaux accès à d'autres médecins.
        </Alert>
      )}
      
      <AccessManagement 
        mode="medecin"
        patientId={patientId}
        onClose={onClose}
        patient={patient}
        forceIsMedecinReferent={isMedecinReferent}
      />
    </>
  );
};

export default PatientAccess;
