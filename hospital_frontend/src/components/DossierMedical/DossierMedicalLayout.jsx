import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import PatientAccess from '../Patient/PatientAccess';
import { getUserRole } from '../../auth/authService';


/**
 * Composant de mise en page pour le dossier médical
 * Affiche une liste déroulante à gauche et le contenu sélectionné à droite
 */
const DossierMedicalLayout = forwardRef(({ 
  informationsGenerales,
  consultationsList = {
    listComponent: null,
    formComponent: null,
    detailComponent: null,
    selectedItem: null
  },
  actionsConsultation = {
    listComponent: null,
    formComponent: null,
    selectedItem: null
  },
  analysesList,
  ordonnancesList,
  imagerieContent,
  patientId // Ajout du patientId comme prop
}, ref) => {
  // État pour suivre l'élément actif et le contenu à afficher
  const [activeSection, setActiveSection] = useState('informations');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Exposer des méthodes via la ref
  useImperativeHandle(ref, () => ({
    openConsultationDetail: (consultation) => {
      console.log('DossierMedicalLayout: Ouverture du détail de la consultation', consultation);
      setActiveSection('consultations');
      setSelectedItem(consultation);
    },
    closeConsultationDetail: () => {
      console.log('DossierMedicalLayout: Fermeture du détail de la consultation');
      setActiveSection('consultations');
      setActiveCategory('list');
      setSelectedItem(null);
    }
  }));
  
  // Mettre à jour l'élément sélectionné lorsque consultationsList?.selectedItem change
  useEffect(() => {
    if (consultationsList?.selectedItem) {
      setActiveSection('consultations');
      setSelectedItem(consultationsList.selectedItem);
    }
  }, [consultationsList?.selectedItem]);

  // Fonction pour gérer la sélection d'une section
  const handleSectionSelect = (section) => {
    setActiveSection(section);
    setActiveCategory(null);
    setSelectedItem(null);
  };

  // Fonction pour gérer la sélection d'une catégorie
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setSelectedItem(null);
  };

  // Fonction pour gérer la sélection d'un élément
  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  // Rendu du contenu en fonction de la sélection
  const renderContent = () => {
    if (activeSection === 'informations') {
      return informationsGenerales;
    } else if (activeSection === 'consultations') {
      if (selectedItem && consultationsList) {
        return (
          <div className="dossier-medical-content">
            {/* Contenu détaillé de la consultation sélectionné */}
            {consultationsList.detailComponent && typeof consultationsList.detailComponent === 'function' 
              ? consultationsList.detailComponent(selectedItem)
              : (
                <div className="consultation-detail-fallback">
                  <h3>Détail de la consultation</h3>
                  <p>Détail non disponible</p>
                  <button 
                    onClick={() => setSelectedItem(null)} 
                    className="btn btn-secondary"
                  >
                    Retour
                  </button>
                </div>
              )
            }
          </div>
        );
      } else if (activeCategory === 'list' && consultationsList && consultationsList.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Liste des consultations</h3>
            {consultationsList.listComponent}
          </div>
        );
      } else if (activeCategory === 'add' && consultationsList && consultationsList.formComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Ajouter une consultation</h3>
            {consultationsList.formComponent}
          </div>
        );
      } else if (consultationsList && consultationsList.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Consultations</h3>
            {consultationsList.listComponent}
          </div>
        );
      } else {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Consultations</h3>
            <p>Aucune consultation disponible</p>
          </div>
        );
      }
    } else if (activeSection === 'analyses') {
      if (activeCategory === 'list' && analysesList?.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Liste des analyses</h3>
            {analysesList.listComponent}
          </div>
        );
      } else if (activeCategory === 'add' && analysesList?.formComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Ajouter une analyse</h3>
            {analysesList.formComponent}
          </div>
        );
      } else if (analysesList?.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Analyses</h3>
            {analysesList.listComponent}
          </div>
        );
      }
    } else if (activeSection === 'ordonnances') {
      if (activeCategory === 'list' && ordonnancesList?.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Liste des ordonnances</h3>
            {ordonnancesList.listComponent}
          </div>
        );
      } else if (activeCategory === 'add' && ordonnancesList?.formComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Ajouter une ordonnance</h3>
            {ordonnancesList.formComponent}
          </div>
        );
      } else if (ordonnancesList?.listComponent) {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Ordonnances</h3>
            {ordonnancesList.listComponent}
          </div>
        );
      }
    } else if (activeSection === 'imagerie' && typeof imagerieContent !== 'undefined') {
      return imagerieContent;
    } else if (activeSection === 'gestion-acces' && patientId) {
      // Vérifier si l'utilisateur est un médecin
      const userRole = getUserRole();
      if (userRole === 'MEDECIN') {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Gestion des accès</h3>
            <PatientAccess patientId={patientId} />
          </div>
        );
      } else {
        return (
          <div className="dossier-medical-content">
            <h3 className="dossier-medical-section-title">Gestion des accès</h3>
            <div className="alert alert-warning">
              Seuls les médecins peuvent gérer les accès au dossier médical.
            </div>
          </div>
        );
      }
    }

    return <div className="dossier-medical-content">Sélectionnez une section dans le menu</div>;
  };

  return (
    <div className="dossier-medical-layout no-animation">
      <div className="dossier-medical-header mb-3">
        <h2 className="dossier-medical-title">Dossier Médical</h2>
      </div>
      {/* Sidebar avec menu déroulant */}
      <div className="dossier-medical-sidebar no-animation">
        <div 
          className={`dossier-medical-menu-item ${activeSection === 'informations' ? 'active' : ''}`}
          onClick={() => handleSectionSelect('informations')}
        >
          Informations générales
        </div>

        <div 
          className={`dossier-medical-menu-item ${activeSection === 'consultations' ? 'active' : ''}`}
          onClick={() => handleSectionSelect('consultations')}
        >
          Consultations
        </div>

        {/* Les boutons Analyses, Ordonnances et Imagerie médicale ont été supprimés
           car ils sont déjà gérés dans les consultations */}
           
        {/* La gestion des accès a été supprimée car elle est déjà gérée dans l'interface principale du médecin */}
        
        {activeSection === 'consultations' && (
          <div className="dossier-medical-submenu">
            <div 
              className={`dossier-medical-submenu-item ${activeCategory === 'list' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('list')}
            >
              Voir les consultations
            </div>
            <div 
              className={`dossier-medical-submenu-item ${activeCategory === 'add' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('add')}
            >
              Ajouter une consultation
            </div>
          </div>
        )}

      </div>
      {/* Contenu principal */}
      <div className="dossier-medical-main-content">
        {renderContent()}
      </div>
    </div>
  );
});

export default DossierMedicalLayout;
