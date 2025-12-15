package sn.hopital.gestion_hopital.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

/**
 * Utilitaire pour corriger l'incohérence entre user_type et roles dans la table users.
 * Cette classe s'exécutera automatiquement au démarrage de l'application lorsque le profil "correction" est actif.
 * Pour activer ce profil, démarrez l'application avec -Dspring.profiles.active=correction
 */
@Component
@Profile("correction")
public class PatientUserTypeCorrection implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("==========================================================");
        System.out.println("DÉMARRAGE DE LA CORRECTION DES TYPES D'UTILISATEURS");
        System.out.println("==========================================================");

        // Requête SQL pour mettre à jour le user_type basé sur la colonne roles
        String updateSql = "UPDATE users SET user_type = roles WHERE roles = 'PATIENT' AND user_type != 'PATIENT'";
        
        Query query = entityManager.createNativeQuery(updateSql);
        int updatedCount = query.executeUpdate();
        
        System.out.println("Nombre d'utilisateurs corrigés: " + updatedCount);
        System.out.println("==========================================================");
    }
}
