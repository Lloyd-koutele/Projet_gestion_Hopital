import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Table, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SearchableMedecinSelect from './SearchableMedecinSelect';
import { formatDateFr, isDateInFuture } from '../../utils/dateUtils';
import * as accessService from '../../services/accessManagementService';
import './AccessManagement.css';

/**
 * Composant unifié pour la gestion des autorisations d'accès
 * Peut être utilisé en mode médecin ou patient
 * @param {Object} props - Propriétés du composant
 * @param {string} props.mode - Mode d'utilisation ('medecin' ou 'patient')
 * @param {number} props.patientId - ID du patient (requis en mode médecin)
 * @param {Function} props.onClose - Fonction appelée à la fermeture
 * @param {Object} props.patient - Infos du patient (optionnel en mode médecin)
 * @param {boolean} props.forceIsMedecinReferent - Force l'état "isMedecinReferent" (utilisé pour les tests)
 */
const AccessManagement = ({ 
  mode = 'patient', 
  patientId, 
  onClose, 
  patient: initialPatient,
  forceIsMedecinReferent = null
}) => {
  const [patient, setPatient] = useState(initialPatient);
  const [autorisations, setAutorisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isMedecinReferent, setIsMedecinReferent] = useState(false);
  
  // État pour le formulaire d'ajout d'autorisation
  const [formData, setFormData] = useState({
    medecinEmail: '',
    selectedMedecin: null,
    niveauAcces: 'COMPLET',
    dateExpiration: ''
  });
  
  // Déterminer si nous sommes en mode médecin ou patient
  const isMedecinMode = mode === 'medecin';
  
  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let autorisationsData;
        
        if (isMedecinMode) {
          // Mode médecin - charger les autorisations pour un patient spécifique
          if (!patientId) {
            throw new Error('ID du patient requis en mode médecin');
          }
          
          // Si le patient n'est pas fourni, le récupérer
          if (!patient) {
            const patientData = await import('../../services/patientService')
              .then(module => module.getPatientById(patientId));
            setPatient(patientData);
          }
          
          // Si forceIsMedecinReferent est défini, l'utiliser
          if (forceIsMedecinReferent !== null) {
            console.log("Force l'état isMedecinReferent à:", forceIsMedecinReferent);
            setIsMedecinReferent(forceIsMedecinReferent);
          } else {
            // Sinon, vérifier avec l'API
            const isReferent = await import('../../services/accessManagementService')
              .then(module => module.verifierSiMedecinReferent(patientId));
            console.log("Vérification API dans AccessManagement - Est médecin référent:", isReferent);
            setIsMedecinReferent(isReferent);
          }
          
          // Récupérer les autorisations d'accès pour ce patient
          autorisationsData = await accessService.getMedecinsAvecAcces(patientId);
        } else {
          // Mode patient - charger les autorisations pour le patient connecté
          autorisationsData = await accessService.getMesMedecinsAvecAcces();
        }
        
        console.log('Données d\'autorisations brutes reçues:', autorisationsData);
        setAutorisations(adaptAutorisations(autorisationsData));
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, isMedecinMode, patient]);
  
  // Adapter les réponses d'autorisation du backend au format unifié pour le frontend
  const adaptAutorisations = (autorisationsData) => {
    if (!Array.isArray(autorisationsData)) {
      console.error('Format de données inattendu pour les autorisations:', autorisationsData);
      return [];
    }
    
    // Adaptation différente selon le format des données reçues
    return autorisationsData.map(auth => {
      // Essayer de déterminer la structure des données
      const medecinId = auth.medecinAutoriseId || (auth.medecinAutorise ? auth.medecinAutorise.id : null);
      const medecinNom = auth.medecinAutoriseNom || 
                       (auth.medecinAutorise ? `${auth.medecinAutorise.prenom} ${auth.medecinAutorise.nom}` : 'Inconnu');
      const medecinSpecialite = auth.medecinAutoriseSpecialite || 
                              (auth.medecinAutorise ? auth.medecinAutorise.specialite : '');
      
      // Construire un objet unifié
      return {
        id: auth.id,
        medecinId: medecinId,
        medecinNom: medecinNom,
        medecinSpecialite: medecinSpecialite,
        niveauAcces: auth.niveauAcces,
        dateExpiration: auth.dateExpiration,
        dateCreation: auth.dateCreation,
        accordeurNom: auth.medecinAccordeurNom || 
                    (auth.medecinAccordeur ? `${auth.medecinAccordeur.prenom} ${auth.medecinAccordeur.nom}` : 'Le patient')
      };
    });
  };
  
  // Gestionnaire de changement des champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Gestionnaire pour la sélection d'un médecin
  const handleMedecinSelect = (medecin) => {
    console.log("AccessManagement: Médecin sélectionné:", medecin);
    
    // S'assurer que toutes les propriétés nécessaires sont présentes
    const completeMedecin = {
      ...medecin,
      id: medecin.id || 0,
      email: medecin.email || "",
      nom: medecin.nom || "",
      prenom: medecin.prenom || "",
      specialite: medecin.specialite || ""
    };
    
    // Mettre à jour le formulaire avec les données du médecin
    setFormData(prevData => ({
      ...prevData,
      medecinEmail: completeMedecin.email,
      selectedMedecin: completeMedecin
    }));
    
    // Effacer toute erreur précédente et afficher un message de confirmation
    setError(null);
    setSuccessMessage(`Dr. ${completeMedecin.prenom} ${completeMedecin.nom} sélectionné. Cliquez sur "Accorder l'accès" pour confirmer.`);
    
    // Pour le débogage
    console.log("État du formulaire après sélection:", {
      ...formData,
      medecinEmail: completeMedecin.email,
      selectedMedecin: completeMedecin
    });
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };
  
  // Gestionnaire pour accorder un accès
  const handleAccorderAcces = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log("Données du formulaire au moment de l'accès:", formData);
      
      // Validation du formulaire
      if (!formData.selectedMedecin && !formData.medecinEmail) {
        throw new Error('Veuillez sélectionner un médecin');
      }
      
      // Validation de la date d'expiration (doit être dans le futur)
      if (formData.dateExpiration && !isDateInFuture(formData.dateExpiration)) {
        throw new Error('La date d\'expiration doit être dans le futur');
      }
      
      // Récupérer ou utiliser le médecin sélectionné
      let medecin = formData.selectedMedecin;
      if (!medecin && formData.medecinEmail) {
        try {
          medecin = await accessService.rechercherMedecinParEmail(formData.medecinEmail);
          console.log("Médecin trouvé par email:", medecin);
        } catch (err) {
          console.error("Erreur lors de la recherche du médecin par email:", err);
          // Si la recherche par email échoue, on peut essayer de rechercher plus généralement
          const medecins = await accessService.rechercherMedecin(formData.medecinEmail);
          if (medecins && medecins.length > 0) {
            medecin = medecins[0];
            console.log("Médecin trouvé par recherche générale:", medecin);
          }
        }
      }
      
      if (!medecin) {
        throw new Error(`Aucun médecin trouvé ou sélectionné`);
      }
      
      // S'assurer que l'ID est présent et valide
      if (!medecin.id) {
        console.error("Médecin sans ID trouvé:", medecin);
        throw new Error(`L'ID du médecin est manquant ou invalide`);
      }
      
      console.log("Médecin validé pour l'attribution d'accès:", medecin);
      
      // Convertir le niveau d'accès
      const niveauAcces = accessService.convertirNiveauAcces(formData.niveauAcces);
      
      // Accorder l'accès selon le mode
      if (isMedecinMode) {
        await accessService.accorderAccesMedecin(
          patientId,
          medecin.id,
          niveauAcces,
          formData.dateExpiration || null
        );
      } else {
        await accessService.accorderAccesPatient(
          medecin.id,
          formData.dateExpiration || null
        );
      }
      
      // Rafraîchir la liste des autorisations
      const autorisationsData = isMedecinMode
        ? await accessService.getMedecinsAvecAcces(patientId)
        : await accessService.getMesMedecinsAvecAcces();
      
      setAutorisations(adaptAutorisations(autorisationsData));
      
      // Réinitialiser le formulaire
      setFormData({
        medecinEmail: '',
        selectedMedecin: null,
        niveauAcces: 'COMPLET',
        dateExpiration: ''
      });
      
      // Fermer le modal et afficher un message de succès
      setShowModal(false);
      setSuccessMessage(`Accès accordé avec succès au Dr. ${medecin.prenom} ${medecin.nom}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'attribution d\'un accès:', err);
      setError(err.message || 'Erreur lors de l\'attribution d\'un accès');
    } finally {
      setLoading(false);
    }
  };
  
  // Gestionnaire pour révoquer un accès
  const handleRevoquerAcces = async (autorisation) => {
    const confirmMessage = `Êtes-vous sûr de vouloir révoquer l'accès du Dr. ${autorisation.medecinNom} ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        // Révoquer l'accès selon le mode
        if (isMedecinMode) {
          await accessService.revoquerAcces(autorisation.id);
        } else {
          await accessService.revoquerAccesPatient(autorisation.medecinId);
        }
        
        // Rafraîchir la liste des autorisations
        const autorisationsData = isMedecinMode
          ? await accessService.getMedecinsAvecAcces(patientId)
          : await accessService.getMesMedecinsAvecAcces();
        
        setAutorisations(adaptAutorisations(autorisationsData));
        
        setSuccessMessage(`Accès révoqué avec succès pour le Dr. ${autorisation.medecinNom}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Erreur lors de la révocation d\'un accès:', err);
        setError(err.message || 'Erreur lors de la révocation d\'un accès');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Titre du composant selon le mode
  const getTitle = () => {
    if (isMedecinMode) {
      return `Gestion des accès au dossier de ${patient?.prenom || ''} ${patient?.nom || ''}`;
    } else {
      return "Gestion des accès à mon dossier médical";
    }
  };
  
  // URL de retour selon le mode
  const getReturnUrl = () => {
    return isMedecinMode ? `/medecin/patients/${patientId}` : '/patient';
  };
  
  // Si en cours de chargement
  if (loading && autorisations.length === 0) {
    return (
      <Container className="access-management mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des autorisations d'accès...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="access-management mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="access-management-title">{getTitle()}</h2>
        {onClose ? (
          <Button variant="outline-secondary" onClick={onClose}>
            Fermer
          </Button>
        ) : (
          <Link to={getReturnUrl()}>
            <Button variant="outline-secondary">
              Retour
            </Button>
          </Link>
        )}
      </div>
      
      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Liste des médecins avec accès */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white d-flex justify-content-between align-items-center">
          <span>Médecins autorisés</span>
          {/* Afficher le bouton uniquement si c'est le patient ou le médecin référent */}
          {(!isMedecinMode || isMedecinReferent) && (
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => setShowModal(true)}
            >
              Ajouter un médecin
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {/* Message informatif pour les médecins non référents */}
          {isMedecinMode && !isMedecinReferent && (
            <Alert variant="info" className="mb-3">
              <strong>Note :</strong> Seul le médecin référent 
              {patient?.medecinReferent ? ` (Dr. ${patient.medecinReferent.prenom} ${patient.medecinReferent.nom})` : ''} 
              peut accorder l'accès à d'autres médecins pour ce patient.
            </Alert>
          )}
          
          {autorisations.length === 0 ? (
            <Alert variant="info">
              Aucun médecin n'a actuellement accès à ce dossier médical.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Niveau d'accès</th>
                  <th>Expire le</th>
                  <th>Accordé par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {autorisations.map(auth => (
                  <tr key={auth.id}>
                    <td>{auth.medecinNom}</td>
                    <td>{auth.medecinSpecialite || 'Non spécifié'}</td>
                    <td>
                      <span className={`access-level-badge access-level-${auth.niveauAcces.toLowerCase()}`}>
                        {auth.niveauAcces === 'LECTURE_SEULE' ? 'Lecture seule' : 
                         auth.niveauAcces === 'MODIFICATION' ? 'Écriture' : 
                         auth.niveauAcces === 'COMPLET' ? 'Accès complet' : 
                         auth.niveauAcces}
                      </span>
                    </td>
                    <td>
                      {auth.dateExpiration ? formatDateFr(auth.dateExpiration) : 'Pas d\'expiration'}
                    </td>
                    <td>{auth.accordeurNom}</td>
                    <td>
                      {/* Afficher le bouton de révocation uniquement pour les autorisations que l'utilisateur peut révoquer */}
                      {(!isMedecinMode || isMedecinReferent || auth.accordeurNom === 'Le patient') && (
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRevoquerAcces(auth)}
                          disabled={loading}
                        >
                          Révoquer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Guide d'utilisation */}
      <Card className="mb-4 shadow-sm info-card">
        <Card.Header as="h5" className="bg-primary text-white">
          Informations sur l'accès au dossier médical
        </Card.Header>
        <Card.Body>
          <p>
            <strong>Qui peut voir ce dossier médical ?</strong>
          </p>
          <ul>
            <li>Les médecins à qui l'accès a été explicitement accordé.</li>
            <li>Le médecin référent du patient.</li>
            <li>En cas d'urgence médicale, le personnel médical autorisé.</li>
          </ul>
          <p>
            <strong>Comment fonctionne la gestion des accès ?</strong>
          </p>
          <ul>
            <li>Vous pouvez accorder l'accès à n'importe quel médecin enregistré dans le système.</li>
            <li>Vous pouvez optionnellement définir une date d'expiration pour l'accès.</li>
            <li>Vous pouvez révoquer l'accès à tout moment.</li>
          </ul>
        </Card.Body>
      </Card>
      
      {/* Modal pour ajouter un médecin */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Accorder l'accès à un médecin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner un médecin</Form.Label>
      <SearchableMedecinSelect 
                onSelect={handleMedecinSelect}
                value={formData.medecinEmail || ''}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date d'expiration (optionnelle)</Form.Label>
              <Form.Control 
                type="date" 
                name="dateExpiration"
                value={formData.dateExpiration}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              <Form.Text className="text-muted">
                Si non spécifiée, l'accès sera accordé sans limite de temps.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
      <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAccorderAcces}
            disabled={(!formData.selectedMedecin && !formData.medecinEmail) || loading}
          >
            Accorder l'accès
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccessManagement;
