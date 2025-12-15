import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { ajouterImageConsultation, isDicomImage } from '../../../services/imagerieService';

/**
 * Composant pour gerer les images associées à une consultation spécifique
 */
function ConsultationImageManager({ patientId, consultationId, onImageAdded, existingImages = [] }) {
  const [newImage, setNewImage] = useState({
    file: null,
    typeImage: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Réinitialiser le formulaire lorsque la consultation change
  useEffect(() => {
    setNewImage({
      file: null,
      typeImage: '',
      description: ''
    });
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
  }, [consultationId]);

  /**
   * Gére les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files.length > 0) {
      // Créer une URL pour la prévisualisation de l'image
      const fileUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(fileUrl);
      
      const file = files[0];
      
      // Détection automatique du type d'image basée sur l'extension ou le type MIME
      if (name === 'file' && newImage.typeImage === '') {
        let detectedType = 'autre';
        
        // Détection par extension de fichier
        if (file.name.toLowerCase().endsWith('.dcm') || file.type === 'application/dicom') {
          // Seuls les fichiers .dcm ou de type MIME 'application/dicom' sont vraiment des DICOM
          detectedType = 'dicom';
        } else if (file.name.toLowerCase().match(/\.(x-ray|xray|radiographie|rad)\.(jpg|jpeg|png)$/i)) {
          detectedType = 'radiographie';
        } else if (file.name.toLowerCase().match(/\.(ct|scan|scanner)\.(jpg|jpeg|png)$/i)) {
          detectedType = 'scanner';
        } else if (file.name.toLowerCase().match(/\.(mri|irm|rmn)\.(jpg|jpeg|png)$/i)) {
          detectedType = 'irm';
        } else if (file.name.toLowerCase().match(/\.(echo|us|ultrasound|echographie)\.(jpg|jpeg|png)$/i)) {
          detectedType = 'echographie';
        }
        
        console.log(`Type d'image détecté automatiquement: ${detectedType} pour le fichier ${file.name}`);
        
        // Mise à jour du type dans le formulaire
        setNewImage(prev => ({
          ...prev,
          file: file,
          typeImage: detectedType
        }));
      } else {
        setNewImage(prev => ({
          ...prev,
          file: file
        }));
      }
    } else {
      setNewImage(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Gu00e8re la soumission du formulaire d'image
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Vu00e9rifier que tous les champs requis sont remplis
    if (!newImage.file || !newImage.typeImage || !newImage.description) {
      setError('Veuillez remplir tous les champs requis');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', newImage.file);
      formData.append('typeImage', newImage.typeImage);
      formData.append('description', newImage.description);
      
      const response = await ajouterImageConsultation(patientId, consultationId, formData);
      
      // Ru00e9initialiser le formulaire
      setNewImage({
        file: null,
        typeImage: '',
        description: ''
      });
      setPreviewUrl(null);
      setSuccess(true);
      
      // Stocker le lien fichier dans window pour qu'il soit accessible aux composants d'affichage
      if (response && response.id && response.lienFichier) {
        window.imageMedicaleProps = window.imageMedicaleProps || {};
        window.imageMedicaleProps[response.id] = {
          lienFichier: response.lienFichier,
          typeImage: response.typeImage
        };
        console.log(`💡 Lien fichier enregistré pour l'image ${response.id}:`, response.lienFichier);
      }
      
      // Notifier le parent
      if (onImageAdded) {
        onImageAdded(response);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'image:', err);
      setError(err.message || 'Erreur lors de l\'ajout de l\'image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">Ajouter une image à la consultation</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success">
            Image ajoutée avec succès!
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Fichier image <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="file"
              name="file"
              onChange={handleChange}
              accept="image/*"
              required
            />
          </Form.Group>
          
          {previewUrl && (
            <div className="mb-3 text-center">
              <img 
                src={previewUrl} 
                alt="Prévisualisation" 
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
              />
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Type d'image <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="typeImage"
              value={newImage.typeImage}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="dicom">DICOM</option>
              <option value="radiographie">Radiographie</option>
              <option value="scanner">Scanner</option>
              <option value="irm">IRM</option>
              <option value="echographie">Echographie</option>
              <option value="autre">Autre</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Seules les images avec l'extension .dcm sont réellement des fichiers DICOM. 
              Les types Radiographie, Scanner et IRM sont des modalités d'imagerie qui peuvent 
              être enregistrées sous différents formats.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={newImage.description}
              onChange={handleChange}
              required
              placeholder="Décrivez l'image..."
            />
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button 
              variant="info" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Ajouter l\'image'}
            </Button>
          </div>
        </Form>
        
        {/* Affichage des images existantes */}
        {existingImages && existingImages.length > 0 && (
          <div className="mt-4">
            <h5>Images associées à cette consultation</h5>
            <Row xs={1} md={2} className="g-4 mt-2">
              {existingImages.map((image, index) => (
                <Col key={image.id || index}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{image.typeImage}</Card.Title>
                      <Card.Text>{image.description}</Card.Text>
                      <Card.Text>
                        <small className="text-muted">
                          Date: {new Date(image.date).toLocaleDateString()}
                        </small>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ConsultationImageManager;
