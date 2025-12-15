import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

/**
 * Modal pour reporter un rendez-vous à une nouvelle date
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.show - Indique si le modal est visible
 * @param {Function} props.onHide - Fonction appelée lors de la fermeture du modal
 * @param {Function} props.onSubmit - Fonction appelée lors de la soumission du formulaire
 */
const ReporterModal = ({ show, onHide, onSubmit }) => {
  // État pour la nouvelle date et heure
  const [nouvelleDateHeure, setNouvelleDateHeure] = useState(new Date());
  const [error, setError] = useState(null);

  // Réinitialisation des états lors de l'ouverture du modal
  React.useEffect(() => {
    if (show) {
      // Définir une date par défaut qui est dans le futur (demain, même heure)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNouvelleDateHeure(tomorrow);
      setError(null);
    }
  }, [show]);

  // Validation et soumission du formulaire
  const handleSubmit = () => {
    // Vérifier que la date est valide
    if (!nouvelleDateHeure) {
      setError('Veuillez sélectionner une date et heure');
      return;
    }

    // Vérifier que la date est dans le futur
    const now = new Date();
    if (nouvelleDateHeure <= now) {
      setError('La nouvelle date doit être dans le futur');
      return;
    }

    // Appeler la fonction de soumission
    onSubmit(nouvelleDateHeure.toISOString());
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reporter le rendez-vous</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nouvelle date et heure</Form.Label>
            <div>
              <DatePicker
                selected={nouvelleDateHeure}
                onChange={date => {
                  setNouvelleDateHeure(date);
                  setError(null);
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={new Date()}
                className="form-control"
              />
            </div>
            <Form.Text className="text-muted">
              Sélectionnez une date et heure dans le futur.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Reporter
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReporterModal;
