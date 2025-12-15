// Exporte tous les composants liés aux antécédents médicaux
import ConsultationManager from './ConsultationManager';
import ConsultationForm from './ConsultationForm';
import ConsultationList from './ConsultationList';
import ConsultationDetail from './ConsultationDetail';


// Facilite l'import de ces composants depuis d'autres parties de l'application
export {
  ConsultationManager,   // Composant principal pour la gestion des antécédents
  ConsultationForm,      // Formulaire d'ajout d'antécédent
  ConsultationList,      // Liste des antécédents
  ConsultationDetail,    // Détails d'un antécédent
};

// Export par défaut du gestionnaire principal
export default ConsultationManager;
