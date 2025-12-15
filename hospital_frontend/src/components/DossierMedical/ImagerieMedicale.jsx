import React, { useState, useEffect, useCallback, useRef } from 'react';
import ImageService from '../../services/imagerieService';
import api from '../../services/api';
import { Modal, Tabs, Tab, Spinner, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaArrowLeft, FaEye, FaTimes } from 'react-icons/fa';
import '../../styles/NavigateurView.css';
import ImageViewer from './Imagerie/ImageViewer';
import ImageModal from './Imagerie/ImageModal';

// Liste des types d'images médicales valides
const VALID_IMAGE_TYPES = [
  "scanner", "radiographie", "irm", "echographie", "autre"
];

// Noms d'affichage pour les types d'images
const IMAGE_TYPE_LABELS = {
  "scanner": "Scanner",
  "radiographie": "Radiographie",
  "irm": "IRM",
  "echographie": "Échographie",
  "autre": "Autre"
};

/**
 * Composant pour la gestion des images médicales
 */
function ImagerieMedicale({ patientId, consultationId }) {
  // États pour la liste et la sélection d'images
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les modales et l'affichage d'image
  const [showAddImageModal, setShowAddImageModal] = useState(false); // Pour l'ajout d'image
  const [expandedImageId, setExpandedImageId] = useState(null); // ID de l'image agrandie
  
  // État pour le nouveau formulaire d'image
  const [newImage, setNewImage] = useState({ file: null, typeImage: '', description: '' });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // États pour la modale d'image
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // État pour gérer les erreurs de miniatures
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  
  // Référence pour éviter les requêtes multiples en parallèle
  const loadingRef = useRef(false);
  const thumbnailTimersRef = useRef({});

  /**
   * Gère le changement de fichier dans le formulaire
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage({
        ...newImage,
        file: e.target.files[0]
      });
    }
  };

  /**
   * Gère la soumission du formulaire d'ajout d'image
   */
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!newImage.file || !newImage.typeImage) {
      setUploadError('Veuillez sélectionner un fichier et un type d\'image');
      return;
    }
    
    try {
      setUploadLoading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('file', newImage.file);
      formData.append('typeImage', newImage.typeImage);
      formData.append('description', newImage.description || '');
      
      // Créer une API temporaire pour ajouter une image directement à un patient
      const response = await api.post(
        `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Réinitialiser le formulaire après l'envoi réussi
      setNewImage({ file: null, typeImage: '', description: '' });
      setShowAddImageModal(false);
      
      // Rafraîchir la liste d'images en rechargeant les données
      fetchImages();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'image:', error);
      setUploadError('Une erreur est survenue lors de l\'envoi de l\'image. Veuillez réessayer.');
    } finally {
      setUploadLoading(false);
    }
  };

  /**
   * Charge les images du patient
   */
  const fetchImages = useCallback(async () => {
    // Si un chargement est déjà en cours, ne pas en lancer un autre
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    
    try {
      setLoading(true);
      const imagesData = await ImageService.getImagesByPatient(patientId);
      
      setImages(imagesData);
      setFilteredImages(selectedFilter === 'tous' ? imagesData : 
        imagesData.filter(image => image.typeImage === selectedFilter));
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des images:', err);
      setError('Impossible de charger les images. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [patientId, selectedFilter]);

  // Effet pour charger les images au chargement du composant
  useEffect(() => {
    fetchImages();
    
    // Nettoyage des timers lors du démontage du composant
    return () => {
      // Annuler tous les timers en cours
      Object.values(thumbnailTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [fetchImages]);
  
  // Effet pour filtrer les images quand le filtre change
  useEffect(() => {
    if (selectedFilter === 'tous') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(image => image.typeImage === selectedFilter));
    }
  }, [selectedFilter, images]);
  
  // Fonction pour gérer le changement de filtre
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };
  
  // Fonction pour formater correctement les dates
  const formatDate = (image) => {
    if (!image) return 'Date non disponible';
    
    // Utiliser la propriété 'date' qui est celle utilisée dans l'API
    const dateString = image.date;
    
    if (!dateString) return 'Date non disponible';
    
    try {
      // Vérifier si la date est valide
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      // Formater la date en français
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  /**
   * Gère l'expansion et la contraction d'une image
   */
  const toggleExpandImage = (imageId) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };
  
  /**
   * Ouvre l'image dans une modale avec options plein écran
   */
  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };
  
  /**
   * Ferme la modale d'image
   */
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  /**
   * Gère les erreurs de chargement des miniatures avec un délai pour éviter les requêtes multiples
   */
  const handleThumbnailError = (imageId, e) => {
    // Annuler tout timer existant pour cette image
    if (thumbnailTimersRef.current[imageId]) {
      clearTimeout(thumbnailTimersRef.current[imageId]);
    }
    
    // Créer un nouveau timer pour retarder la tentative alternative
    thumbnailTimersRef.current[imageId] = setTimeout(() => {
      // Marquer cette miniature comme ayant échoué
      setThumbnailErrors(prev => {
        // Si cette image est déjà marquée comme ayant échoué, ne rien faire
        if (prev[imageId]) return prev;
        
        console.warn(`Erreur de chargement de la miniature pour l'image ${imageId}`);
        
        // Essayer l'endpoint /file si l'endpoint /content a échoué
        if (e.target.src.includes('/content')) {
          const fileUrl = e.target.src.replace('/content', '/file');
          console.log(`Tentative avec l'URL alternative pour la miniature: ${fileUrl}`);
          e.target.src = fileUrl;
        } else {
          // Si même l'endpoint /file échoue, utiliser une image de remplacement
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KPHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
        }
        
        return { ...prev, [imageId]: true };
      });
      
      // Supprimer la référence au timer
      delete thumbnailTimersRef.current[imageId];
    }, 300); // Délai de 300ms entre les tentatives
  };
  
  /**
   * Génère l'URL de la miniature pour l'image avec un token d'authentification
   */
  const getThumbnailUrl = (image) => {
    // Récupérer le token et s'assurer qu'il est correctement formaté
    const token = localStorage.getItem('token');
    const formattedToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    
    // Si on a déjà essayé l'endpoint /content sans succès, utiliser /file directement
    if (thumbnailErrors[image.id]) {
      return `/api/medecin/patients/${patientId}/dossier-medical/images/${image.id}/file?t=${Date.now()}`;
    }
    
    // Par défaut, utiliser l'endpoint /content
    return `/api/medecin/patients/${patientId}/dossier-medical/images/${image.id}/content?t=${Date.now()}`;
  };

  // Rendu conditionnel optimisé pour réduire la complexité
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des images médicales...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      );
    }
    
    if (showAddImageModal) {
      return null; // La modale est gérée séparément
    }
    
    if (images.length === 0) {
      return (
        <Alert variant="info">
          <p className="mb-0">Aucune image médicale disponible pour ce patient.</p>
        </Alert>
      );
    }
    
    if (filteredImages.length === 0) {
      return (
        <Alert variant="info">
          <p className="mb-0">Aucune image ne correspond au filtre sélectionné.</p>
        </Alert>
      );
    }
    
    return (
      <>
        <div className="filter-container" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '10px', fontWeight: '500', color: '#2c3e50' }}>Filtrer par type d'image:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button 
              variant={selectedFilter === 'tous' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => handleFilterChange('tous')}
            >
              Tous
            </Button>
            {VALID_IMAGE_TYPES.map(type => (
              <Button 
                key={type}
                variant={selectedFilter === type ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleFilterChange(type)}
              >
                {IMAGE_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>
        <div className="imagerie-list-view">
          <Row>
            {filteredImages.map((image, index) => (
              <Col key={image.id} xs={12} md={expandedImageId === image.id ? 12 : 6} lg={expandedImageId === image.id ? 12 : 4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body className="text-center p-3">
                    <Card.Title className="fs-6 d-flex justify-content-between align-items-center">
                      <span>{image.description || 'Image sans description'}</span>
                      <Button 
                        variant={expandedImageId === image.id ? "outline-secondary" : "outline-primary"} 
                        size="sm"
                        onClick={() => toggleExpandImage(image.id)}
                        className="ms-2"
                      >
                        {expandedImageId === image.id ? (
                          <><FaTimes className="me-1" /> Réduire</>
                        ) : (
                          <><FaEye className="me-1" /> Agrandir</>
                        )}
                      </Button>
                    </Card.Title>
                    
                    {expandedImageId === image.id ? (
                      <div className="expanded-image my-3">
                        <ImageViewer 
                          image={image}
                          patientId={patientId}
                          consultationId={consultationId}
                          onClose={() => toggleExpandImage(image.id)}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="my-3">
                          <img 
                            src={getThumbnailUrl(image)}
                            alt={`${IMAGE_TYPE_LABELS[image.typeImage] || image.typeImage} ${index + 1}`}
                            className="img-fluid"
                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                            onError={(e) => handleThumbnailError(image.id, e)}
                            loading="lazy" // Utiliser le chargement paresseux pour améliorer les performances
                          />
                        </div>
                        <div className="text-muted small mb-2">
                          Type: {IMAGE_TYPE_LABELS[image.typeImage] || image.typeImage}
                          <div>{formatDate(image)}</div>
                        </div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="w-100 mt-2"
                          onClick={() => toggleExpandImage(image.id)}
                        >
                          <FaExpand className="me-1" /> Agrandir
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </>
    );
  };

  return (
    <div className="imagerie-medicale-container no-animation">
      <div className="imagerie-header">
        <h3>Imagerie Médicale</h3>
        <Button 
          className="add-button d-flex align-items-center" 
          onClick={() => setShowAddImageModal(true)}
        >
          <FaPlus className="me-2" />
          Ajouter une image
        </Button>
      </div>

      {renderContent()}

      {/* Modale pour le formulaire d'ajout d'image */}
      <Modal
        show={showAddImageModal}
        onHide={() => setShowAddImageModal(false)}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une nouvelle image médicale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImageSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type d'image</Form.Label>
                  <Form.Select 
                    value={newImage.typeImage} 
                    onChange={(e) => setNewImage({...newImage, typeImage: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {VALID_IMAGE_TYPES.map(type => (
                      <option key={type} value={type}>{IMAGE_TYPE_LABELS[type]}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fichier image</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*,.dcm"
                    required
                  />
                  <Form.Text className="text-muted">
                    Formats acceptés: JPEG, PNG, GIF, DICOM (.dcm)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={newImage.description} 
                onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                placeholder="Description de l'image (optionnel)"
              />
            </Form.Group>
            
            {uploadError && (
              <Alert variant="danger" className="mt-3">
                {uploadError}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowAddImageModal(false)}
            disabled={uploadLoading}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            onClick={handleImageSubmit}
            disabled={uploadLoading}
          >
            {uploadLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Envoi en cours...</span>
              </>
            ) : 'Enregistrer l\'image'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modale pour afficher l'image en plein écran */}
      <ImageModal
        show={showImageModal}
        onHide={closeImageModal}
        image={selectedImage}
        patientId={patientId}
        consultationId={consultationId}
      />
    </div>
  );
}

export default ImagerieMedicale;
