import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMesConsultations } from '../../services/patientDashboardService';
import './patientDashboard.css';

/**
 * Composant pour afficher toutes les consultations du patient
 */
const MesConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc');

  // Récupération des consultations au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const consultationsData = await getMesConsultations();
        setConsultations(consultationsData);
        setFilteredConsultations(consultationsData);
      } catch (err) {
        console.error('Erreur lors du chargement des consultations:', err);
        setError('Impossible de charger vos consultations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage et tri des consultations
  useEffect(() => {
    let result = [...consultations];
    
    // Filtrage par date ou type
    if (filterBy !== 'all') {
      // Si on filtre par mois
      if (filterBy === 'month') {
        const currentDate = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);
        
        result = result.filter(consultation => {
          const consultationDate = new Date(consultation.date);
          return consultationDate >= oneMonthAgo;
        });
      }
      // Si on filtre par année
      else if (filterBy === 'year') {
        const currentDate = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
        
        result = result.filter(consultation => {
          const consultationDate = new Date(consultation.date);
          return consultationDate >= oneYearAgo;
        });
      }
    }
    
    // Recherche textuelle
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      result = result.filter(consultation => (
        (consultation.motif && consultation.motif.toLowerCase().includes(search)) ||
        (consultation.diagnostic && consultation.diagnostic.toLowerCase().includes(search)) ||
        (consultation.nomMedecin && consultation.nomMedecin.toLowerCase().includes(search))
      ));
    }
    
    // Tri
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortBy === 'dateAsc') {
        return dateA - dateB;
      } else {
        return dateB - dateA; // Par défaut, tri par date décroissante
      }
    });
    
    setFilteredConsultations(result);
  }, [consultations, searchTerm, filterBy, sortBy]);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <Container className="patient-dashboard mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de vos consultations...</p>
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

  return (
    <Container className="patient-dashboard mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mes Consultations</h1>
        <Link to="/patient">
          <Button variant="outline-secondary">Retour au tableau de bord</Button>
        </Link>
      </div>
      
      {/* Filtres et recherche */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  placeholder="Rechercher une consultation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    Effacer
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Select 
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">Toutes les périodes</option>
                <option value="month">Dernier mois</option>
                <option value="year">Dernière année</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dateDesc">Plus récentes d'abord</option>
                <option value="dateAsc">Plus anciennes d'abord</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Liste des consultations */}
      <div className="consultations-container">
        {filteredConsultations.length === 0 ? (
          <Alert variant="info">
            Aucune consultation ne correspond à vos critères de recherche.
          </Alert>
        ) : (
          filteredConsultations.map(consultation => (
            <Card key={consultation.id} className="mb-3 consultation-card">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <p className="mb-1"><strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Médecin:</strong> {consultation.nomMedecin}</p>
                    {consultation.numMedecin && (
                      <p className="mb-1"><strong>Téléphone:</strong> {consultation.numMedecin}</p>
                    )}
                  </Col>
                  <Col md={7}>
                    <p className="mb-1"><strong>Motif:</strong> {consultation.motif}</p>
                    <p className="mb-1"><strong>Diagnostic:</strong> {consultation.diagnostic || 'Non précisé'}</p>
                    <p className="mb-1"><strong>Recommandations:</strong> {consultation.recommandations || 'Aucune recommandation spécifique'}</p>
                  </Col>
                  <Col md={2} className="d-flex align-items-center justify-content-end">
                    <Link to={`/patient/consultations/${consultation.id}`}>
                      <Button variant="primary">Voir détails</Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default MesConsultations;
