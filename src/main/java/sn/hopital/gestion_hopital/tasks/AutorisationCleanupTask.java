package sn.hopital.gestion_hopital.tasks;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient;
import sn.hopital.gestion_hopital.repository.AutorisationAccesPatientRepository;

/**
 * Tâche planifiée pour nettoyer les autorisations d'accès expirées
 */
@Component
public class AutorisationCleanupTask {
    
    @Autowired
    private AutorisationAccesPatientRepository autorisationRepository;
    
    /**
     * Méthode exécutée tous les jours à minuit pour désactiver les autorisations expirées
     * L'expression cron "0 0 0 * * ?" signifie :
     * - 0 secondes
     * - 0 minutes
     * - 0 heures (minuit)
     * - Tous les jours du mois
     * - Tous les mois
     * - N'importe quel jour de la semaine
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void desactiverAutorisationsExpirees() {
        LocalDateTime now = LocalDateTime.now();
        
        // Rechercher toutes les autorisations qui sont actives mais dont la date d'expiration est passée
        List<AutorisationAccesPatient> autorisationsExpirees = autorisationRepository
            .findByActifTrueAndDateExpirationBefore(now);
        
        // Log pour le debugging
        System.out.println("Nettoyage des autorisations: " + autorisationsExpirees.size() + " autorisations expirées trouvées");
        
        // Désactiver chaque autorisation expirée
        for (AutorisationAccesPatient autorisation : autorisationsExpirees) {
            System.out.println("Désactivation de l'autorisation: " + autorisation.getId() + 
                               " (médecin: " + autorisation.getMedecinAutorise().getEmail() + 
                               ", patient: " + autorisation.getPatient().getEmail() + ")");
            autorisation.setActif(false);
            autorisationRepository.save(autorisation);
        }
    }
    
    /**
     * Alternative: supprimer complètement les autorisations expirées
     * Cette méthode est commentée car la désactivation est généralement préférable
     * pour garder l'historique, mais peut être activée si nécessaire
     */
    /*
    @Scheduled(cron = "0 30 0 * * ?") // Exécution à 00h30 pour éviter les conflits avec la méthode précédente
    @Transactional
    public void supprimerAutorisationsExpirees() {
        LocalDateTime dateLimit = LocalDateTime.now().minusDays(30); // Supprimer les autorisations expirées depuis plus de 30 jours
        
        // Supprimer directement les autorisations inactives et expirées depuis longtemps
        List<AutorisationAccesPatient> autorisationsASupprimer = autorisationRepository
            .findByActifFalseAndDateExpirationBefore(dateLimit);
        
        System.out.println("Suppression des autorisations: " + autorisationsASupprimer.size() + " autorisations à supprimer");
        
        autorisationRepository.deleteAll(autorisationsASupprimer);
    }
    */
}
