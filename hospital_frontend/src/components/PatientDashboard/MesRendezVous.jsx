import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { getMesRendezVousPatient, annulerRendezVous } from '../../services/rendezVousService';

/**
 * Composant pour afficher et gérer les rendez-vous d'un patient
 */
const MesRendezVous = () => {
  // États
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Chargement initial des rendez-vous
  useEffect(() => {
    fetchRendezVous();
  }, []);

  // Récupération des rendez-vous du patient connecté
  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMesRendezVousPatient();
      
      if (response.success) {
        // Tri des rendez-vous: d'abord les prochains, puis les passés
        const now = new Date();
        
        const sortedRendezVous = response.data.sort((a, b) => {
          const dateA = new Date(a.dateHeure);
          const dateB = new Date(b.dateHeure);
          
          // Si les deux dates sont dans le futur ou les deux dans le passé,
          // trier par ordre chronologique
          if ((dateA > now && dateB > now) || (dateA <= now && dateB <= now)) {
            return dateA - dateB;
          }
          
          // Sinon, mettre les rendez-vous futurs en premier
          return dateA > now ? -1 : 1;
        });
        
        setRendezVous(sortedRendezVous);
      } else {
        setError(response.message || "Erreur lors de la récupération des rendez-vous");
      }
    } catch (err) {
      setError(`Une erreur est survenue: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Annulation d'un rendez-vous
  const handleAnnuler = async (id) => {
    try {
      setError(null);
      
      // Confirmation de l'utilisateur
      if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
        return;
      }
      
      const response = await annulerRendezVous(id);
      
      if (response.success) {
        setSuccessMessage("Rendez-vous annulé avec succès");
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        
        // Rafraîchir la liste
        fetchRendezVous();
      } else {
        setError(response.message || "Erreur lors de l'annulation du rendez-vous");
      }
    } catch (err) {
      setError(`Une erreur est survenue: ${err.message}`);
      console.error(err);
    }
  };

  // Obtenir le style du badge selon le statut
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

  // Formatage de la date et heure
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

  // Vérifier si un rendez-vous est à venir
  const isUpcoming = (dateTimeStr) => {
    const rdvDate = new Date(dateTimeStr);
    const now = new Date();
    return rdvDate > now;
  };

  // Vérifier si un rendez-vous peut être annulé par le patient
  const canCancel = (rdv) => {
    return (rdv.statut === 'PLANIFIE' || rdv.statut === 'CONFIRME') && isUpcoming(rdv.dateHeure);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement de vos rendez-vous...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Mes rendez-vous</h2>
      
      {/* Messages d'erreur et de succès */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          {rendezVous.length === 0 ? (
            <Alert variant="info">
              Vous n'avez aucun rendez-vous prévu.
            </Alert>
          ) : (
            <>
              <h4 className="mb-3">Prochains rendez-vous</h4>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Date et heure</th>
                    <th>Médecin</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rendezVous
                    .filter(rdv => isUpcoming(rdv.dateHeure))
                    .map(rdv => (
                      <tr key={rdv.id}>
                        <td>{formatDateTime(rdv.dateHeure)}</td>
                        <td>Dr. {rdv.medecinPrenom} {rdv.medecinNom}</td>
                        <td>{rdv.motif}</td>
                        <td>
                          <Badge bg={getBadgeVariant(rdv.statut)}>
                            {rdv.statut}
                          </Badge>
                        </td>
                        <td>
                          {canCancel(rdv) ? (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleAnnuler(rdv.id)}
                            >
                              Annuler
                            </Button>
                          ) : (
                            <span className="text-muted">Aucune action disponible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  
                  {rendezVous.filter(rdv => isUpcoming(rdv.dateHeure)).length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Vous n'avez aucun rendez-vous à venir
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              <h4 className="mb-3 mt-4">Historique des rendez-vous</h4>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Date et heure</th>
                    <th>Médecin</th>
                    <th>Motif</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rendezVous
                    .filter(rdv => !isUpcoming(rdv.dateHeure))
                    .map(rdv => (
                      <tr key={rdv.id}>
                        <td>{formatDateTime(rdv.dateHeure)}</td>
                        <td>Dr. {rdv.medecinPrenom} {rdv.medecinNom}</td>
                        <td>{rdv.motif}</td>
                        <td>
                          <Badge bg={getBadgeVariant(rdv.statut)}>
                            {rdv.statut}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  
                  {rendezVous.filter(rdv => !isUpcoming(rdv.dateHeure)).length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Aucun rendez-vous passé
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
          
          <div className="mt-3">
            <Button 
              variant="outline-primary" 
              onClick={fetchRendezVous}
            >
              Actualiser la liste
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MesRendezVous;
