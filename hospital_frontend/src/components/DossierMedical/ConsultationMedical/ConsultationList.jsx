import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { getImageContent } from '../../../services/imagerieService';
import '../../../styles/dossierMedical.css';

/**
 * Composant pour afficher la liste des consultation
 */
function ConsultationList({ consultations, onConsultationClick }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  
  // Extraire l'ID du patient depuis l'URL
  const getPatientId = () => {
    const patientId = window.location.pathname.split('/').find((segment, index, array) => 
      array[index - 1] === 'patients' && segment !== ''
    );
    return patientId || '1'; // Fallback à '1' si non trouvé
  };
  
  /**
   * Charge l'URL d'une image à partir de son ID
   * @param {Object} image - L'objet image contenant l'id
   * @param {Object} consultation - La consultation associée à l'image
   * @returns {Promise<string>} - Promise qui résout vers l'URL de l'image
   */
  const loadImageUrl = async (image, consultation) => {
    if (!image || !image.id || !consultation || !consultation._id) return '';
    
    try {
      // Vérifier si nous avons déjà chargé cette image
      if (imageUrls[image.id]) {
        return imageUrls[image.id];
      }
      
      const patientId = getPatientId();
      const consultationId = consultation._id;
      const url = await getImageContent(patientId, consultationId, image.id);
      
      // Mettre à jour le cache d'URLs
      setImageUrls(prev => ({
        ...prev,
        [image.id]: url
      }));
      
      return url;
    } catch (error) {
      console.error(`Erreur lors du chargement de l'image ${image.id}:`, error);
      return '';
    }
  };
  
  /**
   * Obtient l'URL d'une image (soit du cache, soit en la chargeant)
   * @param {Object} image - L'objet image
   * @param {Object} consultation - La consultation associée à l'image
   * @returns {string} - L'URL de l'image
   */
  const getImageUrl = (image, consultation) => {
    console.log('ConsultationList.getImageUrl reçoit:', image);
    
    if (!image || !consultation) return '';
    
    // Si nous avons déjà l'URL dans le cache, l'utiliser
    if (image.id && imageUrls[image.id]) {
      return imageUrls[image.id];
    }
    
    // Sinon, déclencher le chargement (l'URL sera mise à jour lors du prochain rendu)
    if (image.id && consultation._id) {
      loadImageUrl(image, consultation);
      
      // Construire l'URL d'API complète (sans hardcoder le protocole et domaine)
      const baseUrl = window.location.origin; // Récupère le domaine actuel (ex: http://localhost:5173)
      const serverPort = '8080'; // Port du serveur backend
      const serverDomain = baseUrl.replace(/:\d+$/, `:${serverPort}`); // Remplace le port du frontend par celui du backend
      
      const patientId = getPatientId();
      const consultationId = consultation._id;
      const apiPath = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${image.id}/file`;
      return `${serverDomain}${apiPath}`;
    }
    
    // Si l'image a un lienFichier, l'utiliser
    if (image.lienFichier) {
      if (image.lienFichier.startsWith('http')) {
        return image.lienFichier;
      }
      
      // Construire l'URL complète
      const baseUrl = window.location.origin;
      const serverPort = '8080';
      const serverDomain = baseUrl.replace(/:\d+$/, `:${serverPort}`);
      return `${serverDomain}${image.lienFichier}`;
    }
    
    // Si l'image a une URL, l'utiliser
    if (image.url) {
      if (image.url.startsWith('http')) {
        return image.url;
      }
      
      // Construire l'URL complète
      const baseUrl = window.location.origin;
      const serverPort = '8080';
      const serverDomain = baseUrl.replace(/:\d+$/, `:${serverPort}`);
      return `${serverDomain}${image.url}`;
    }
    
    return '';
  };
  
  /**
   * Ouvre la modal pour afficher l'image en plein écran
   */
  const handleImageClick = (e, image) => {
    e.stopPropagation(); // Empêche la propagation du clic à l'élément parent
    setSelectedImage(image);
    setShowModal(true);
  };
  
  /**
   * Ferme la modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };
  
  // Précharger les images quand les consultation sont disponibles
  useEffect(() => {
    const preloadImages = async () => {
      if (!consultations || !Array.isArray(consultations)) return;
      
      // Pour chaque Consultation qui a des images
      for (const consultation of consultations) {
        if (consultation.images && Array.isArray(consultation.images)) {
          // Pour chaque image de la Consultation
          for (const image of consultation.images) {
            if (image && image.id) {
              await loadImageUrl(image, consultation);
            }
          }
        }
      }
    };
    
    preloadImages();
  }, [consultations]); // Se déclenche quand les Consultations changent
  if (!consultations || consultations.length === 0) {
    return <p>Aucune consultation enregistré</p>;
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div className="form-group">
          <select 
            className="form-select"
            onChange={(e) => {
              const value = e.target.value;
              let sortedConsultations = [...consultations];
              
              if (value === 'date-desc') {
                sortedConsultations.sort((a, b) => {
                  const dateA = a.date ? new Date(a.date) : new Date(0);
                  const dateB = b.date ? new Date(b.date) : new Date(0);
                  return dateB - dateA;
                });
              } else if (value === 'date-asc') {
                sortedConsultations.sort((a, b) => {
                  const dateA = a.date ? new Date(a.date) : new Date(0);
                  const dateB = b.date ? new Date(b.date) : new Date(0);
                  return dateA - dateB;
                });
              } else if (value === 'type') {
                sortedConsultations.sort((a, b) => {
                  return (a.type || '').localeCompare(b.type || '');
                });
              }
              
              // Mettre à jour la liste des consultations
              onConsultationClick(null); // Fermer le détail si ouvert
              // Comme nous ne pouvons pas modifier directement les consultations (props immutable),
              // nous informons l'utilisateur de l'application pour qu'il puisse recharger les données
              console.log("Liste triée:", sortedConsultations);
            }}
            defaultValue="date-desc"
          >
            <option value="date-desc">Plus récents d'abord</option>
            <option value="date-asc">Plus anciens d'abord</option>
            <option value="type">Par type</option>
          </select>
        </div>
      </div>
      
      <div 
        className="imagerie-list-view" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '15px',
          height: '600px',
          overflowY: 'scroll',
          border: '1px solid #e9e9e9',
          borderRadius: '4px',
          padding: '15px'
        }}
      >
        {consultations.map((consultation, index) => (
          <div 
            key={consultation._id || index} 
            className="imagerie-item"
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              padding: '15px',
              height: '220px',
              borderLeft: '4px solid #4a6da7'
            }}
          >
            <div className="imagerie-item-number">
              {index + 1}
            </div>
            
            <div className="imagerie-item-info" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="imagerie-item-type" style={{ 
                fontWeight: 500, 
                color: '#2c3e50',
                marginBottom: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {consultation.type}
              </div>
              
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#5a6268',
                marginBottom: '10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.4'
              }}>
                {consultation.description}
              </div>
              
              <div className="imagerie-item-date" style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '5px' }}>
                <span style={{ marginRight: '5px' }}>📅</span>
                {consultation.date ? new Date(consultation.date).toLocaleDateString() : "01/01/2023"}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#6c757d' }}>
                {consultation.images && Array.isArray(consultation.images) && consultation.images.length > 0 && (
                  <span>
                    <span style={{ marginRight: '3px' }}>🖼️</span>
                    {consultation.images.length}
                  </span>
                )}
                
                {consultation.analyses && consultation.analyses.length > 0 && (
                  <span>
                    <span style={{ marginRight: '3px' }}>🧪</span>
                    {consultation.analyses.length}
                  </span>
                )}
                
                {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                  <span>
                    <span style={{ marginRight: '3px' }}>📝</span>
                    {consultation.ordonnances.length}
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              variant="link" 
              className="text-primary"
              style={{ padding: '5px', marginTop: '10px', alignSelf: 'flex-end' }}
              onClick={() => onConsultationClick(consultation)}
            >
              👁️ Voir plus
            </Button>
          </div>
        ))}
      </div>

      {/* Modal pour afficher l'image en plein écran */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.typeImage || 'Image médicale'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <div>
                <img 
                  src={selectedImage && getImageUrl(selectedImage, consultations.find(c => 
                    c.images && Array.isArray(c.images) && 
                    c.images.some(img => img.id === selectedImage.id)
                  ))} 
                  alt={(selectedImage && selectedImage.description) || 'Image médicale'} 
                  style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
                />
              <div style={{ marginTop: '1rem' }}>
                <h5>Description:</h5>
                <p>{selectedImage.description}</p>
                <h5>Type d'image:</h5>
                <p>{selectedImage.typeImage}</p>
                {selectedImage.createdAt && (
                  <>
                    <h5>Date:</h5>
                    <p>{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ConsultationList;
