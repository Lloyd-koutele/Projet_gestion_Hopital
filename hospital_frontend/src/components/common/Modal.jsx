import React, { useEffect } from 'react';
import '../../styles/modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Empêcher le défilement du corps lorsque la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Nettoyage au démontage
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Gérer la touche Escape pour fermer la modale
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Arrêter la propagation des clics sur le contenu de la modale
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={handleContentClick}>
        <div className="modal-header-nav">
          <h2 className="modal-title">{title || "Créer un utilisateur"}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
