import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { creerRendezVous, verifierDisponibilite, getMedecinId } from '../../services/rendezVousService';
import { getPatientsAccessibles } from '../../services/accessManagementService';
import { searchEntities } from '../../utils/searchUtils';

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
  const [accessiblePatients, setAccessiblePatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
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
  
  // Chargement initial des patients accessibles
  useEffect(() => {
    const loadAccessiblePatients = async () => {
      try {
        setLoadingPatients(true);
        const patients = await getPatientsAccessibles();
        setAccessiblePatients(patients || []);
        console.log('Patients accessibles chargés:', patients.length);
      } catch (err) {
        console.error("Erreur lors du chargement des patients accessibles:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    
    loadAccessiblePatients();
  }, []);

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
  }, [searchTerm, accessiblePatients]);
  
  // Effet pour vérifier la disponibilité
  useEffect(() => {
    if (selectedPatient && dateHeure) {
      checkDisponibilite();
    }
  }, [selectedPatient, dateHeure, duree]);
  
  // Recherche de patients avec TF-IDF côté frontend
  const handleSearch = () => {
    try {
      setSearching(true);
      setShowResults(true);
      
      // Vérifier que les patients accessibles sont chargés
      if (!accessiblePatients || accessiblePatients.length === 0) {
        setSearchResults([]);
        return;
      }
      
      // Configuration pour la recherche TF-IDF
      const fields = ['nom', 'prenom', 'email', 'telephone'];
      const weights = { nom: 2, prenom: 2, email: 1.5, telephone: 1 };
      
      // Appliquer l'algorithme TF-IDF pour trier les résultats par pertinence
      const sortedResults = searchEntities(accessiblePatients, searchTerm, {
        fields,
        weights
      });
      
      setSearchResults(sortedResults);
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
      setError(null);
      
      console.log("Vérification de disponibilité pour:", selectedPatient);
      console.log("Date et heure:", dateHeure.toISOString());
      console.log("Durée:", duree);
      
      // Appel de l'API pour vérifier la disponibilité
      const response = await verifierDisponibilite({
        patientId: selectedPatient.id,
        dateHeure: dateHeure.toISOString(),
        duree
      });
      
      console.log("Réponse de vérification de disponibilité:", response);
      
      // Gestion des différentes structures de réponse possibles
      if (response) {
        if (response.success) {
          // Structure normale: { success: true, data: { disponible: bool, message: string } }
          const isDisponible = Boolean(response.data?.disponible);
          console.log("Disponibilité (structure normale):", isDisponible);
          
          setDisponible(isDisponible);
          setDisponibiliteMessage(response.data?.message || 'Vérification effectuée');
          
          if (!isDisponible) {
            setError(response.data?.message || 'Ce créneau n\'est pas disponible');
          }
        } else if (response.disponible !== undefined) {
          // Structure alternative: { disponible: bool, message: string }
          const isDisponible = Boolean(response.disponible);
          console.log("Disponibilité (structure alternative):", isDisponible);
          
          setDisponible(isDisponible);
          setDisponibiliteMessage(response.message || 'Vérification effectuée');
          
          if (!isDisponible) {
            setError(response.message || 'Ce créneau n\'est pas disponible');
          }
        } else {
          // Format inconnu ou erreur
          console.warn("Format de réponse inconnu:", response);
          setDisponible(true); // Par défaut, considérer comme disponible
          setDisponibiliteMessage('Format de réponse inconnu, créneau considéré comme disponible');
        }
      } else {
        // Pas de réponse
        console.warn("Pas de réponse de vérification de disponibilité");
        setDisponible(true); // Par défaut, considérer comme disponible
        setDisponibiliteMessage('Vérification impossible, créneau considéré comme disponible');
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de disponibilité:", err);
      setDisponible(false);
      setDisponibiliteMessage("Erreur lors de la vérification de disponibilité");
      setError("Erreur lors de la vérification de disponibilité: " + err.message);
    }
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Tentative de soumission du formulaire");
    console.log("Patient sélectionné:", selectedPatient);
    console.log("Disponibilité actuelle:", disponible);
    console.log("Motif:", motif);
    
    // Forcer une vérification de disponibilité si elle n'a pas encore été faite
    if (selectedPatient && disponible === null) {
      await checkDisponibilite();
      // Attendre 500ms pour permettre à l'état de se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      // Validation des champs
      if (!selectedPatient) {
        setError("Veuillez sélectionner un patient");
        console.log("Erreur: Aucun patient sélectionné");
        return;
      }
      
      if (!motif.trim()) {
        setError("Veuillez saisir un motif pour le rendez-vous");
        console.log("Erreur: Motif vide");
        return;
      }
      
      // Vérifier explicitement la disponibilité si elle n'a pas été vérifiée
      if (disponible === null) {
        console.log("Vérification de disponibilité avant soumission...");
        await checkDisponibilite();
        // Ne pas continuer ici, laisser la prochaine tentative de soumission poursuivre
        return;
      }
      
      if (disponible === false) {
        setError("Ce créneau n'est pas disponible. Veuillez choisir un autre moment.");
        console.log("Erreur: Créneau non disponible");
        return;
      }
      
      // Désactiver le formulaire pendant la soumission
      setLoading(true);
      setError(null);
      
      console.log("Préparation des données pour création du rendez-vous");
      const rdvData = {
        patientId: selectedPatient.id,
        dateHeure: dateHeure.toISOString(),
        duree,
        motif: motif.trim(),
        notes: notes.trim()
      };
      
      console.log("Données à envoyer:", rdvData);
      
      // Créer le rendez-vous
      const response = await creerRendezVous(rdvData);
      console.log("Réponse de création de rendez-vous:", response);
      
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
      
      {/* Message informatif sur les patients accessibles */}
      <Alert variant="info" className="mb-3">
        <small>
          <i className="bi bi-info-circle me-2"></i>
          Vous ne pouvez prendre rendez-vous qu'avec les patients auxquels vous avez accès.
        </small>
      </Alert>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Message d'erreur si aucun patient accessible */}
      {!loadingPatients && accessiblePatients.length === 0 && (
        <Alert variant="warning" className="mb-3">
          Vous n'avez accès à aucun patient. Veuillez contacter l'administrateur ou vérifier vos autorisations.
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
              Aucun patient trouvé pour cette recherche parmi les patients auxquels vous avez accès
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
          onClick={() => {
            // Log de débogage pour comprendre l'état du bouton
            console.log("État du bouton - loading:", loading);
            console.log("État du bouton - selectedPatient:", Boolean(selectedPatient));
            console.log("État du bouton - disponible:", disponible);
          }}
        >
          {loading ? 'Création en cours...' : 'Créer le rendez-vous'}
        </Button>
      </Form>
    </div>
  );
};

export default RendezVousForm;
