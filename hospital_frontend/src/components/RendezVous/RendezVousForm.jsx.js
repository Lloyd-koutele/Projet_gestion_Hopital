import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { creerRendezVous, verifierDisponibilite } from '../../services/rendezVousService';
import { searchPatients } from '../../services/patientService';

/**
 * Formulaire de création de rendez-vous avec recherche de patient
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onSuccess - Fonction appelée après création réussie
 */
const RendezVousForm = ({ onSuccess }) => {
  // État pour la recherche de patient
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // État pour le formulaire
  const [dateHeure, setDateHeure] = useState(() => {
    // Initialiser à l'heure actuelle, arrondie aux 15 minutes suivantes
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    return now;
  });
  const [duree, setDuree] = useState(30);
  const [motif, setMotif] = useState('');
  const [notes, setNotes] = useState('');
  
  // État pour les messages et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disponibiliteMessage, setDisponibiliteMessage] = useState(null);
  const [disponible, setDisponible] = useState(null);
  
  // Effet pour la recherche avec debounce
  useEffect(() => {
    // Annuler les recherches précédentes
    const handler = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Effet pour vérifier la disponibilité
  useEffect(() => {
    if (selectedPatient && dateHeure) {
      checkDisponibilite();
    }
  }, [selectedPatient, dateHeure, duree]);
  
  // Recherche de patients
  const handleSearch = async () => {
    try {
      setSearching(true);
      setShowResults(true);
      
      // Appel de l'API de recherche avec TF-IDF
      const result = await searchPatients(searchTerm);
      setSearchResults(result.data || []);
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  // Sélection d'un patient
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.prenom} ${patient.nom}`);
    setShowResults(false);
    
    // Vérifier la disponibilité après sélection
    checkDisponibilite();
  };
  
  // Vérification de disponibilité
  const checkDisponibilite = async () => {
    try {
      if (!selectedPatient || !dateHeure) return;
      
      setDisponibiliteMessage(null);
      setDisponible(null);
      
      // Appel de l'API pour vérifier la disponibilité
      const response = await verifierDisponibilite({
        patientId: selectedPatient.id,
        dateHeure: dateHeure.toISOString(),
        duree
      });
      
      if (response.success) {
        setDisponible(response.data.disponible);
        setDisponibiliteMessage(response.data.message);
        
        if (!response.data.disponible) {
          setError(response.data.message);
        } else {
          setError(null);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de disponibilité:", err);
      setDisponible(false);
      setDisponibiliteMessage("Erreur lors de la vérification de disponibilité");
    }
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation des champs
      if (!selectedPatient) {
        setError("Veuillez sélectionner un patient");
        return;
      }
      
      if (!motif.trim()) {
        setError("Veuillez saisir un motif pour le rendez-vous");
        return;
      }
      
      if (!disponible) {
        setError("Ce créneau n'est pas disponible. Veuillez choisir un autre moment.");
        return;
      }
      
      // Désactiver le formulaire pendant la soumission
      setLoading(true);
      setError(null);
      
      // Créer le rendez-vous
      const response = await creerRendezVous({
        patientId: selectedPatient.id,
        dateHeure: dateHeure.toISOString(),
        duree,
        motif,
        notes
      });
      
      if (response.success) {
        // Réinitialiser le formulaire
        setSelectedPatient(null);
        setSearchTerm('');
        setMotif('');
        setNotes('');
        
        // Initialiser la date à l'heure actuelle + 15min
        const newDate = new Date();
        const minutes = Math.ceil(newDate.getMinutes() / 15) * 15;
        newDate.setMinutes(minutes, 0, 0);
        setDateHeure(newDate);
        
        // Réinitialiser la durée
        setDuree(30);
        
        // Appeler le callback de succès
        if (onSuccess) onSuccess(response.data);
      } else {
        setError(response.message || "Erreur lors de la création du rendez-vous");
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h4 className="mb-3">Planifier un rendez-vous</h4>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        {/* Recherche de patient */}
        <Form.Group className="mb-3 position-relative">
          <Form.Label>Patient</Form.Label>
          <div className="input-group mb-2">
            <Form.Control
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => selectedPatient && setShowResults(true)}
              disabled={loading}
              autoComplete="off"
              required
            />
            {searching && (
              <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                <Spinner animation="border" size="sm" />
              </div>
            )}
          </div>
          
          {/* Résultats de recherche */}
          {showResults && searchResults.length > 0 && (
            <ListGroup className="position-absolute w-100 z-index-dropdown">
              {searchResults.map(patient => (
                <ListGroup.Item 
                  key={patient.id}
                  action
                  onClick={() => handleSelectPatient(patient)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{patient.prenom} {patient.nom}</strong>
                    {patient.dateNaissance && (
                      <small className="text-muted ms-2">
                        {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
                      </small>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          
          {showResults && searchResults.length === 0 && searchTerm.trim().length >= 2 && !searching && (
            <Alert variant="info" className="mt-2">
              Aucun patient trouvé pour cette recherche
            </Alert>
          )}
          
          {selectedPatient && (
            <Form.Text className="text-success">
              Patient sélectionné: {selectedPatient.prenom} {selectedPatient.nom}
            </Form.Text>
          )}
        </Form.Group>
        
        {/* Date et heure */}
        <Form.Group className="mb-3">
          <Form.Label>Date et heure</Form.Label>
          <DatePicker
            selected={dateHeure}
            onChange={date => setDateHeure(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            minDate={new Date()}
            className="form-control"
            disabled={loading}
            required
          />
        </Form.Group>
        
        {/* Durée */}
        <Form.Group className="mb-3">
          <Form.Label>Durée (minutes)</Form.Label>
          <Form.Select
            value={duree}
            onChange={e => setDuree(parseInt(e.target.value))}
            disabled={loading}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 heure</option>
            <option value="90">1h30</option>
            <option value="120">2 heures</option>
          </Form.Select>
        </Form.Group>
        
        {/* Indicateur de disponibilité */}
        {disponible !== null && disponibiliteMessage && (
          <Alert variant={disponible ? "success" : "warning"} className="mb-3">
            {disponibiliteMessage}
          </Alert>
        )}
        
        {/* Motif */}
        <Form.Group className="mb-3">
          <Form.Label>Motif du rendez-vous</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={motif}
            onChange={e => setMotif(e.target.value)}
            disabled={loading}
            required
          />
        </Form.Group>
        
        {/* Notes */}
        <Form.Group className="mb-3">
          <Form.Label>Notes complémentaires (optionnel)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={loading}
          />
        </Form.Group>
        
        {/* Bouton de soumission */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !selectedPatient || disponible === false}
          className="w-100"
        >
          {loading ? 'Création en cours...' : 'Créer le rendez-vous'}
        </Button>
      </Form>
    </div>
  );
};

export default RendezVousForm;
