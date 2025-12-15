package sn.hopital.gestion_hopital.tasks;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.RendezVous;
import sn.hopital.gestion_hopital.service.RendezVousService;

/**
 * Tâche planifiée pour nettoyer et mettre à jour les rendez-vous
 */
@Component
public class RendezVousCleanupTask {
    
    @Autowired
    private RendezVousService rendezVousService;
    
    /**
     * Méthode exécutée tous les jours à minuit pour mettre à jour le statut des rendez-vous passés
     * L'expression cron "0 0 0 * * ?" signifie : tous les jours à minuit
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void mettreAJourRendezVousPasses() {
        System.out.println("Exécution de la tâche de mise à jour des rendez-vous passés: " + LocalDateTime.now());
        rendezVousService.mettreAJourRendezVousPasses();
    }
    
    /**
     * Méthode exécutée toutes les heures pour envoyer les rappels des rendez-vous
     * L'expression cron "0 0 * * * ?" signifie : au début de chaque heure
     */
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void envoyerRappelsRendezVous() {
        System.out.println("Exécution de la tâche d'envoi des rappels de rendez-vous: " + LocalDateTime.now());
        
        List<RendezVous> rendezVousARappeler = rendezVousService.getRendezVousNecessitantRappel();
        
        for (RendezVous rendezVous : rendezVousARappeler) {
            try {
                // Ici, vous implémenteriez la logique d'envoi de rappel (email, SMS, etc.)
                System.out.println("Envoi d'un rappel pour le rendez-vous: " + rendezVous.getId() + 
                                  " (patient: " + rendezVous.getPatient().getEmail() + 
                                  ", date: " + rendezVous.getDateHeure() + ")");
                
                // Marquer le rappel comme envoyé
                rendezVousService.marquerRappelEnvoye(rendezVous.getId());
            } catch (Exception e) {
                System.err.println("Erreur lors de l'envoi du rappel pour le rendez-vous " + rendezVous.getId() + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Méthode exécutée toutes les 15 minutes pour envoyer les notifications des nouveaux rendez-vous
     * L'expression cron "0 0/15 * * * ?" signifie : toutes les 15 minutes
     */
    @Scheduled(cron = "0 0/15 * * * ?")
    @Transactional
    public void envoyerNotificationsRendezVous() {
        System.out.println("Exécution de la tâche d'envoi des notifications de rendez-vous: " + LocalDateTime.now());
        
        List<RendezVous> rendezVousANotifier = rendezVousService.getRendezVousNecessitantNotification();
        
        for (RendezVous rendezVous : rendezVousANotifier) {
            try {
                // Ici, vous implémenteriez la logique d'envoi de notification (email, SMS, etc.)
                System.out.println("Envoi d'une notification pour le rendez-vous: " + rendezVous.getId() + 
                                  " (patient: " + rendezVous.getPatient().getEmail() + 
                                  ", date: " + rendezVous.getDateHeure() + ")");
                
                // Marquer la notification comme envoyée
                rendezVousService.marquerNotificationEnvoyee(rendezVous.getId());
            } catch (Exception e) {
                System.err.println("Erreur lors de l'envoi de la notification pour le rendez-vous " + rendezVous.getId() + ": " + e.getMessage());
            }
        }
    }
}
