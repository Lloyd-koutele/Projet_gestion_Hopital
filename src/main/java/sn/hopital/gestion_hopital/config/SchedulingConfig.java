package sn.hopital.gestion_hopital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration pour activer la planification des tâches dans l'application
 * Cette classe permet l'utilisation de l'annotation @Scheduled sur les méthodes
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
    // Aucune autre configuration n'est nécessaire, l'annotation @EnableScheduling active
    // le support pour les tâches planifiées dans Spring
}
