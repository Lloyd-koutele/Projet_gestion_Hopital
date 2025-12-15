package sn.hopital.gestion_hopital.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;

/**
 * Repository pour la gestion des autorisations d'accès aux patients
 */
@Repository
public interface AutorisationAccesPatientRepository extends JpaRepository<AutorisationAccesPatient, UUID> {
    
    /**
     * Trouve une autorisation spécifique entre un médecin et un patient
     */
    Optional<AutorisationAccesPatient> findByMedecinAutoriseAndPatientAndActifTrue(MedecinEntite medecin, Patient patient);
    
    /**
     * Trouve toutes les autorisations actives pour un patient donné
     */
    List<AutorisationAccesPatient> findByPatientAndActifTrue(Patient patient);
    
    /**
     * Trouve toutes les autorisations actives données par un médecin
     */
    List<AutorisationAccesPatient> findByMedecinAccordeurAndActifTrue(MedecinEntite medecinAccordeur);
    
    /**
     * Trouve toutes les autorisations actives reçues par un médecin
     */
    List<AutorisationAccesPatient> findByMedecinAutoriseAndActifTrue(MedecinEntite medecinAutorise);
    
    /**
     * Vérifie si un médecin a une autorisation active pour un patient
     */
    boolean existsByMedecinAutoriseAndPatientAndActifTrueAndDateExpirationAfterOrDateExpirationIsNull(
            MedecinEntite medecinAutorise, 
            Patient patient, 
            LocalDateTime now);
    
    /**
     * Recupère tous les patients auxquels un médecin a accès (soit comme referent, soit via autorisation)
     */
    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN p.autorisationsAcces a " +
           "WHERE p.medecinReferent = :medecin OR " +
           "(a.medecinAutorise = :medecin AND a.actif = true AND (a.dateExpiration IS NULL OR a.dateExpiration > :now))")
    List<Patient> findPatientsAccessiblesByMedecin(@Param("medecin") MedecinEntite medecin, @Param("now") LocalDateTime now);
    
    /**
     * Trouve toutes les autorisations actives dont la date d'expiration est dépassée
     */
    List<AutorisationAccesPatient> findByActifTrueAndDateExpirationBefore(LocalDateTime date);
    
    /**
     * Trouve toutes les autorisations inactives dont la date d'expiration est dépassée depuis longtemps
     */
    List<AutorisationAccesPatient> findByActifFalseAndDateExpirationBefore(LocalDateTime date);
}
