package sn.gestion_hospital.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.gestion_hospital.entite.AutorisationAccesPatient;
import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.entite.Patient;


@Repository
public interface AutorisationAccesPatientRepository extends JpaRepository<AutorisationAccesPatient, UUID> 
{
    
    Optional<AutorisationAccesPatient> findByMedecinAutoriseAndPatientAndActifTrue(Medecin medecin, Patient patient);
    
    List<AutorisationAccesPatient> findByPatientAndActifTrue(Patient patient);
    
    List<AutorisationAccesPatient> findByMedecinAccordeurAndActifTrue(Medecin medecinAccordeur);
    
    List<AutorisationAccesPatient> findByMedecinAutoriseAndActifTrue(Medecin medecinAutorise);
    
    boolean existsByMedecinAutoriseAndPatientAndActifTrueAndDateExpirationAfterOrDateExpirationIsNull(
            Medecin medecinAutorise, 
            Patient patient, 
            LocalDateTime now);
    
    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN p.autorisationsAcces a " +
           "WHERE p.medecinReferent = :medecin OR " +
           "(a.medecinAutorise = :medecin AND a.actif = true AND (a.dateExpiration IS NULL OR a.dateExpiration > :now))")
    List<Patient> findPatientsAccessiblesByMedecin(@Param("medecin") Medecin medecin, @Param("now") LocalDateTime now);
    
    List<AutorisationAccesPatient> findByActifTrueAndDateExpirationBefore(LocalDateTime date);
    
    List<AutorisationAccesPatient> findByActifFalseAndDateExpirationBefore(LocalDateTime date);
}
