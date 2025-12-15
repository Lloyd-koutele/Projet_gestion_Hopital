import React, { useState, useEffect } from 'react';
import CreatePatient from './CreatePatient';
import DossierMedical from './DossierMedical';
import PatientAccess from './Patient/PatientAccess';
import Medecin from '../logique/Medecin';
import { isAuthenticated } from '../auth/authService';
import { invalidatePatientsCache } from '../services/medecinService';
import { searchEntities } from '../utils/searchUtils';

function MedecinDashboard() {
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showDossierMedical, setShowDossierMedical] = useState(false);
  const [showPatientAccess, setShowPatientAccess] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const { patients, loading, error, fetchPatients } = Medecin({ onSuccess: () => {
    // Ne pas appeler fetchPatients() ici pour éviter une boucle d'appels
    alert('Opération réussie !');
  } });
  
  // Filtrer les patients en fonction du terme de recherche
  useEffect(() => {
    if (patients && patients.length > 0) {
      if (searchTerm.trim() === '') {
        // Si aucun terme de recherche, on montre les 5 premiers patients ou tous selon l'état
        setFilteredPatients(showAllPatients ? patients : patients.slice(0, 5));
      } else {
        // Sinon on filtre avec TF-IDF
        const searchResults = searchEntities(patients, searchTerm, {
          fields: ['nom', 'prenom', 'email', 'telephone'],
          weights: { nom: 2, prenom: 2, email: 1, telephone: 1 }
        });
        setFilteredPatients(searchResults);
      }
    } else {
      setFilteredPatients([]);
    }
  }, [patients, searchTerm, showAllPatients]);

  // Utiliser une référence pour suivre si une requête a déjà été envoyée
  const [patientsFetched, setPatientsFetched] = useState(false);

  useEffect(() => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      console.log('Token dans Medecin:', token);
      console.log('Role dans Medecin:', userRole);
      console.log('État de l\'authentification:', isAuthenticated());

      // Ne charger les patients que si la liste est visible ET qu'ils n'ont pas déjà été chargés
      if (showPatientList && !patientsFetched) {
        console.log('Tentative de récupération des patients...');
        fetchPatients();
        setPatientsFetched(true);
      }
    }, [showPatientList, patientsFetched]);
    
  // Déterminer si nous devons afficher un bouton de diagnostic basé sur l'erreur
  const isNetworkError = error && (
    error.includes('Impossible de se connecter au serveur') || 
    error.includes('Network Error') ||
    error.includes('ERR_CONNECTION_REFUSED') ||
    error.includes('ERR_NETWORK')
  );



  return (
    <div style={{
      padding: '2rem',
      width: '100%',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        color: '#2c3e50',
        marginBottom: '2rem'
      }}>Interface Médecin</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#3498db', marginBottom: '1rem' }}>Gestion des Patients</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => setShowCreatePatient(!showCreatePatient)}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {showCreatePatient ? 'Fermer le formulaire' : 'Ajouter un patient'}
              </button>
            </li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Consultations</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
            <button 
                onClick={() => setShowPatientList(!showPatientList)}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {showPatientList ? 'Masquer la liste' : 'Liste des patients'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {showCreatePatient && (
        <div style={{ marginTop: '2rem' }}>
          <CreatePatient
            onSuccess={() => {
              setShowCreatePatient(false);
              // Invalider le cache et recharger les patients
              invalidatePatientsCache();
              fetchPatients();
              alert('Patient créé avec succès !');
            }}
          />
        </div>
      )}

      {showPatientList && (
        <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#3498db', marginBottom: '1rem' }}>Liste des Patients</h2>
          
          {/* Barre de recherche */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, prénom, email ou téléphone..."
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e0',
                flexGrow: 1
              }}
            />
            <button
              onClick={() => setShowAllPatients(!showAllPatients)}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showAllPatients ? 'Afficher 5 patients' : 'Afficher tous'}
            </button>
          </div>
          
          {/* Information sur le nombre de patients */}
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#718096' }}>
            {patients.length > 0 && (
              <p>
                Affichage de {filteredPatients.length} patient(s) sur un total de {patients.length} 
                {searchTerm && ` - Recherche: "${searchTerm}"`}
              </p>
            )}
          </div>
          
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <div>
              <p style={{ color: '#e74c3c' }}>{error}</p>
              {isNetworkError && (
                <button
                  onClick={() => setShowDiagnostic(true)}
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Diagnostiquer le problème de connexion
                </button>
              )}
            </div>
          ) : patients.length === 0 ? (
            <p>Aucun patient trouvé</p>
          ) : filteredPatients.length === 0 ? (
            <p>Aucun patient ne correspond à votre recherche</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Nom</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Prénom</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Email</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Téléphone</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Date de naissance</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{patient.nom}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{patient.prenom}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{patient.email}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{patient.telephone}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        {new Date(patient.dateNaissance).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              // Ouvrir le dossier médical dans un nouvel onglet
                              window.open(`/dossier-medical/${patient.id}`, '_blank');
                            }}
                            style={{
                              background: '#3498db',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Dossier médical
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setShowPatientAccess(true);
                              setShowPatientList(false);
                            }}
                            style={{
                              background: '#27ae60',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Gérer les accès
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showDossierMedical && selectedPatientId && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#3498db' }}>Dossier Médical du Patient</h2>
            <button
              onClick={() => {
                setShowDossierMedical(false);
                setShowPatientList(true);
              }}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retour à la liste des patients
            </button>
          </div>
          <DossierMedical
            patientId={selectedPatientId}
            onClose={() => {
              setShowDossierMedical(false);
              setShowPatientList(true);
            }}
          />
        </div>
      )}

      {showPatientAccess && selectedPatientId && (
        <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#27ae60' }}>Gestion des accès au dossier patient</h2>
            <button
              onClick={() => {
                setShowPatientAccess(false);
                setShowPatientList(true);
              }}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retour à la liste des patients
            </button>
          </div>
          <PatientAccess
            patientId={selectedPatientId}
            onClose={() => {
              setShowPatientAccess(false);
              setShowPatientList(true);
            }}
          />
        </div>
      )}
      
      {showDiagnostic && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <ConnectionDiagnostic onClose={() => setShowDiagnostic(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MedecinDashboard;
