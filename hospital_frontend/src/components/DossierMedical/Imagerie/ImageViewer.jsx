import React, { useState, useRef, useEffect } from 'react';
import { isDicomImage } from '../../../services/imagerieService';
import ImageMedicale from './ImageMedicale.jsx';
import DicomViewer from './DicomViewer.jsx';
import { Button, Card } from 'react-bootstrap';
import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

/**
 * Composant qui choisit automatiquement le bon visualiseur selon le type d'image
 * avec des contrôles unifiés pour fermer et afficher en plein écran
 */
const ImageViewer = ({ image, patientId, consultationId, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const viewerRef = useRef(null);

  // Afficher les détails de l'image pour le débogage
  console.log('Détails de l\'image:', {
    id: image.id,
    type: image.typeImage,
    lien: image.lienFichier
  });
  
  // Utiliser la fonction centralisée du service pour déterminer si c'est un DICOM
  const isDicom = image.lienFichier ? 
    isDicomImage(image.lienFichier) : 
    false;
  
  // Log pour le débogage
  console.log(`Image ${image.id} est ${isDicom ? 'DICOM' : 'standard'} (lien: ${image.lienFichier})`); 

  // Gestionnaire pour basculer en mode plein écran
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (viewerRef.current && viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen().catch(err => {
          console.error(`Erreur lors du passage en plein écran: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Gestionnaire d'événements pour détecter les changements de plein écran
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Gestionnaire pour fermer la vue d'image si onClose est fourni
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };
  
  return (
    <div ref={viewerRef} className="image-viewer-container">
      <Card className="image-viewer-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-bold">{image.description || 'Image'}</span>
            <span className="ms-2 badge bg-secondary">
              {isDicom ? 'DICOM' : (image.typeImage || 'Standard')}
            </span>
          </div>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2" 
              onClick={toggleFullScreen}
              title={isFullScreen ? "Quitter le plein écran" : "Afficher en plein écran"}
            >
              {isFullScreen ? <FaCompress /> : <FaExpand />}
            </Button>
            {onClose && (
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleClose}
                title="Fermer"
              >
                <FaTimes />
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="image-viewer">
            {isDicom ? (
              <DicomViewer 
                patientId={patientId}
                consultationId={consultationId || image.consultationId}
                imageId={image.id} 
                typeImage={image.typeImage}
                description={image.description}
                dateCreation={image.dateCreation}
                lienFichier={image.lienFichier}
              />
            ) : (
              <ImageMedicale 
                patientId={patientId} 
                imageId={image.id} 
                typeImage={image.typeImage}
                description={image.description}
                dateCreation={image.dateCreation}
                consultationId={consultationId || image.consultationId}
              />
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImageViewer;
