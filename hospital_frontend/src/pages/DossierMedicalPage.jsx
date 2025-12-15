import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DossierMedical from '../components/DossierMedical';
import '../styles/dossierMedical.css';

const DossierMedicalPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const handleRetour = () => {
    navigate('/medecin');
  };

  return (
    <div className="dossier-medical-page">
      <div className="dossier-medical-header">
        <h1>Dossier Médical</h1>
      </div>
      <DossierMedical patientId={patientId} />
    </div>
  );
};

export default DossierMedicalPage;
