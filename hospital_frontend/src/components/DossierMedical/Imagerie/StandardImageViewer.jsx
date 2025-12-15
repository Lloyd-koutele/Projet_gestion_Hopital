import React, { useState, useEffect } from 'react';
import { Card, Image, Spinner, Alert, Button } from 'react-bootstrap';
import ImageService from '../../../services/imagerieService';
import './StandardImageViewer.css';

/**
 * Composant simplifié pour afficher une image standard (non-DICOM)
 * Sans possibilité d'ouvrir dans une nouvelle fenêtre
 */
const StandardImageViewer = ({ imageId, typeImage, description, dateCreation, patientId, consultationId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageId || !patientId) {
        setError('Identifiants manquants');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Chargement de l'image: patientId=${patientId}, imageId=${imageId}`);
        
        // Récupérer le blob avec authentification
        const blob = consultationId 
          ? await ImageService.getImage(patientId, consultationId, imageId)
          : await ImageService.getImage(patientId, imageId);
        
        // Vérifier le type MIME et la taille du blob pour le débogage
        console.log(`Blob reçu: taille=${blob.size} octets, type=${blob.type || 'non spécifié'}`);
        
        if (blob.size === 0) {
          throw new Error('Le blob reçu est vide');
        }
        
        // Créer une URL à partir du blob
        const url = URL.createObjectURL(blob);
        console.log('URL blob créée:', url);
        setImageUrl(url);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadImage();

    // Nettoyer les URL blob lors du démontage pour éviter les fuites mémoire
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageId, patientId, consultationId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <Card className="standard-image-viewer-card mb-3">
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
        <div className="image-container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="mt-2">Chargement de l'image...</span>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-2">
              <Alert.Heading>Erreur de chargement</Alert.Heading>
              <p>{error}</p>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                Réessayer
              </Button>
            </Alert>
          ) : (
            <Image
              src={imageUrl}
              alt={description || 'Image médicale'}
              className="standard-image"
              style={{ maxWidth: '100%', maxHeight: '400px', width: 'auto', height: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                console.error('Erreur de chargement de l\'image:', e);
                
                // Si c'est la première erreur, essayer avec une image de secours encodée en base64
                if (!imageUrl.includes('fallbackImage')) {
                  console.log('Tentative avec image de secours encodée en base64...');
                  // Image générique encodée en base64 (un petit carré gris avec texte)
                  const fallbackImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgaW5kaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
                  setImageUrl(fallbackImageBase64 + '?fallbackImage=true');
                } else {
                  // Si même l'image de secours ne fonctionne pas, afficher l'erreur
                  setError('L\'image n\'a pas pu être chargée et l\'image de secours a également échoué');
                }
              }}
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StandardImageViewer;
