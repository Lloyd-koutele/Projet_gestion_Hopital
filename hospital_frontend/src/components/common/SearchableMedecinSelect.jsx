import React, { useState, useEffect, useRef } from 'react';
import { rechercherMedecinsWithCache } from '../../services/medecinService';
import { searchEntities } from '../../utils/searchUtils';
import './SearchableMedecinSelect.css';

// Ajouter un délai pour le débogage
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Version simplifiée du sélecteur de médecin axée sur la recherche par email
 */

/**
 * Composant de sélection de médecin avec recherche par email
 * Utilise l'algorithme TF-IDF pour trier les résultats par pertinence
 * 
 * @param {Object} props - Props du composant
 * @param {Function} props.onSelect - Fonction appelée lors de la sélection d'un médecin
 * @param {string} props.placeholder - Texte affiché dans le champ de recherche
 * @param {string} props.value - Valeur actuelle (email du médecin)
 * @param {string} props.className - Classes CSS additionnelles
 */
const SearchableMedecinSelect = ({
  onSelect,
  placeholder = "Rechercher un médecin par email...",
  value = '',
  className = '',
  required = false,
  id = 'medecin-search',
  name = 'medecinEmail'
}) => {
  // Configuration pour la recherche multi-champs
  const fields = ['email', 'nom', 'prenom', 'telephone', 'numeroOrdre'];
  const weights = { email: 3, nom: 2, prenom: 2, telephone: 1, numeroOrdre: 1 };
  const labelField = 'email';
  // État pour le terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  // État pour les résultats de recherche
  const [results, setResults] = useState([]);
  // État pour le médecin sélectionné
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  // État pour indiquer si la recherche est en cours
  const [loading, setLoading] = useState(false);
  // État pour indiquer si le dropdown est ouvert
  const [isOpen, setIsOpen] = useState(false);
  // État pour stocker les médecins récupérés
  const [medecins, setMedecins] = useState([]);
  // État pour indiquer si une erreur s'est produite
  const [error, setError] = useState(null);

  // Référence au dropdown pour gérer le clic à l'extérieur
  const dropdownRef = useRef(null);

  // Utiliser la valeur initiale si fournie
  useEffect(() => {
    if (value && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  // Fermer le dropdown lorsqu'on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Rechercher des médecins lorsque le terme de recherche change
  useEffect(() => {
    const fetchMedecins = async () => {
      // Si un médecin est déjà sélectionné, ne pas rechercher
      if (selectedMedecin) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      // Si le terme de recherche est trop court, ne pas rechercher
      if (!searchTerm || searchTerm.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Rechercher des médecins via l'API
        const fetchedMedecins = await rechercherMedecinsWithCache(searchTerm, { fields });
        setMedecins(fetchedMedecins);

        // Utiliser l'algorithme TF-IDF pour trier les résultats
        const sortedResults = searchEntities(fetchedMedecins, searchTerm, {
          fields,
          weights
        });

        setResults(sortedResults);
        setIsOpen(true);
      } catch (err) {
        console.error('Erreur lors de la recherche de médecins:', err);
        setError(err.message || 'Erreur lors de la recherche');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Utiliser un délai pour éviter trop d'appels API pendant la frappe
    const timeoutId = setTimeout(fetchMedecins, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fields, selectedMedecin]);

  // Gérer la sélection d'un médecin
  const handleSelect = async (medecin) => {
    console.log("SearchableMedecinSelect: médecin sélectionné", medecin);
    
    // S'assurer que l'objet médecin est complet avec toutes les propriétés nécessaires
    const completeMedecin = {
      ...medecin,
      id: medecin.id || 0,
      email: medecin.email || "",
      nom: medecin.nom || "",
      prenom: medecin.prenom || "",
      specialite: medecin.specialite || ""
    };
    
    setSelectedMedecin(completeMedecin);
    setSearchTerm(completeMedecin[labelField]);
    setIsOpen(false);
    setResults([]); // Vider les résultats pour éviter l'affichage du message "aucun résultat"
    
    // Ajouter un petit délai pour s'assurer que l'état est mis à jour
    await delay(100);
    
    if (onSelect) {
      console.log("SearchableMedecinSelect: appel du callback onSelect avec", completeMedecin);
      onSelect(completeMedecin);
    }
  };

  // Formatter l'affichage d'un médecin dans la liste
  const formatMedecinDisplay = (medecin) => {
    return (
      <div className="medecin-item">
        <div className="medecin-item-primary">
          <span className="medecin-name">{medecin.prenom} {medecin.nom}</span>
          <span className="medecin-specialite">{medecin.specialite}</span>
        </div>
        <div className="medecin-item-secondary">
          <span className="medecin-email">{medecin.email}</span>
          {medecin.numeroOrdre && (
            <span className="medecin-numero-ordre">N° {medecin.numeroOrdre}</span>
          )}
        </div>
      </div>
    );
  };

  // Fonction pour effacer la sélection
  const clearSelection = () => {
    setSelectedMedecin(null);
    setSearchTerm('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div className={`searchable-medecin-select ${className}`} ref={dropdownRef}>
      <div className="search-input-container">
        <input
          type="email"
          id={id}
          name={name}
          value={searchTerm}
          onChange={(e) => {
            // Si l'utilisateur modifie le texte, réinitialiser la sélection
            if (selectedMedecin && e.target.value !== searchTerm) {
              clearSelection();
            }
            setSearchTerm(e.target.value);
          }}
          onFocus={() => {
            // Ne pas ouvrir la liste si un médecin est déjà sélectionné
            if (!selectedMedecin && searchTerm.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="search-input"
          required={required}
          autoComplete="off"
          aria-label="Rechercher un médecin"
        />
        {selectedMedecin && (
          <button 
            type="button" 
            className="clear-selection-btn" 
            onClick={clearSelection}
            title="Effacer la sélection"
          >
            ×
          </button>
        )}
        {loading && <div className="search-spinner"></div>}
        <div className="search-tip">
          Recherchez par email, nom, prénom, téléphone ou n° d'ordre (minimum 2 caractères)
        </div>
      </div>
      
      {error && <div className="search-error">{error}</div>}
      
      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((medecin) => (
            <li
              key={medecin.id}
              onClick={() => handleSelect(medecin)}
              className="search-result-item"
            >
              {formatMedecinDisplay(medecin)}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && searchTerm.trim().length >= 2 && results.length === 0 && !loading && !selectedMedecin && (
        <div className="no-results">
          Aucun médecin trouvé pour "{searchTerm}". Essayez avec un nom, prénom, email ou numéro d'ordre.
        </div>
      )}
      
      {selectedMedecin && (
        <div className="selected-medecin-info">
          <strong>Médecin sélectionné :</strong> {selectedMedecin.prenom} {selectedMedecin.nom} ({selectedMedecin.email})
        </div>
      )}
    </div>
  );
};

export default SearchableMedecinSelect;
