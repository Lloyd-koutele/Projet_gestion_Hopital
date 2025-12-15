import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { updateDossierMedical } from '../../services/medecinService';
import { getAllPatientAnalyses } from '../../services/analyseService';
import { getAllPatientOrdonnances } from '../../services/ordonnanceService';
import { ConsultationManager, ConsultationDetail } from './ConsultationMedical';
import AnalyseForm from './AnalyseForm';
import OrdonnanceForm from './OrdonnanceForm';
import ImagerieMedicale from './ImagerieMedicale';
import DossierMedicalLayout from './DossierMedicalLayout';
import ConsultationForm from './ConsultationMedical/ConsultationForm';
// Import du fichier CSS
import '../../styles/dossierMedicalIndex.css';

/**n
 * Composant principal du dossier médical avec le gestionnaire de consultations
 */
function DossierMedical({ patientId }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDossier, setEditedDossier] = useState(null);
  
  // États pour les analyses et ordonnances
  const [analyses, setAnalyses] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  
  // État minimal pour les consultations - uniquement l'état de sélection
  // Le reste est géré par le gestionnaire de consultations
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  
  // États pour gérer l'affichage des modales d'ajout
  const [showAddAnalyseModal, setShowAddAnalyseModal] = useState(false);
  const [showAddOrdonnanceModal, setShowAddOrdonnanceModal] = useState(false);
  const [showAddConsultationModal, setShowAddConsultationModal] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (patientId) {
      fetchDossierMedical();
    }
  }, [patientId]);

  /**
   * Récupere le dossier médical du patient
   */
  const fetchDossierMedical = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/medecin/patients/${patientId}/dossier-medical`, {
        headers: {
          'Authorization': token
        }
      });
      setDossier(response.data);
      setError(null);
      
      // Récupérer uniquement les analyses et ordonnances
      // Les antécédents sont gérés par le composant AntecedentManager
      fetchAnalyses();
      fetchOrdonnances();
    } catch (err) {
      console.error('Erreur lors de la récupération du dossier médical:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération du dossier médical');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère les ordonnances du patient
   */
  const fetchOrdonnances = async () => {
    try {
      const response = await getAllPatientOrdonnances(patientId);
      setOrdonnances(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des ordonnances:', err);
    }
  };

  /**
   * Récupère les analyses du patient
   */
  const fetchAnalyses = async () => {
    try {
      const response = await getAllPatientAnalyses(patientId);
      setAnalyses(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des analyses:', err);
    }
  };

  /**
   * Gère l'activation du mode édition
   */
  const handleEdit = () => {
    // Vérifier que le dossier existe avant d'activer le mode édition
    if (!dossier) {
      setError('Impossible de modifier le dossier: données non chargées');
      return;
    }
    
    setIsEditing(true);
    setEditedDossier({ ...dossier });
  };

  /**
   * Gère la sauvegarde des modifications du dossier
   */
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation des données essentielles
      if (!editedDossier.sexe) {
        throw new Error('Le sexe est un champ obligatoire');
      }
      
      // Création d'un objet propre avec seulement les champs attendus par le backend
      const dossierToUpdate = {
        id: editedDossier.id,
        sexe: editedDossier.sexe,
        groupeSanguin: editedDossier.groupeSanguin || null,
        poids: editedDossier.poids || null,
        taille: editedDossier.taille || null,
        contexte: editedDossier.contexte || ''
      };
      
      console.log('Données du dossier médical à envoyer:', dossierToUpdate);
      
      await updateDossierMedical(patientId, dossierToUpdate);
      setDossier(editedDossier);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du dossier médical:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère l'annulation de l'édition
   */
  const handleCancel = () => {
    setIsEditing(false);
    setEditedDossier(null);
  };

  /**
   * Gère l'ajout d'une nouvelle analyse
   */
  const handleAnalyseAdded = (newAnalyse) => {
    setAnalyses(prevAnalyses => [...prevAnalyses, newAnalyse]);
    // Fermer la modale
    setShowAddAnalyseModal(false);
  };

  /**
   * Gère l'ajout d'une nouvelle ordonnance
   */
  const handleOrdonnanceAdded = (newOrdonnance) => {
    setOrdonnances(prevOrdonnances => [...prevOrdonnances, newOrdonnance]);
    // Fermer la modale
    setShowAddOrdonnanceModal(false);
  };

  /**
   * Gère l'ajout d'une nouvelle consultation
   */
  const handleConsultationAdded = (newConsultation) => {
    // Rafraîchir les données après l'ajout d'une consultation
    fetchDossierMedical();
    // Fermer la modale
    setShowAddConsultationModal(false);
  };

  /**
   * Fonction pour gérer la sélection d'une consultation
   */
  const handleSelectConsultation = (consultation) => {
    setSelectedConsultation(consultation);
  };

  /**
   * Fonction pour rafraichir les données après des modifications
   */
  const handleDataUpdate = () => {
    fetchAnalyses();
    fetchOrdonnances();
  };

  // Rendu des informations générales
  const renderInformationsGenerales = () => {
    // Si le dossier n'est pas encore chargé, afficher un message de chargement
    if (!dossier) {
      return (
        <div>
          <h3 className="info-generales-title">Informations Générales</h3>
          <div className="info-generales-container">
            <p>Chargement des informations...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h3 className="info-generales-title">Informations Générales</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn-edit"
              style={{ marginLeft: 'auto' }}
            >
              Modifier
            </button>
          ) : (
            <div className="btn-container" style={{ marginLeft: 'auto' }}>
              <button
                onClick={handleSave}
                className="btn-save"
              >
                Enregistrer
              </button>
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="info-generales-container">
            <p><strong>Sexe:</strong> {dossier?.sexe || 'Non spécifié'}</p>
            <p><strong>Groupe Sanguin:</strong> {dossier?.groupeSanguin || 'Non spécifié'}</p>
            <p><strong>Poids:</strong> {dossier?.poids ? `${dossier.poids} kg` : 'Non spécifié'}</p>
            <p><strong>Taille:</strong> {dossier?.taille ? `${dossier.taille} cm` : 'Non spécifié'}</p>
            <p><strong>Contexte:</strong> {dossier?.contexte || 'Aucune information'}</p>
          </div>
        ) : (
          <div className="info-generales-container">
            <div className="form-field">
              <label className="form-label">Sexe:</label>
              <select
                value={editedDossier.sexe || ''}
                onChange={(e) => setEditedDossier({ ...editedDossier, sexe: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Feminin</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Groupe Sanguin:</label>
              <input
                type="text"
                value={editedDossier.groupeSanguin || ''}
                onChange={(e) => setEditedDossier({ ...editedDossier, groupeSanguin: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Poids:</label>
              <input
                type="text"
                value={editedDossier.poids || ''}
                onChange={(e) => setEditedDossier({ ...editedDossier, poids: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Taille:</label>
              <input
                type="text"
                value={editedDossier.taille || ''}
                onChange={(e) => setEditedDossier({ ...editedDossier, taille: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Contexte:</label>
              <textarea
                value={editedDossier.contexte || ''}
                onChange={(e) => setEditedDossier({ ...editedDossier, contexte: e.target.value })}
                className="form-textarea"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // États pour gérer les analyses
  const [expandedAnalyseId, setExpandedAnalyseId] = useState(null);
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [showAnalyseModal, setShowAnalyseModal] = useState(false);

  // Fonction pour basculer l'état d'expansion d'une analyse
  const toggleAnalyseExpansion = (analyseId) => {
    setExpandedAnalyseId(expandedAnalyseId === analyseId ? null : analyseId);
  };
  
  // Fonction pour ouvrir la modale d'analyse
  const openAnalyseModal = (analyse, e) => {
    if (e) e.stopPropagation();
    setSelectedAnalyse(analyse);
    setShowAnalyseModal(true);
  };
  
  // Fonction pour fermer la modale d'analyse
  const closeAnalyseModal = () => {
    setShowAnalyseModal(false);
    setSelectedAnalyse(null);
  };

  // États pour gérer les ordonnances
  const [expandedOrdonnanceId, setExpandedOrdonnanceId] = useState(null);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState(null);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);

  // Fonction pour basculer l'état d'expansion d'une ordonnance
  const toggleOrdonnanceExpansion = (ordonnanceId) => {
    setExpandedOrdonnanceId(expandedOrdonnanceId === ordonnanceId ? null : ordonnanceId);
  };
  
  // Fonction pour ouvrir la modale d'ordonnance
  const openOrdonnanceModal = (ordonnance, e) => {
    if (e) e.stopPropagation();
    setSelectedOrdonnance(ordonnance);
    setShowOrdonnanceModal(true);
  };
  
  // Fonction pour fermer la modale d'ordonnance
  const closeOrdonnanceModal = () => {
    setShowOrdonnanceModal(false);
    setSelectedOrdonnance(null);
  };

  // Fonction pour rendre la liste des analyses sous forme de grille
  const renderAnalysesList = () => {
    return (
      <div className="analyses-grid">
        {analyses.length === 0 ? (
          <div className="empty-state">Aucune analyse disponible</div>
        ) : (
          <div className="row" style={{ maxHeight: '600px', overflowY: 'scroll', border: '1px solid #e9e9e9', borderRadius: '4px', padding: '15px', marginRight: '0', marginLeft: '0' }}>
            {analyses.map(analyse => (
              <div key={analyse.id} className="col-md-4 col-lg-3 mb-3">
                <div 
                  className="analyse-card"
                  onClick={() => openAnalyseModal(analyse)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '15px',
                    height: '220px',
                    borderLeft: '4px solid #4a6da7',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '4px'
                  }}
                >
                  <div className="analyse-item-number" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    <span style={{ marginRight: '5px' }}>🧪</span>
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ 
                      fontWeight: 500, 
                      color: '#2c3e50',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {analyse.typeAnalyse}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#5a6268',
                      marginBottom: '10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.4'
                    }}>
                      <strong>Laboratoire:</strong> {analyse.laboratoire || "Non spécifié"}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#5a6268',
                      marginBottom: '10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.4'
                    }}>
                      <strong>Résultat:</strong> {analyse.resultat ? 
                        (analyse.resultat.length > 40 ? 
                          analyse.resultat.substring(0, 40) + '...' : 
                          analyse.resultat) 
                        : "Aucun résultat"}
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '5px' }}>
                      <span style={{ marginRight: '5px' }}>📅</span>
                      {new Date(analyse.date || analyse.dateAnalyse).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button 
                    className="text-primary"
                    style={{ padding: '5px', marginTop: '10px', alignSelf: 'flex-end', border: 'none', background: 'none', fontSize: '0.9rem' }}
                  >
                    👁️ Voir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour rendre la liste des ordonnances sous forme de grille
  const renderOrdonnancesList = () => {
    return (
      <div className="ordonnances-grid">
        {ordonnances.length === 0 ? (
          <div className="empty-state">Aucune ordonnance disponible</div>
        ) : (
          <div className="row" style={{ maxHeight: '600px', overflowY: 'scroll', border: '1px solid #e9e9e9', borderRadius: '4px', padding: '15px', marginRight: '0', marginLeft: '0' }}>
            {ordonnances.map(ordonnance => (
              <div key={ordonnance.id} className="col-md-4 col-lg-3 mb-3">
                <div 
                  className="ordonnance-card"
                  onClick={() => openOrdonnanceModal(ordonnance)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '15px',
                    height: '220px',
                    borderLeft: '4px solid #2c88d9',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '4px'
                  }}
                >
                  <div className="ordonnance-item-number" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    <span style={{ marginRight: '5px' }}>📝</span>
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ 
                      fontWeight: 500, 
                      color: '#2c3e50',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Ordonnance
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#5a6268',
                      marginBottom: '10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.4'
                    }}>
                      <strong>Médecin:</strong> {ordonnance.nomMedecin || "Non spécifié"}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#5a6268',
                      marginBottom: '10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.4'
                    }}>
                      <strong>Médicaments:</strong> {ordonnance.medicaments ? 
                        (ordonnance.medicaments.length > 40 ? 
                          ordonnance.medicaments.substring(0, 40) + '...' : 
                          ordonnance.medicaments) 
                        : "Aucun médicament prescrit"}
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '5px' }}>
                      <span style={{ marginRight: '5px' }}>📅</span>
                      {new Date(ordonnance.date || ordonnance.dateOrdonnance).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button 
                    className="text-primary"
                    style={{ padding: '5px', marginTop: '10px', alignSelf: 'flex-end', border: 'none', background: 'none', fontSize: '0.9rem' }}
                  >
                    👁️ Voir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dossier-medical-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <DossierMedicalLayout
        ref={(ref) => { window.dossierMedicalLayout = ref; }}
        patientId={patientId} // Ajout du patientId pour la gestion des accès
        informationsGenerales={renderInformationsGenerales()}
        // Utilisation du gestionnaire de consultations principal
        consultationsList={{
          listComponent: (
            <ConsultationManager
              patientId={patientId}
              selectedItem={selectedConsultation}
              onSelectItem={handleSelectConsultation}
              onUpdate={handleDataUpdate}
            />
          ),
          formComponent: null,
          detailComponent: (consultation) => (
            <ConsultationDetail
              consultation={consultation}
              patientId={patientId}
              onClose={() => setSelectedConsultation(null)}
              onUpdate={handleDataUpdate}
            />
          ),
          selectedItem: selectedConsultation
        }}
        // Actions pour les consultations
        actionsConsultation={{
          listComponent: (
            <div className="consultations-list">
              <p>Liste des consultations</p>
              <div className="add-button-container">
                <button 
                  className="add-button" 
                  onClick={() => setShowAddConsultationModal(true)}
                >
                  Ajouter une consultation
                </button>
              </div>
            </div>
          ),
          formComponent: (
            <div className="consultation-form-container">
              <button 
                className="add-button" 
                onClick={() => setShowAddConsultationModal(true)}
              >
                Créer une nouvelle consultation
              </button>
            </div>
          ),
          selectedItem: null
        }}
        analysesList={{
          listComponent: (
            <>
              {renderAnalysesList()}
            </>
          ),
          formComponent: null
        }}
        ordonnancesList={{
          listComponent: (
            <>
              {renderOrdonnancesList()}
            </>
          ),
          formComponent: null
        }}
        imagerieContent={<ImagerieMedicale patientId={patientId} />}
      />
      
      {/* Modal pour le détail d'une analyse */}
      {showAnalyseModal && selectedAnalyse && (
        <div className="modal-overlay">
          <div className="modal-content analyse-modal">
            <div className="modal-header">
              <h3>Détails de l'analyse</h3>
              <button className="modal-close" onClick={closeAnalyseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="analyse-modal-details">
                <div className="detail-row">
                  <span className="detail-label">Type d'analyse:</span>
                  <span className="detail-value">{selectedAnalyse.typeAnalyse}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(selectedAnalyse.date || selectedAnalyse.dateAnalyse).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Résultat:</span>
                  <div className="detail-value p-2 bg-light rounded">
                    {selectedAnalyse.resultat ? selectedAnalyse.resultat.split('\n').map((ligne, idx) => (
                      <p key={idx} className="mb-1">{ligne}</p>
                    )) : "Aucun résultat"}
                  </div>
                </div>
                {selectedAnalyse.Laboratoire && (
                  <div className="detail-row">
                    <span className="detail-label">Laboratoire:</span>
                    <span className="detail-value">{selectedAnalyse.Laboratoire}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Association:</span>
                  <span className="detail-value">{selectedAnalyse.antecedent ? 'Associé à un antécédent' : 'Dossier médical principal'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={closeAnalyseModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour le détail d'une ordonnance */}
      {showOrdonnanceModal && selectedOrdonnance && (
        <div className="modal-overlay">
          <div className="modal-content ordonnance-modal">
            <div className="modal-header">
              <h3>Détails de l'ordonnance</h3>
              <button className="modal-close" onClick={closeOrdonnanceModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="ordonnance-modal-details">
                <div className="detail-row">
                  <span className="detail-label">Médicament(s):</span>
                  <div className="detail-value p-2 bg-light rounded">
                    {selectedOrdonnance.medicaments ? selectedOrdonnance.medicaments.split('\n').map((ligne, idx) => (
                      <p key={idx} className="mb-1">{ligne}</p>
                    )) : "Aucun médicament prescrit"}
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(selectedOrdonnance.date || selectedOrdonnance.dateOrdonnance).toLocaleDateString()}</span>
                </div>
                {selectedOrdonnance.posologie && (
                  <div className="detail-row">
                    <span className="detail-label">Posologie:</span>
                    <div className="detail-value p-2 bg-light rounded">
                      {selectedOrdonnance.posologie.split('\n').map((ligne, idx) => (
                        <p key={idx} className="mb-1">{ligne}</p>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOrdonnance.instructions && (
                  <div className="detail-row">
                    <span className="detail-label">Instructions:</span>
                    <div className="detail-value p-2 bg-light rounded">
                      {selectedOrdonnance.instructions.split('\n').map((ligne, idx) => (
                        <p key={idx} className="mb-1">{ligne}</p>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOrdonnance.nomMedecin && (
                  <div className="detail-row">
                    <span className="detail-label">Médecin:</span>
                    <span className="detail-value">{selectedOrdonnance.nomMedecin}</span>
                  </div>
                )}
                {selectedOrdonnance.numMedecin && (
                  <div className="detail-row">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{selectedOrdonnance.numMedecin}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={closeOrdonnanceModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour le formulaire d'ajout d'analyse */}
      <AnalyseForm 
        patientId={patientId} 
        onAnalyseAdded={handleAnalyseAdded} 
        show={showAddAnalyseModal} 
        onHide={() => setShowAddAnalyseModal(false)} 
      />
      
      {/* Modal pour le formulaire d'ajout d'ordonnance */}
      <OrdonnanceForm 
        patientId={patientId} 
        onOrdonnanceAdded={handleOrdonnanceAdded} 
        show={showAddOrdonnanceModal} 
        onHide={() => setShowAddOrdonnanceModal(false)} 
      />
      
      {/* Modal pour le formulaire d'ajout de consultation */}
      <ConsultationForm 
        patientId={patientId} 
        onConsultationAdded={handleConsultationAdded} 
        show={showAddConsultationModal} 
        onHide={() => setShowAddConsultationModal(false)} 
      />
    </div>
  );
}

export default DossierMedical;
