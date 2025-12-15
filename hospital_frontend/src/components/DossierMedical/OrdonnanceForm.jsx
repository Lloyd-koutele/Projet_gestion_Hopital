import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { ajouterOrdonnanceConsultation } from '../../services/ordonnanceService';

/**
 * Composant pour le formulaire d'ajout d'ordonnance dans une modale
 */
function OrdonnanceForm({ patientId, consultationId, onOrdonnanceAdded, show, onHide }) {
  const [ordonnanceData, setOrdonnanceData] = useState({
    medicaments: '',
    posologie: '',
    instructions: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Utiliser le consultationId s'il est fourni, sinon récupérer la liste des consultations
  useEffect(() => {
    if (show && patientId) {
      if (consultationId) {
        setSelectedConsultation(consultationId);
      } else {
        fetchConsultations();
      }
    }
  }, [show, patientId, consultationId]);
  
  /**
   * Récupère les consultations du patient
   */
  const fetchConsultations = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/medecin/patients/${patientId}/dossier-medical/consultations`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des consultations');
      }
      
      const data = await response.json();
      setConsultations(data);
      
      // Sélectionner automatiquement la première consultation si disponible et qu'aucun consultationId n'a été fourni
      if (!consultationId && data && data.length > 0) {
        setSelectedConsultation(data[0].id);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des consultations:', err);
      setError('Impossible de récupérer les consultations. Veuillez réessayer.');
    }
  };

  /**
   * Gère la soumission du formulaire d'ordonnance
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérifier qu'une consultation est sélectionnée
    if (!selectedConsultation) {
      setError('Veuillez sélectionner une consultation');
      setLoading(false);
      return;
    }

    try {
      // Assurer que les données envoyées correspondent au modèle du backend
      const dataToSend = {
        ...ordonnanceData
      };

      const response = await ajouterOrdonnanceConsultation(patientId, selectedConsultation, dataToSend);
      
      // Réinitialiser le formulaire
      setOrdonnanceData({
        medicaments: '',
        posologie: '',
        instructions: '',
        date: new Date().toISOString().split('T')[0]
      });

      if (onOrdonnanceAdded) {
        onOrdonnanceAdded(response); // Callback pour informer le parent
      }
      
      onHide(); // Fermer la modale après succès
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de l\'ordonnance');
      console.error('Erreur lors de l\'ajout de l\'ordonnance:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrdonnanceData(prev => ({ ...prev, [name]: value }));
  };

  // Utilisation des classes CSS du fichier dossierMedical.css

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
        <Modal.Title>Ajouter une ordonnance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Médicament(s)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="medicaments"
                  value={ordonnanceData.medicaments}
                  onChange={handleChange}
                  placeholder="Entrez les médicaments (un par ligne)"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date de prescription</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={ordonnanceData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Posologie</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="posologie"
                  value={ordonnanceData.posologie}
                  onChange={handleChange}
                  placeholder="Instructions de prise des médicaments"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="instructions"
              value={ordonnanceData.instructions}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default OrdonnanceForm;
