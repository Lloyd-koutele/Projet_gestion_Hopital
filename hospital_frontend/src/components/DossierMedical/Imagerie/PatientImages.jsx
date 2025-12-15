import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert, Spinner, Button } from 'react-bootstrap';
import { ImageService } from '../../../services/imagerieService';
import ImageViewer from './ImageViewer.jsx';
import ImageIntegrityChecker from './ImageIntegrityChecker.jsx';
import { useImagePreloader } from '../../../services/imagerieService';

// Liste des types d'images médicales valides (synchronisée avec le backend)
const VALID_IMAGE_TYPES = [
  "scanner", "radiographie", "irm", "echographie", "mammographie", "angiographie", "autre"
];

// Noms d'affichage pour les types d'images (pour une meilleure présentation)
const IMAGE_TYPE_LABELS = {
  "scanner": "Scanner",
  "radiographie": "Radiographie",
  "irm": "IRM",
  "echographie": "Échographie", 
  "autre": "Autre"
};

/**
 * Composant principal pour afficher et gérer les images d'un patient
 * Version révisée sans fenêtre modale
 */
const PatientImages = ({ patientId, consultationId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filteredImages, setFilteredImages] = useState([]);
  const [expandedImageId, setExpandedImageId] = useState(null);
  
  // Fonction pour basculer l'affichage détaillé d'une image
  const toggleExpandImage = (imageId) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };
  
  // Récupérer les images au chargement du composant
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        console.log('Début de la récupération des images pour le patient:', patientId);
        
        // Déboguer l'URL utilisée
        const url = consultationId 
          ? `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images`
          : `/api/medecin/patients/${patientId}/dossier-medical/images`;
        console.log('URL utilisée pour récupérer les images:', url);
        
        try {
          let imagesData;
          if (consultationId) {
            imagesData = await ImageService.getImagesByPatient(patientId, consultationId);
          } else {
            imagesData = await ImageService.getImagesForPatient(patientId);
          }
          console.log('Images récupérées avec succès:', imagesData);
          
          if (Array.isArray(imagesData)) {
            setImages(imagesData);
            setError(null);
          } else {
            console.error('Les données reçues ne sont pas un tableau:', imagesData);
            setError('Format de données incorrect pour les images.');
          }
        } catch (fetchError) {
          console.error('Erreur lors de la récupération des images:', fetchError);
          
          // Afficher plus de détails sur l'erreur
          if (fetchError.response) {
            console.error('Réponse d\'erreur:', fetchError.response.status, fetchError.response.data);
          } else if (fetchError.request) {
            console.error('Aucune réponse reçue:', fetchError.request);
          }
          
          setError(`Impossible de charger les images: ${fetchError.message || 'Erreur inconnue'}`);
        }
      } catch (err) {
        console.error('Erreur générale:', err);
        setError('Impossible de charger les images. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, [patientId]);
  
  // Filtrer les images lorsque les images ou l'onglet actif changent
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.typeImage === activeTab));
    }
  }, [images, activeTab]);
  
  // Précharger les images pour une meilleure expérience utilisateur
  const imageUrls = images.map(image => 
    ImageService.getImageUrl(patientId, image.id)
  );
  const imagesLoaded = useImagePreloader(imageUrls);
  
  // Calculer le nombre d'images par type
  const countByType = images.reduce((acc, img) => {
    acc[img.typeImage] = (acc[img.typeImage] || 0) + 1;
    return acc;
  }, {});
  
  // Gérer le rafraîchissement des images
  const handleRefresh = async () => {
    try {
      setLoading(true);
      let imagesData;
      if (consultationId) {
        imagesData = await ImageService.getImagesByPatient(patientId, consultationId);
      } else {
        imagesData = await ImageService.getImagesForPatient(patientId);
      }
      setImages(imagesData);
      setError(null);
    } catch (err) {
      setError('Impossible de rafraîchir les images. Veuillez réessayer plus tard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !imagesLoaded) {
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
        <div className="d-flex justify-content-end">
          <Button onClick={handleRefresh} variant="outline-danger">
            Réessayer
          </Button>
        </div>
      </Alert>
    );
  }
  
  if (images.length === 0) {
    return (
      <Alert variant="info">
        <p className="mb-0">Aucune image médicale disponible.</p>
      </Alert>
    );
  }
  
  return (
    <Container fluid className="patient-images">
      {/* Vérificateur d'intégrité des images */}
      <ImageIntegrityChecker patientId={patientId} />
      
      {/* Onglets pour filtrer par type d'image */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="all" 
          title={`Toutes les images (${images.length})`}
        />
        
        {VALID_IMAGE_TYPES.map(type => (
          countByType[type] > 0 && (
            <Tab
              key={type}
              eventKey={type}
              title={`${IMAGE_TYPE_LABELS[type]} (${countByType[type] || 0})`}
            />
          )
        ))}
      </Tabs>
      
      {/* Affichage des images */}
      <Row>
        {filteredImages.length === 0 ? (
          <Col>
            <Alert variant="info">
              Aucune image de type {IMAGE_TYPE_LABELS[activeTab]} disponible.
            </Alert>
          </Col>
        ) : (
          filteredImages.map(image => (
            <Col key={image.id} xs={12} md={6} xl={expandedImageId === image.id ? 12 : 4} className="mb-4">
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
                      {expandedImageId === image.id ? "Réduire" : "Agrandir"}
                    </Button>
                  </Card.Title>
                  
                  {expandedImageId === image.id ? (
                    <div className="expanded-image my-3">
                      <ImageViewer 
                        image={image}
                        patientId={patientId}
                        consultationId={consultationId}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="my-3">
                        <img 
                          src={ImageService.getImageUrl(patientId, image.id)}
                          alt={image.description || 'Image médicale'}
                          className="img-fluid"
                          style={{ maxHeight: '150px', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="text-muted small mb-2">
                        Type: {IMAGE_TYPE_LABELS[image.typeImage] || image.typeImage}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-2 w-100"
                        onClick={() => toggleExpandImage(image.id)}
                      >
                        Voir l'image
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default PatientImages;
