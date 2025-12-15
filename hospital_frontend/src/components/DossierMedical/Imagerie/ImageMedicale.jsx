import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import ImageService from '../../../services/imagerieService';
import './ImageMedicale.css';

/**
 * Composant pour afficher une image médicale standard
 */
const ImageMedicale = ({ patientId, imageId, typeImage, description, dateCreation, consultationId }) => {
  // Récupérer l'URL complète de l'image (incluant le domaine et le préfixe API)
  const imageUrl = ImageService.getImageUrl(patientId, imageId);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDicom, setIsDicom] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  // Référence à l'élément image pour accéder à ses propriétés si nécessaire
  const imageRef = useRef(null);


  // Vérifier si l'image est de type DICOM et charger l'image
  useEffect(() => {
    const loadImage = async () => {
      try {
        // Utiliser consultationId s'il est fourni
        const blob = consultationId 
          ? await ImageService.getImage(patientId, consultationId, imageId)
          : await ImageService.getImage(patientId, imageId);
        
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        setError(true);
        console.error("Erreur lors du chargement de l'image standard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [patientId, imageId, consultationId]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
    
    // Afficher des informations détaillées sur l'erreur
    console.error(`Erreur lors du chargement de l'image ${imageId}`);
    console.error(`URL de l'image: ${imageUrl}`);
    
    // Tester si l'URL est accessible avec fetch pour obtenir plus d'informations
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        } else {
          console.log('URL accessible mais l\'image ne peut pas être affichée');
        }
      })
      .catch(err => {
        console.error('Erreur réseau lors de la vérification de l\'URL:', err);
      });
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    // Forcer le rechargement de l'image en ajoutant un timestamp à l'URL
    if (isDicom) {
      // Pour les images DICOM, nous réinitialisons simplement l'état
      setLoading(false);
    } else {
      // Pour les images normales, nous préchargeons à nouveau
      const img = new Image();
      img.src = `${imageUrl}?t=${new Date().getTime()}`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
    }
  };

  return (
    <Card className="image-medicale-card mb-3">
      <Card.Header>
        <h5>{description || 'Image sans description'}</h5>
        <div className="text-muted">
          Type: {typeImage}
          {dateCreation && (
            <span className="ms-2">
              Date: {new Date(dateCreation).toLocaleDateString()}
            </span>
          )}
        </div>
      </Card.Header>
      <Card.Body className="text-center">
        {loading && !error && (
          <div className="spinner-container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        )}
        
        {!error ? (
          <div>
            <img
              ref={imageRef}
              src={blobUrl}
              alt={`Image médicale - ${typeImage}`}
              className="img-fluid medical-image"
              style={{ 
                display: loading ? 'none' : 'block', 
                maxHeight: '400px', 
                width: 'auto'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="image-error p-4">
            <div className="alert alert-danger">
              <p>Impossible de charger l'image</p>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={handleRetry}
              >
                Réessayer
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
      
    </Card>
  );
};

export default ImageMedicale;
