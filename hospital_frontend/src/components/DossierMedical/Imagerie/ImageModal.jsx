import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './DicomViewer.css';
import './StandardImageViewer.css';
import { isDicomImage } from '../../../services/imagerieService';

/**
 * Composant de fenêtre modale pour afficher les images médicales
 * avec des options pour afficher en plein écran et fermer
 */
const ImageModal = ({ show, onHide, image, patientId, consultationId }) => {
  const imageRef = useRef(null);
  
  // Détermine si l'image est de type DICOM
  const isDicom = image && image.lienFichier ? 
    isDicomImage(image.lienFichier) : 
    false;
  
  // Nom du type d'image à afficher
  const imageType = isDicom ? 'IRM (DICOM)' : (image?.typeImage || 'Standard');
  
  // Gère l'affichage en plein écran
  const handleFullScreen = () => {
    // Utilise l'élément image pour le plein écran
    const imgElement = imageRef.current?.querySelector('img');
    
    if (imgElement) {
      if (!document.fullscreenElement) {
        imgElement.requestFullscreen().catch(err => {
          console.error(`Erreur lors du passage en plein écran: ${err.message}`);
        });
      }
    } else {
      // Fallback au conteneur de la modal si l'image n'est pas trouvée
      const modalContent = document.querySelector('.modal-content');
      if (modalContent && !document.fullscreenElement) {
        modalContent.requestFullscreen().catch(err => {
          console.error(`Erreur lors du passage en plein écran: ${err.message}`);
        });
      }
    }
  };
  
  // Ouvre l'image dans un nouvel onglet du navigateur
  const openInBrowser = () => {
    if (!image) return;
    
    // Construire l'URL de l'image selon le type (DICOM ou standard)
    let imageUrl;
    
    if (isDicom) {
      // Pour les images DICOM, utilisez un endpoint qui renvoie l'image au format approprié
      imageUrl = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${image.id}/file`;
    } else {
      // Pour les images standard
      imageUrl = `/api/medecin/patients/${patientId}/dossier-medical/images/${image.id}/file`;
    }
    
    // Ouvrir dans un nouvel onglet
    window.open(imageUrl, '_blank');
  };
  
  // Génère l'URL de l'image
  const getImageUrl = () => {
    if (!image) return '';
    
    if (isDicom) {
      return `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${image.id}/file`;
    } else {
      return `/api/medecin/patients/${patientId}/dossier-medical/images/${image.id}/file`;
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      size="lg"
      contentClassName="image-modal-content"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="w-100 text-center">
          {image?.description || 'Image médicale'}
        </Modal.Title>
      </Modal.Header>
      
      <div className="text-center text-muted mb-3">
        Type: {imageType}
      </div>
      
      <Modal.Body className="text-center pt-0" ref={imageRef}>
        {image && (
          <img
            src={getImageUrl()}
            alt={image.description || 'Image médicale'}
            className="img-fluid mb-3"
            style={{ maxHeight: '60vh' }}
          />
        )}
      </Modal.Body>
      
      <Modal.Footer className="justify-content-center border-top-0">
        <Button 
          variant="primary" 
          onClick={handleFullScreen}
          className="me-2"
        >
          Afficher en plein écran
        </Button>
        <Button 
          variant="secondary" 
          onClick={openInBrowser}
          className="me-2"
        >
          Ouvrir dans le navigateur
        </Button>
        <Button 
          variant="danger" 
          onClick={onHide}
        >
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
