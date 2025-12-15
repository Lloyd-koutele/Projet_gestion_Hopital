import React, { useState } from 'react';
import { ajouterConsultation } from '../../../services/consultationService';
import { Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';

/**
 * Composant pour le formulaire d'ajout de consultation médical dans une modale
 */
function ConsultationForm({ patientId, onConsultationAdded, show, onHide }) {
  const [consultationData, setConsultationData] = useState({
    type: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Gère la soumission du formulaire d'une consultation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Tentative d\'ajout d\'une consultation avec les données:', consultationData);
      const response = await ajouterConsultation(patientId, consultationData);
      
      // Réinitialiser le formulaire
      setConsultationData({
        type: '',
        description: ''
      });
      
      setSuccess(true);
      
      if (onConsultationAdded) {
        onConsultationAdded(response); // Callback pour informer le parent
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de la consultation');
      console.error('Erreur lors de l\'ajout de la consultation:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConsultationData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une consultation médical</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Consultation médicale ajoutée avec succès!</Alert>}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Type de consultation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="type"
              value={consultationData.type}
              onChange={handleChange}
              required
              placeholder="Donner le type de la consultation médicale..."
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={consultationData.description}
              onChange={handleChange}
              required
              placeholder="Décrivez la consultation médicale..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Ajouter la consultation'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConsultationForm;
