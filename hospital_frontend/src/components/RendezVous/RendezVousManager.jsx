import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Alert } from 'react-bootstrap';
// Utiliser les imports depuis index.js plutôt que des imports directs
import { RendezVousList, RendezVousForm } from './index.js';

/**
 * Composant principal pour la gestion des rendez-vous par un médecin
 * Contient des onglets pour les différentes vues et le formulaire de création
 */
const RendezVousManager = () => {
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('today');
  
  // État pour rafraîchir la liste après modifications
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // État pour les messages système
  const [systemMessage, setSystemMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  // Fonction pour afficher un message système temporaire
  const showSystemMessage = (message, type = 'success') => {
    setMessageType(type);
    setSystemMessage(message);
    
    // Effacer le message après 5 secondes
    setTimeout(() => {
      setSystemMessage(null);
    }, 5000);
  };

  // Gestionnaire après création d'un rendez-vous
  const handleRendezVousCreated = (data) => {
    // Rafraîchir la liste
    setRefreshTrigger(prev => prev + 1);
    
    // Afficher un message de succès
    showSystemMessage(`Rendez-vous créé avec succès pour ${data.patientPrenom} ${data.patientNom}`);
    
    // Basculer sur l'onglet du jour
    setActiveTab('today');
  };

  // Gestionnaire après une action sur un rendez-vous
  const handleActionPerformed = (message) => {
    if (message) {
      showSystemMessage(message);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container>
      <h2 className="mb-4">Gestion des rendez-vous</h2>
      
      {/* Affichage des messages système */}
      {systemMessage && (
        <Alert 
          variant={messageType} 
          onClose={() => setSystemMessage(null)} 
          dismissible
        >
          {systemMessage}
        </Alert>
      )}
      
      <Row>
        {/* Colonne principale: liste des rendez-vous */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="today" title="Aujourd'hui">
                  <RendezVousList
                    mode="today"
                    refreshTrigger={refreshTrigger}
                    onActionPerformed={handleActionPerformed}
                  />
                </Tab>
                <Tab eventKey="upcoming" title="À venir">
                  <RendezVousList
                    mode="upcoming"
                    refreshTrigger={refreshTrigger}
                    onActionPerformed={handleActionPerformed}
                  />
                </Tab>
                <Tab eventKey="all" title="Tous les rendez-vous">
                  <RendezVousList
                    mode="all"
                    refreshTrigger={refreshTrigger}
                    onActionPerformed={handleActionPerformed}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Colonne latérale: formulaire de création */}
        <Col lg={4}>
          <Card>
            <Card.Body>
              <RendezVousForm onSuccess={handleRendezVousCreated} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RendezVousManager;
