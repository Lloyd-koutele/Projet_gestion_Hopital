import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import ImageService from '../../../services/imagerieService';

/**
 * Composant pour vérifier l'intégrité des images d'un patient
 */
const ImageIntegrityChecker = ({ patientId }) => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  
  const checkIntegrity = async () => {
    try {
      setChecking(true);
      const data = await ImageService.checkImagesIntegrity(patientId);
      setResults(data);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'intégrité des images:', error);
      setResults({ error: error.message || 'Erreur inconnue lors de la vérification' });
    } finally {
      setChecking(false);
    }
  };
  
  const clearResults = () => {
    setResults(null);
  };
  
  return (
    <div className="integrity-checker mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Vérification de l'intégrité des images</h5>
        <Button 
          onClick={checkIntegrity} 
          disabled={checking}
          variant="outline-primary"
          size="sm"
        >
          {checking ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Vérification en cours...</span>
            </>
          ) : 'Vérifier l\'intégrité des images'}
        </Button>
      </div>
      
      {results && !results.error && (
        <Alert 
          variant={results.length === 0 ? "success" : "warning"} 
          dismissible 
          onClose={clearResults}
        >
          {results.length === 0 ? (
            <p className="mb-0">✅ Toutes les images sont valides</p>
          ) : (
            <>
              <Alert.Heading>⚠️ Problèmes détectés</Alert.Heading>
              <ul className="mb-0">
                {results.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </>
          )}
        </Alert>
      )}
      
      {results && results.error && (
        <Alert variant="danger" dismissible onClose={clearResults}>
          <Alert.Heading>❌ Erreur lors de la vérification</Alert.Heading>
          <p className="mb-0">{results.error}</p>
        </Alert>
      )}
    </div>
  );
};

export default ImageIntegrityChecker;
