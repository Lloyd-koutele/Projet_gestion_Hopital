import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMonDossierMedical, getMesConsultations } from '../../services/patientDashboardService';
import './patientDashboard.css';

/**
 * Composant principal du tableau de bord patient
 * Affiche une vue d'ensemble du dossier médical et des consultations récentes
 */
const PatientDashboard = () => {
  const [dossier, setDossier] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupération parallèle du dossier médical et des consultations
        const [dossierData, consultationsData] = await Promise.all([
          getMonDossierMedical(),
          getMesConsultations()
        ]);
        
        setDossier(dossierData);
        setConsultations(consultationsData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger vos informations médicales. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <Container className="patient-dashboard mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de votre dossier médical...</p>
        </div>
      </Container>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <Container className="patient-dashboard mt-4">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </Alert>
      </Container>
    );
  }

  // Calcul des consultations récentes (limité à 3)
  const consultationsRecentes = consultations.slice(0, 3);

  return (
    <Container className="patient-dashboard mt-4">
      <h1 className="mb-4">Mon Espace Patient</h1>
      
      {/* Résumé du dossier médical */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Mon Dossier Médical
        </Card.Header>
        <Card.Body>
          {dossier ? (
            <Row>
              <Col md={6}>
                <p><strong>Groupe sanguin:</strong> {dossier.groupeSanguin || 'Non renseigné'}</p>
                <p><strong>Sexe:</strong> {dossier.sexe || 'Non renseigné'}</p>
              </Col>
              <Col md={6}>
                <p><strong>Poids:</strong> {dossier.poids ? `${dossier.poids} kg` : 'Non renseigné'}</p>
                <p><strong>Taille:</strong> {dossier.taille ? `${dossier.taille} cm` : 'Non renseigné'}</p>
              </Col>
              <Col md={12}>
                <p><strong>Contexte médical:</strong> {dossier.contexte || 'Aucun contexte médical particulier'}</p>
              </Col>
            </Row>
          ) : (
            <p>Aucune information disponible dans votre dossier médical.</p>
          )}
          <div className="text-end">
            <Link to="/patient/dossier">
              <Button variant="primary">Voir mon dossier complet</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
      
      {/* Consultations récentes */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Mes Consultations Récentes
        </Card.Header>
        <Card.Body>
          {consultationsRecentes.length > 0 ? (
            <>
              <div className="consultations-list">
                {consultationsRecentes.map(consultation => (
                  <Card key={consultation.id} className="mb-3 consultation-card">
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <p className="mb-1"><strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}</p>
                          <p className="mb-1"><strong>Médecin:</strong> {consultation.nomMedecin}</p>
                        </Col>
                        <Col md={6}>
                          <p className="mb-1"><strong>Motif:</strong> {consultation.motif}</p>
                          <p className="mb-1"><strong>Diagnostic:</strong> {consultation.diagnostic || 'Non précisé'}</p>
                        </Col>
                        <Col md={2} className="d-flex align-items-center justify-content-end">
                          <Link to={`/patient/consultations/${consultation.id}`}>
                            <Button variant="outline-primary" size="sm">Détails</Button>
                          </Link>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
              <div className="text-end mt-3">
                <Link to="/patient/consultations">
                  <Button variant="primary">Voir toutes mes consultations</Button>
                </Link>
              </div>
            </>
          ) : (
            <p>Aucune consultation récente.</p>
          )}
        </Card.Body>
      </Card>
      
      {/* Accès à la gestion des autorisations */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Gestion des Accès
        </Card.Header>
        <Card.Body>
          <p>Gérez les médecins qui peuvent accéder à votre dossier médical.</p>
          <div className="text-end">
            <Link to="/patient/acces">
              <Button variant="primary">Gérer les accès</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientDashboard;
