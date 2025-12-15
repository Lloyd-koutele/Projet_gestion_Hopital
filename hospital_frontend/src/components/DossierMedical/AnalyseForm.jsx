import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { ajouterAnalyseConsultation } from '../../services/analyseService';

/**
 * Composant pour le formulaire d'ajout d'analyse dans une modale
 */
function AnalyseForm({ patientId, consultationId, onAnalyseAdded, show, onHide }) {
  const [analyseData, setAnalyseData] = useState({
    typeAnalyse: '',
    resultat: '',
    dateAnalyse: new Date().toISOString().split('T')[0],
    Laboratoire: ''
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
   * Gère la soumission du formulaire d'analyse
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
      const response = await ajouterAnalyseConsultation(patientId, selectedConsultation, analyseData);
      // Réinitialiser le formulaire
      setAnalyseData({
        typeAnalyse: '',
        resultat: '',
        dateAnalyse: new Date().toISOString().split('T')[0],
        Laboratoire: ''
      });
      if (onAnalyseAdded) {
        onAnalyseAdded(response); // Callback pour informer le parent
      }
      onHide(); // Fermer la modale après succès
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de l\'analyse');
      console.error('Erreur lors de l\'ajout de l\'analyse:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnalyseData(prev => ({ ...prev, [name]: value }));
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
        <Modal.Title>Ajouter une analyse médicale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type d'analyse</Form.Label>
                <Form.Control
                  type="text"
                  name="typeAnalyse"
                  value={analyseData.typeAnalyse}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date de l'analyse</Form.Label>
                <Form.Control
                  type="date"
                  name="dateAnalyse"
                  value={analyseData.dateAnalyse}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Résultat</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="resultat"
              value={analyseData.resultat}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Laboratoire</Form.Label>
            <Form.Control
              type="text"
              name="Laboratoire"
              value={analyseData.Laboratoire}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AnalyseForm;
