import React from 'react';
import { Container } from 'react-bootstrap';
import RendezVousManager from '../components/RendezVous/RendezVousManager';

/**
 * Page principale pour la gestion des rendez-vous (médecin)
 */
const RendezVousPage = () => {
  return (
    <Container fluid className="p-3">
      <RendezVousManager />
    </Container>
  );
};

export default RendezVousPage;
