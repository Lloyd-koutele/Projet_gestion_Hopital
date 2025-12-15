import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Spinner, Image } from 'react-bootstrap';
import { getDicomBlobByLink } from '../../../services/imagerieService';
import './DicomViewer.css';

// Image de remplacement en cas d'erreur (encodée en base64)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz4KPHRleHQgeD0iMTAwIiB5PSI5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBESUNPTTwvdGV4dD4KPHRleHQgeD0iMTAwIiB5PSIxMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+bm9uIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPg==';

/**
 * Extrait l'ID du patient et de la consultation depuis l'URL actuelle
 * Format attendu: /patients/{patientId}/dossier-medical/consultations/{consultationId}/...
 * @returns {Object} Objet contenant patientId et consultationId ou valeurs null si non trouvés
 */
const extractIdsFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  const patientIndex = pathParts.findIndex(part => part === 'patients');
  const consultationIndex = pathParts.findIndex(part => part === 'consultations');
  
  let patientId = null;
  let consultationId = null;
  
  if (patientIndex !== -1 && patientIndex + 1 < pathParts.length) {
    patientId = parseInt(pathParts[patientIndex + 1], 10);
    if (isNaN(patientId)) patientId = null;
  }
  
  if (consultationIndex !== -1 && consultationIndex + 1 < pathParts.length) {
    consultationId = pathParts[consultationIndex + 1];
  }
  
  console.log('IDs extraits de l\'URL:', { patientId, consultationId });
  return { patientId, consultationId };
};

/**
 * Composant pour afficher une image DICOM
 * Utilise une approche simplifiée sans dépendance à Cornerstone
 * Affiche simplement l'image comme une image normale
 */
const DicomViewer = ({ lienFichier, imageId, typeImage, description, dateCreation, patientId, consultationId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isMissingImage, setIsMissingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Référence à l'image
  const imageRef = useRef(null);

  // Charger l'image DICOM
  useEffect(() => {
    if (!imageId || !lienFichier) {
      setLoading(false);
      return;
    }
    
    const loadDicomImage = async () => {
      try {
        console.log('Chargement de l\'image DICOM avec ID:', imageId);
        console.log('Lien du fichier:', lienFichier);
        
        // Récupérer le blob DICOM depuis le backend en utilisant le lien du fichier
          console.log('Tentative de récupération du DICOM avec patientId:', patientId, 'consultationId:', consultationId, 'imageId:', imageId);
          
          // Si patientId ou consultationId ne sont pas fournis, essayer de les récupérer depuis l'URL
          const { patientId: urlPatientId, consultationId: urlConsultationId } = extractIdsFromUrl();
          const currentPatientId = patientId || urlPatientId;
          const currentConsultationId = consultationId || urlConsultationId;
          
          // S'assurer que le token dans localStorage a le bon format (Bearer prefix)
          const token = localStorage.getItem('token');
          if (token && !token.startsWith('Bearer ')) {
            localStorage.setItem('token', `Bearer ${token}`);
            console.log('Format du token corrigé avec préfixe Bearer');
          }
          
          // Récupérer le blob DICOM en utilisant l'endpoint approprié
          const { blob: dicomBlob } = await getDicomBlobByLink(lienFichier, currentPatientId, currentConsultationId, imageId);
        
        // Vérifier que le blob est valide
        if (!dicomBlob || dicomBlob.size === 0) {
          throw new Error('Blob DICOM vide ou invalide');
        }
        
        // Créer une URL pour le blob
        const blobUrl = URL.createObjectURL(dicomBlob);
        setImageUrl(blobUrl);
        
        console.log('Image DICOM chargée avec succès, URL du blob:', blobUrl);
        setLoading(false);
        setError(null);
      } catch (err) {
        // Limiter les logs d'erreur pour éviter de polluer la console
        if (!window.dicomErrorsLogged) {
          window.dicomErrorsLogged = {};
        }
        
        if (!window.dicomErrorsLogged[imageId]) {
          console.error('Erreur lors du chargement de l\'image DICOM:', err);
          window.dicomErrorsLogged[imageId] = true;
        }
        
        // Message d'erreur plus détaillé pour aider au débogage
        let errorMessage = 'Impossible de charger l\'image DICOM';
        let details = '';
        let missingImage = false;
        
        if (err.response && err.response.status === 404) {
          // Si l'image est introuvable, utiliser l'image de remplacement
          console.log(`Image DICOM ${imageId} non trouvée, utilisation de l'image de remplacement`);
          setImageUrl(FALLBACK_IMAGE);
          setLoading(false);
          return;
        } else if (err.message) {
          errorMessage = `${errorMessage}: ${err.message}`;
        }
        
        // Mettre à jour les états d'erreur
        setError(errorMessage);
        setErrorDetails(details);
        setIsMissingImage(missingImage);
        setLoading(false);
      }
    };
    
    loadDicomImage();
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageId, lienFichier]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    // Recharger l'image
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    
    // L'useEffect se déclenchera automatiquement pour recharger l'image
  };


  return (
    <Card className="dicom-viewer-card mb-3">
      <Card.Header>
        <h5>{description || 'Image DICOM sans description'}</h5>
        <div className="text-muted">
          Type: {typeImage} (DICOM)
          {dateCreation && (
            <span className="ms-2">
              Date: {new Date(dateCreation).toLocaleDateString()}
            </span>
          )}
        </div>
      </Card.Header>
      <Card.Body className="text-center">
        {loading && (
          <div className="spinner-container p-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Chargement de l'image DICOM...</p>
          </div>
        )}
        
        {error && (
          <div className="dicom-error p-4">
            <div className={`alert ${isMissingImage ? 'alert-warning' : 'alert-danger'}`}>
              <h5>{error}</h5>
              {errorDetails && <p className="mb-3">{errorDetails}</p>}
              
              {isMissingImage ? (
                <div className="d-flex flex-column gap-2">
                  <p className="small text-muted">
                    Cette image DICOM n'est plus disponible sur le serveur. Vous pouvez essayer de la télécharger à nouveau.
                  </p>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => window.history.back()}
                    >
                      Retour
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      onClick={handleRetry}
                    >
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleRetry}
                >
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        )}
        
        {!loading && !error && imageUrl && (
          <div>
            <div className="text-center" style={{ overflow: 'auto', maxHeight: '500px' }}>
              <Image
                ref={imageRef}
                src={imageUrl}
                alt={description || 'Image DICOM'}
                className="dicom-image"
              />
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DicomViewer;
