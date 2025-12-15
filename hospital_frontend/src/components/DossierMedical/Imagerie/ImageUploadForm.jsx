import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { ajouterImageConsultation } from '../../../services/imagerieService';

/**
 * Composant pour ajouter une image à un antécédent via une modale
 */
function ImageUploadForm({ patientId, consultationId, show, onHide, onImageAdded }) {
  const [newImage, setNewImage] = useState({
    file: null,
    typeImage: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Réinitialiser le formulaire lorsque la modale s'ouvre
  useEffect(() => {
    if (show) {
      setNewImage({
        file: null,
        typeImage: '',
        description: ''
      });
      setPreviewUrl(null);
      setError(null);
    }
  }, [show]);

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files.length > 0) {
      // Créer une URL pour la prévisualisation de l'image
      const fileUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(fileUrl);
      
      setNewImage(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setNewImage(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Gère la soumission du formulaire d'image
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérifier que tous les champs requis sont remplis
    if (!newImage.file || !newImage.typeImage || !newImage.description) {
      setError('Veuillez remplir tous les champs requis');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', newImage.file);
      // Important: s'assurer que typeImage est correctement envoyé (sans notation [])
      formData.append('typeImage', newImage.typeImage);
      formData.append('description', newImage.description);
      formData.append('consultationId', consultationId);
      
      const response = await ajouterImageConsultation(patientId, consultationId, formData);
      
      // Notifier le parent
      if (onImageAdded) {
        onImageAdded(response);
      }
      
      // Fermer la modale
      onHide();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'image:', err);
      setError(err.message || 'Erreur lors de l\'ajout de l\'image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une image à la consultation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            {error}
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
          
          <Row>
            <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Type d'image <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="typeImage"
              value={newImage.typeImage}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="dicom">DICOM (.dcm)</option>
              <option value="radiographie">Radiographie</option>
              <option value="scanner">Scanner</option>
              <option value="irm">IRM</option>
              <option value="echographie">Échographie</option>
              <option value="autre">Autre</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Seules les images avec l'extension .dcm sont des fichiers DICOM.
              Les types Radiographie, Scanner et IRM sont des modalités, pas des formats de fichier.
            </Form.Text>
          </Form.Group>
            </Col>
            <Col md={6}>
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
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Ajouter l\'image'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImageUploadForm;
