import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Tabs, Tab, Modal, Alert, Spinner, Form } from 'react-bootstrap';
import { getImageContent } from '../../../services/imagerieService';
import ImageViewer from '../Imagerie/ImageViewer';
import ImageModal from '../Imagerie/ImageModal';
import ImageUploadForm from '../Imagerie/ImageUploadForm';
import AnalyseForm from '../../DossierMedical/AnalyseForm';
import OrdonnanceForm from '../OrdonnanceForm';
import { getConsultationById } from '../../../services/consultationService';
import { FaTimes, FaExpand } from 'react-icons/fa';

function ConsultationDetail({ consultation: initialConsultation, patientId, onClose, onUpdate }) {
  const [consultation, setConsultation] = useState(initialConsultation);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informations');
  const [expandedImageId, setExpandedImageId] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showAddAnalyseModal, setShowAddAnalyseModal] = useState(false);
  const [showAddOrdonnanceModal, setShowAddOrdonnanceModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [showAnalyseModal, setShowAnalyseModal] = useState(false);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState(null);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      if (initialConsultation && initialConsultation._id) {
        try {
          setLoading(true);
          const detailedConsultation = await getConsultationById(patientId, initialConsultation._id);
          setConsultation(detailedConsultation);
          setErrorMessage('');
        } catch (error) {
          console.error('Erreur lors du chargement des détails de la consultation:', error);
          setErrorMessage(`Erreur lors du chargement des détails: ${error.message || 'Erreur inconnue'}`);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchConsultationDetails();
  }, [initialConsultation, patientId]);

  // Image de remplacement en cas d'erreur
  const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlOGYwZmUiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzRhNmRhNyI+Q2hhcmdlbWVudC4uLjwvdGV4dD4KPC9zdmc+';

  // Obtenir l'URL d'une image
  const getImageUrl = (image) => {
    if (!image) return FALLBACK_IMAGE;
    
    // Si aucune URL n'est disponible, retourner l'image de remplacement
    if (!image.id || !consultation || !consultation._id) {
      return FALLBACK_IMAGE;
    }
    
    // Utiliser le proxy Vite pour construire l'URL
    const consultationId = consultation._id;
    
    // Utiliser le proxy Vite configuré au lieu de construire manuellement l'URL
    const apiPath = `/api/medecin/patients/${patientId}/dossier-medical/consultations/${consultationId}/images/${image.id}/file`;
    return apiPath;
  };
  
  // Vérifier si une image est au format DICOM
  const isDicomImage = (image) => {
    if (!image || !image.lienFichier) return false;
    const filename = image.lienFichier.toLowerCase();
    return filename.endsWith('.dcm') || filename.endsWith('.dicom');
  };

  // Bascule l'expansion d'une image
  const toggleImageExpansion = (imageId) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };
  
  // Ouvre l'image dans une modale
  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };
  
  // Ferme la modale d'image
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Gère l'ajout d'une nouvelle image
  const handleImageAdded = () => {
    if (onUpdate) {
      setSuccessMessage('Image ajoutée avec succès');
      onUpdate();
    }
    setShowAddImageModal(false);
  };

  // Gère l'ajout d'une nouvelle analyse
  const handleAnalyseAdded = () => {
    if (onUpdate) {
      setSuccessMessage('Analyse ajoutée avec succès');
      onUpdate();
    }
    setShowAddAnalyseModal(false);
  };

  // Gère l'ajout d'une nouvelle ordonnance
  const handleOrdonnanceAdded = () => {
    if (onUpdate) {
      setSuccessMessage('Ordonnance ajoutée avec succès');
      onUpdate();
    }
    setShowAddOrdonnanceModal(false);
  };
  
  // Ouvre la modale pour afficher les détails d'une analyse
  const openAnalyseModal = (analyse) => {
    setSelectedAnalyse(analyse);
    setShowAnalyseModal(true);
  };

  // Ferme la modale d'analyse
  const closeAnalyseModal = () => {
    setShowAnalyseModal(false);
    setSelectedAnalyse(null);
  };

  // Ouvre la modale pour afficher les détails d'une ordonnance
  const openOrdonnanceModal = (ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setShowOrdonnanceModal(true);
  };

  // Ferme la modale d'ordonnance
  const closeOrdonnanceModal = () => {
    setShowOrdonnanceModal(false);
    setSelectedOrdonnance(null);
  };
  
  // Formater une date pour l'affichage
  const formatDate = () => {
    return "01/01/2023"; // Simplification pour cet exemple
  };

  if (!consultation) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" role="status" variant="primary" />
        <span className="ms-3">Chargement des détails...</span>
      </div>
    );
  }

  return (
    <div className="consultation-detail">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h4 className="mb-0">Consultation: {consultation.type || 'Sans type'}</h4>
          <Button variant="light" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </Card.Header>
        <Card.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab 
              eventKey="images" 
              title={
                <span>
                  Images 
                  {consultation.images && consultation.images.length > 0 && (
                    <Badge bg="info" className="ms-2">{consultation.images.length}</Badge>
                  )}
                </span>
              }
            >
              <div className="d-flex justify-content-between mb-3">
                <Button variant="primary" size="sm" onClick={() => setShowAddImageModal(true)}>
                  Ajouter une image
                </Button>
              </div>
              
              {(!consultation.images || consultation.images.length === 0) ? (
                <p>Aucune image associée à cette consultation.</p>
              ) : (
                <div className="image-gallery">
                  <Row>
                    {consultation.images.map((image, index) => (
                      <Col 
                        key={index} 
                        xs={12} 
                        md={expandedImageId === image.id ? 12 : 6} 
                        lg={expandedImageId === image.id ? 12 : 4} 
                        className="mb-4"
                      >
                        <Card style={{ 
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                          borderRadius: '8px', 
                          border: 'none',
                          height: '280px',
                          transition: 'transform 0.3s ease'
                        }}>
                          <Card.Header className="d-flex justify-content-between align-items-center" style={{
                            backgroundColor: '#e3f2fd', 
                            borderBottom: '1px solid #c2e0ff',
                            color: '#0d6efd',
                            fontWeight: 'bold',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            padding: '10px 15px'
                          }}>
                            <span>
                              {isDicomImage(image) ? (
                                <span className="badge bg-info me-2" style={{ fontSize: '0.75rem' }}>DICOM</span>
                              ) : (
                                <span className="me-2" style={{ fontSize: '1.1rem' }}>🖼️</span>
                              )}
                              {image.description || `Image ${index + 1}`}
                            </span>
                            <div>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                className="me-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openImageModal(image);
                                }}
                              >
                                <i className="fas fa-expand"></i>
                              </Button>
                              <Button 
                                variant={expandedImageId === image.id ? "outline-secondary" : "outline-primary"} 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleImageExpansion(image.id);
                                }}
                              >
                                {expandedImageId === image.id ? "Réduire" : "Agrandir"}
                              </Button>
                            </div>
                          </Card.Header>
                          <Card.Body className="text-center p-2" style={{ position: 'relative' }}>
                            {expandedImageId === image.id ? (
                              <div className="expanded-image my-2">
                                <ImageViewer 
                                  image={image}
                                  patientId={patientId}
                                  consultationId={consultation.id || consultation._id}
                                  onClose={() => toggleImageExpansion(image.id)}
                                />
                              </div>
                            ) : (
                              <div 
                                style={{
                                  cursor: 'pointer',
                                  height: '190px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '5px',
                                  margin: '5px',
                                  overflow: 'hidden'
                                }}
                                onClick={() => toggleImageExpansion(image.id)}
                              >
                                <img 
                                  src={getImageUrl(image)} 
                                  alt={image.description || `Image ${index + 1}`}
                                  style={{ 
                                    maxHeight: '180px', 
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    transition: 'transform 0.3s ease',
                                    border: '1px solid #e3f2fd',
                                    borderRadius: '4px'
                                  }}
                                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                />
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Tab>
            
            <Tab 
              eventKey="analyses" 
              title={
                <span>
                  Analyses 
                  {consultation.analyses && consultation.analyses.length > 0 && (
                    <Badge bg="info" className="ms-2">{consultation.analyses.length}</Badge>
                  )}
                </span>
              }
            >
              <Button variant="primary" size="sm" onClick={() => setShowAddAnalyseModal(true)}>
                Ajouter une analyse
              </Button>
              
              {(!consultation.analyses || consultation.analyses.length === 0) ? (
                <p className="mt-3">Aucune analyse associée à cette consultation.</p>
              ) : (
                <Row className="mt-3">
                  {consultation.analyses.map((analyse, index) => (
                    <Col key={index} xs={12} md={6} lg={4} className="mb-3">
                      <Card style={{ 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                        borderRadius: '8px', 
                        border: 'none',
                        transition: 'transform 0.2s',
                        height: '280px',
                        width: '100%'
                      }}
                      className="hover-card">
                        <Card.Header style={{ 
                          backgroundColor: '#e3f2fd', 
                          borderBottom: '1px solid #c2e0ff',
                          color: '#0d6efd',
                          fontWeight: 'bold',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px',
                          padding: '12px 15px'
                        }}>{analyse.type || 'Analyse'}</Card.Header>
                        <Card.Body style={{ padding: '15px' }}>
                          <p style={{ 
                            whiteSpace: 'pre-line',
                            fontSize: '15px',
                            backgroundColor: '#f8f9fa', 
                            padding: '10px',
                            borderRadius: '5px',
                            height: '130px',
                            overflow: 'auto'
                          }}><strong>Résultats:</strong> {analyse.resultat || 'Non disponible'}</p>
                        </Card.Body>
                        <Card.Footer style={{ 
                          backgroundColor: '#f8f9fa',
                          borderTop: '1px solid #e9ecef',
                          padding: '10px 15px',
                          textAlign: 'right'
                        }}>
                          <Button size="sm" variant="outline-primary" onClick={() => openAnalyseModal(analyse)}>Détails</Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>
            
            <Tab 
              eventKey="ordonnances" 
              title={
                <span>
                  Ordonnances 
                  {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                    <Badge bg="info" className="ms-2">{consultation.ordonnances.length}</Badge>
                  )}
                </span>
              }
            >
              <Button variant="primary" size="sm" onClick={() => setShowAddOrdonnanceModal(true)}>
                Ajouter une ordonnance
              </Button>
              
              {(!consultation.ordonnances || consultation.ordonnances.length === 0) ? (
                <p className="mt-3">Aucune ordonnance associée à cette consultation.</p>
              ) : (
                <Row className="mt-3">
                  {consultation.ordonnances.map((ordonnance, index) => (
                    <Col key={index} xs={12} md={6} lg={4} className="mb-3">
                      <Card style={{ 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                        borderRadius: '8px', 
                        border: 'none',
                        transition: 'transform 0.2s',
                        height: '280px',
                        width: '100%'
                      }}
                      className="hover-card">
                        <Card.Header style={{ 
                          backgroundColor: '#e3f2fd', 
                          borderBottom: '1px solid #c2e0ff',
                          color: '#0d6efd',
                          fontWeight: 'bold',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px',
                          padding: '12px 15px'
                        }}>Ordonnance</Card.Header>
                        <Card.Body style={{ 
                          padding: '15px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          height: '160px'
                        }}>
                          <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '10px 15px',
                            borderRadius: '5px',
                            marginBottom: '10px'
                          }}>
                            <p style={{ margin: '0' }}><strong style={{ color: '#0d6efd' }}>Médecin:</strong> {ordonnance.nomMedecin || 'Non précisé'}</p>
                          </div>
                          {ordonnance.medicaments && (
                            <div style={{
                              backgroundColor: '#f8f9fa',
                              padding: '10px 15px',
                              borderRadius: '5px',
                              marginBottom: '5px',
                              height: '60px',
                              overflow: 'auto'
                            }}>
                              <p style={{ margin: '0', whiteSpace: 'pre-line', overflow: 'auto' }}>
                                <strong style={{ color: '#0d6efd' }}>Médicaments:</strong> {ordonnance.medicaments || 'Non précisés'}
                              </p>
                            </div>
                          )}
                        </Card.Body>
                        <Card.Footer style={{ 
                          backgroundColor: '#f8f9fa',
                          borderTop: '1px solid #e9ecef',
                          padding: '10px 15px',
                          textAlign: 'right'
                        }}>
                          <Button size="sm" variant="outline-primary" onClick={() => openOrdonnanceModal(ordonnance)}>Détails</Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Modales */}
      <ImageUploadForm
        show={showAddImageModal}
        onHide={() => setShowAddImageModal(false)}
        patientId={patientId}
        consultationId={consultation.id || consultation._id}
        onImageAdded={handleImageAdded}
      />
      
      <AnalyseForm
        show={showAddAnalyseModal}
        onHide={() => setShowAddAnalyseModal(false)}
        patientId={patientId}
        consultationId={consultation.id || consultation._id}
        onAnalyseAdded={handleAnalyseAdded}
      />
      
      <OrdonnanceForm
        show={showAddOrdonnanceModal}
        onHide={() => setShowAddOrdonnanceModal(false)}
        patientId={patientId}
        consultationId={consultation.id || consultation._id}
        onOrdonnanceAdded={handleOrdonnanceAdded}
      />

      {/* Modal pour afficher les détails d'une analyse */}
      <Modal show={showAnalyseModal} onHide={closeAnalyseModal} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#e3f2fd', borderBottom: '1px solid #c2e0ff' }}>
          <Modal.Title style={{ color: '#0d6efd' }}>Détails de l'analyse</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          {selectedAnalyse && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  margin: '5px 0',
                  display: 'flex'
                }}>
                  <strong style={{ width: '120px', color: '#0d6efd' }}>Type:</strong> 
                  <span>{selectedAnalyse.typeAnalyse || 'Non précisé'}</span>
                </p>
                <p style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  margin: '5px 0',
                  display: 'flex'
                }}>
                  <strong style={{ width: '120px', color: '#0d6efd' }}>Date:</strong> 
                  <span>{selectedAnalyse.dateAnalyse || 'Non précisé'}</span>
                </p>
                <p style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  margin: '5px 0',
                  display: 'flex'
                }}>
                  <strong style={{ width: '120px', color: '#0d6efd' }}>Laboratoire:</strong> 
                  <span>{selectedAnalyse.Laboratoire || 'Non disponible'}</span>
                </p>
              </div>
              <div style={{ 
                marginTop: '15px', 
                borderTop: '1px solid #dee2e6', 
                paddingTop: '15px'
              }}>
                <h5 style={{ color: '#0d6efd', marginBottom: '10px' }}>Résultats</h5>
                <div style={{ 
                  whiteSpace: 'pre-line',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '5px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {selectedAnalyse.resultat || 'Non disponible'}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAnalyseModal}>Fermer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour afficher les détails d'une ordonnance */}
      <Modal show={showOrdonnanceModal} onHide={closeOrdonnanceModal} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#e3f2fd', borderBottom: '1px solid #c2e0ff' }}>
          <Modal.Title style={{ color: '#0d6efd' }}>Détails de l'ordonnance</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          {selectedOrdonnance && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  margin: '5px 0',
                  display: 'flex'
                }}>
                  <strong style={{ width: '120px', color: '#0d6efd' }}>Date:</strong> 
                  <span>{selectedOrdonnance.date || 'Non précisé'}</span>
                </p>
                <p style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '4px',
                  margin: '5px 0',
                  display: 'flex'
                }}>
                  <strong style={{ width: '120px', color: '#0d6efd' }}>Médecin:</strong> 
                  <span>{selectedOrdonnance.nomMedecin || 'Non précisé'}</span>
                </p>
              </div>
              
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <h5 style={{ color: '#0d6efd', marginBottom: '10px' }}>Médicaments</h5>
                <div style={{ 
                  whiteSpace: 'pre-line',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '5px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {selectedOrdonnance.medicaments || 'Non précisés'}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ color: '#0d6efd', marginBottom: '10px' }}>Posologie</h5>
                <div style={{ 
                  whiteSpace: 'pre-line',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '5px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {selectedOrdonnance.posologie || 'Non précisée'}
                </div>
              </div>
              
              <div>
                <h5 style={{ color: '#0d6efd', marginBottom: '10px' }}>Instructions</h5>
                <div style={{ 
                  whiteSpace: 'pre-line',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '5px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {selectedOrdonnance.instructions || 'Non précisées'}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeOrdonnanceModal}>Fermer</Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modale pour afficher l'image en plein écran */}
      <ImageModal
        show={showImageModal}
        onHide={closeImageModal}
        image={selectedImage}
        patientId={patientId}
        consultationId={consultation?.id || consultation?._id}
      />
      
      {/* Style CSS pour les interactions avec les images */}
      <style jsx="true">{`
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .expanded-image {
          position: relative;
        }
        
        .expanded-image img {
          max-width: 100%;
          border-radius: 4px;
        }
        
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.7);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        
        .close-btn:hover {
          background: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
}

export default ConsultationDetail;
