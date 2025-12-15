import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  getMesRendezVous, 
  getRendezVousDuJour, 
  getRendezVousAVenir,
  confirmerRendezVous, 
  annulerRendezVous,
  reporterRendezVous,
  terminerRendezVous,
  marquerAbsence
} from '../../services/rendezVousService';
import ReporterModal from './ReporterModal';

/**
 * Composant pour afficher les listes de rendez-vous avec différentes vues
 * @param {Object} props - Propriétés du composant
 * @param {string} props.mode - Mode d'affichage ('today', 'upcoming', 'all')
 * @param {number} props.refreshTrigger - Déclencheur de rafraîchissement
 * @param {Function} props.onActionPerformed - Fonction appelée après une action
 */
const RendezVousList = ({ mode = 'today', refreshTrigger = 0, onActionPerformed }) => {
  // État pour les rendez-vous
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le modal de report
  const [showReporterModal, setShowReporterModal] = useState(false);
  const [selectedRdvId, setSelectedRdvId] = useState(null);

  // Chargement initial et après modifications
  useEffect(() => {
    fetchRendezVous();
  }, [mode, refreshTrigger]);

  // Récupération des rendez-vous selon le mode
  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      // Appel de l'API selon le mode
      switch (mode) {
        case 'today':
          response = await getRendezVousDuJour();
          break;
        case 'upcoming':
          response = await getRendezVousAVenir();
          break;
        case 'all':
        default:
          response = await getMesRendezVous();
          break;
      }

      if (response.success) {
        // Tri des rendez-vous par date/heure
        const sortedRendezVous = response.data.sort((a, b) => 
          new Date(a.dateHeure) - new Date(b.dateHeure)
        );
        setRendezVous(sortedRendezVous);
      } else {
        setError(response.message || 'Erreur lors de la récupération des rendez-vous');
      }
    } catch (err) {
      setError(`Erreur lors de la récupération des rendez-vous: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Confirmer un rendez-vous
  const handleConfirmer = async (id) => {
    try {
      setError(null);
      const response = await confirmerRendezVous(id);
      if (response.success) {
        if (onActionPerformed) onActionPerformed('Rendez-vous confirmé avec succès');
        fetchRendezVous();
      } else {
        setError(response.message || 'Erreur lors de la confirmation');
      }
    } catch (err) {
      setError(`Erreur lors de la confirmation: ${err.message}`);
      console.error(err);
    }
  };

  // Annuler un rendez-vous
  const handleAnnuler = async (id) => {
    try {
      setError(null);
      const response = await annulerRendezVous(id);
      if (response.success) {
        if (onActionPerformed) onActionPerformed('Rendez-vous annulé avec succès');
        fetchRendezVous();
      } else {
        setError(response.message || 'Erreur lors de l\'annulation');
      }
    } catch (err) {
      setError(`Erreur lors de l'annulation: ${err.message}`);
      console.error(err);
    }
  };

  // Préparer le report d'un rendez-vous
  const handlePrepareReporter = (id) => {
    setSelectedRdvId(id);
    setShowReporterModal(true);
  };

  // Reporter un rendez-vous
  const handleReporterSubmit = async (nouvelleDateHeure) => {
    try {
      setError(null);
      const response = await reporterRendezVous(selectedRdvId, nouvelleDateHeure);
      if (response.success) {
        setShowReporterModal(false);
        if (onActionPerformed) onActionPerformed('Rendez-vous reporté avec succès');
        fetchRendezVous();
      } else {
        setError(response.message || 'Erreur lors du report');
      }
    } catch (err) {
      setError(`Erreur lors du report: ${err.message}`);
      console.error(err);
    }
  };

  // Marquer un rendez-vous comme terminé
  const handleTerminer = async (id) => {
    try {
      setError(null);
      const response = await terminerRendezVous(id);
      if (response.success) {
        if (onActionPerformed) onActionPerformed('Rendez-vous marqué comme terminé');
        fetchRendezVous();
      } else {
        setError(response.message || 'Erreur lors de la clôture du rendez-vous');
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      console.error(err);
    }
  };

  // Marquer un patient comme absent
  const handleAbsence = async (id) => {
    try {
      setError(null);
      const response = await marquerAbsence(id);
      if (response.success) {
        if (onActionPerformed) onActionPerformed('Absence du patient marquée');
        fetchRendezVous();
      } else {
        setError(response.message || 'Erreur lors du marquage d\'absence');
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      console.error(err);
    }
  };

  // Obtenir la variante de couleur selon le statut
  const getBadgeVariant = (statut) => {
    switch (statut) {
      case 'PLANIFIE': return 'info';
      case 'CONFIRME': return 'success';
      case 'ANNULE': return 'danger';
      case 'REPORTE': return 'warning';
      case 'TERMINE': return 'secondary';
      case 'ABSENCE': return 'dark';
      default: return 'light';
    }
  };

  // Formater la date et l'heure
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Déterminer si on affiche uniquement la date d'aujourd'hui
  const formatDateTimeShort = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const today = new Date();
    
    // Si c'est aujourd'hui, afficher seulement l'heure
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Sinon afficher la date et l'heure
    return formatDateTime(dateTimeStr);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
        <p className="mt-2">Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Titre selon le mode */}
      {mode === 'today' && <h5 className="mb-3">Rendez-vous d'aujourd'hui</h5>}
      {mode === 'upcoming' && <h5 className="mb-3">Rendez-vous à venir</h5>}
      {mode === 'all' && <h5 className="mb-3">Tous les rendez-vous</h5>}
      
      {/* Tableau des rendez-vous */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Date et heure</th>
            <th>Patient</th>
            <th>Motif</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Message si aucun rendez-vous */}
          {rendezVous.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                {mode === 'today' && "Aucun rendez-vous pour aujourd'hui"}
                {mode === 'upcoming' && "Aucun rendez-vous à venir"}
                {mode === 'all' && "Aucun rendez-vous"}
              </td>
            </tr>
          ) : (
            // Liste des rendez-vous
            rendezVous.map((rdv) => (
              <tr key={rdv.id}>
                <td>
                  {mode === 'today' 
                    ? formatDateTimeShort(rdv.dateHeure) 
                    : formatDateTime(rdv.dateHeure)
                  }
                </td>
                <td>{rdv.patientPrenom} {rdv.patientNom}</td>
                <td>{rdv.motif}</td>
                <td>
                  <Badge bg={getBadgeVariant(rdv.statut)}>{rdv.statut}</Badge>
                </td>
                <td>
                  {/* Actions selon le statut */}
                  {rdv.statut === 'PLANIFIE' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleConfirmer(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Confirmer
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handlePrepareReporter(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Reporter
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleAnnuler(rdv.id)}
                        className="me-1 mb-1"
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                  
                  {rdv.statut === 'CONFIRME' && (
                    <>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleTerminer(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Terminé
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handlePrepareReporter(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Reporter
                      </Button>
                      <Button 
                        variant="dark" 
                        size="sm" 
                        onClick={() => handleAbsence(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Absence
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleAnnuler(rdv.id)}
                        className="me-1 mb-1"
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                  
                  {rdv.statut === 'REPORTE' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleConfirmer(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Confirmer
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handlePrepareReporter(rdv.id)} 
                        className="me-1 mb-1"
                      >
                        Reporter encore
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleAnnuler(rdv.id)}
                        className="me-1 mb-1"
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      
      {/* Bouton de rafraîchissement */}
      <Button 
        variant="outline-primary" 
        onClick={fetchRendezVous}
        className="mb-3"
      >
        Actualiser
      </Button>
      
      {/* Modal pour reporter un rendez-vous */}
      <ReporterModal 
        show={showReporterModal} 
        onHide={() => setShowReporterModal(false)} 
        onSubmit={handleReporterSubmit}
      />
    </div>
  );
};

export default RendezVousList;
