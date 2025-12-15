import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Form } from 'react-bootstrap';
import { getConsultation } from '../../../services/consultationService';
import ConsultationList from './ConsultationList';
import ConsultationDetail from './ConsultationDetail';
import ConsultationForm from './ConsultationForm';

/**
 * Composant central pour la gestion des consultations médicales
 * Centralise les fonctionnalités liées aux consultations (liste, détail, ajout)
 */
function ConsultationManager({ patientId, activeCategory, selectedItem: externalSelectedItem, onSelectItem }) {
  const [consultations, setConsultations] = useState([]);
  const [sortedConsultations, setSortedConsultations] = useState([]);
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(externalSelectedItem);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Effet pour charger les consultation au chargement du composant
  useEffect(() => {
    fetchConsultations();
  }, [patientId]);
  
  // Effet pour trier les consultations quand ils changent ou quand l'ordre de tri change
  useEffect(() => {
    if (consultations.length > 0) {
      sortConsultations(sortOrder);
    } else {
      setSortedConsultations([]);
    }
  }, [consultations, sortOrder]);
  
  // Effet pour synchroniser l'élément sélectionné externe avec l'état interne
  useEffect(() => {
    if (externalSelectedItem) {
      setSelectedConsultation(externalSelectedItem);
    }
  }, [externalSelectedItem]);

  /**
   * Récupère la liste des consultations depuis l'API
   */
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await getConsultation(patientId);
      setConsultations(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des consultations:', err);
      setError('Impossible de récupérer les consultations. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Trie les consultations selon l'ordre spécifié
   */
  const sortConsultations = (order) => {
    const sorted = [...consultations];
    
    if (order === 'date-desc') {
      sorted.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    } else if (order === 'date-asc') {
      sorted.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
    } else if (order === 'type') {
      sorted.sort((a, b) => {
        return (a.type || '').localeCompare(b.type || '');
      });
    }
    
    setSortedConsultations(sorted);
  };
  
  /**
   * Gère le changement d'ordre de tri
   */
  const handleSortChange = (e) => {
    const newOrder = e.target.value;
    setSortOrder(newOrder);
  };

  /**
   * Gère le clic sur une consultation pour afficher ses détails
   */
  const handleConsultationClick = (consultation) => {
    setSelectedConsultation(consultation);
    if (onSelectItem) {
      onSelectItem(consultation);
    }
  };

  /**
   * Ferme le détail d'une consultation
   */
  const handleCloseDetail = () => {
    console.log("Fermeture du détail de la consultation");
    // Réinitialiser manuellement l'état local
    setSelectedConsultation(null);
    
    // Notifier le composant parent
    if (onSelectItem) {
      console.log("Notification du composant parent pour fermeture");
      onSelectItem(null);
    }
    
    // Force re-render
    setTimeout(() => {
      console.log("Force re-render après fermeture");
      fetchConsultations();
    }, 100);
  };

  /**
   * Gère l'ajout d'un nouvelle consultation
   */
  const handleConsultationAdded = (newConsultation) => {
    setConsultations(prevConsultations => [newConsultation, ...prevConsultations]);
    setShowAddModal(false);
  };

  /**
   * Gère la mise à jour d'une Consultation existante
   */
  const handleConsultationUpdate = () => {
    fetchConsultations();
  };

  // Affichage en cas de chargement
  if (loading && consultations.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status" variant="primary" />
        <span className="ms-3">Chargement des consultations...</span>
      </div>
    );
  }

  // Affichage du détail d'une consultation sélectionné
  if (selectedConsultation) {
    return (
      <ConsultationDetail
        consultation={selectedConsultation}
        patientId={patientId}
        onClose={handleCloseDetail}
        onUpdate={handleConsultationUpdate}
      />
    );
  }

  // Affichage principal (liste des Consultations)
  return (
    <div className="consultation-manager">
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Consultation médicales</h3>
        <div className="d-flex gap-3">
          <Form.Group>
            <Form.Select 
              value={sortOrder}
              onChange={handleSortChange}
              className="me-2"
            >
              <option value="date-desc">Plus récents d'abord</option>
              <option value="date-asc">Plus anciens d'abord</option>
              <option value="type">Par type</option>
            </Form.Select>
          </Form.Group>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-2"></i> Ajouter une consultation
          </Button>
        </div>
      </div>
      
      <ConsultationList
        consultations={sortedConsultations.length > 0 ? sortedConsultations : consultations}
        onConsultationClick={handleConsultationClick}
      />
      
      {/* Modal pour ajouter une consultation */}
      <ConsultationForm
        patientId={patientId}
        onConsultationAdded={handleConsultationAdded}
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      />
    </div>
  );
}

export default ConsultationManager;
