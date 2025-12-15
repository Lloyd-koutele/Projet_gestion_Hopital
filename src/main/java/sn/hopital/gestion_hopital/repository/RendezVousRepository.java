package sn.hopital.gestion_hopital.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.RendezVous;
import sn.hopital.gestion_hopital.entite.RendezVous.StatutRendezVous;

/**
 * Repository pour la gestion des rendez-vous
 */
@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {

    /**
     * Trouve tous les rendez-vous d'un patient
     */
    List<RendezVous> findByPatientOrderByDateHeureDesc(Patient patient);
    
    /**
     * Trouve tous les rendez-vous d'un médecin
     */
    List<RendezVous> findByMedecinOrderByDateHeureDesc(MedecinEntite medecin);
    
    /**
     * Trouve tous les rendez-vous d'un patient avec un statut donné
     */
    List<RendezVous> findByPatientAndStatutOrderByDateHeureDesc(Patient patient, StatutRendezVous statut);
    
    /**
     * Trouve tous les rendez-vous d'un médecin avec un statut donné
     */
    List<RendezVous> findByMedecinAndStatutOrderByDateHeureDesc(MedecinEntite medecin, StatutRendezVous statut);
    
    /**
     * Trouve tous les rendez-vous à venir d'un patient
     */
    @Query("SELECT r FROM RendezVous r WHERE r.patient = :patient AND r.dateHeure > :now AND r.statut IN :statuts ORDER BY r.dateHeure ASC")
    List<RendezVous> findUpcomingByPatient(
            @Param("patient") Patient patient, 
            @Param("now") LocalDateTime now,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Trouve tous les rendez-vous à venir d'un médecin
     */
    @Query("SELECT r FROM RendezVous r WHERE r.medecin = :medecin AND r.dateHeure > :now AND r.statut IN :statuts ORDER BY r.dateHeure ASC")
    List<RendezVous> findUpcomingByMedecin(
            @Param("medecin") MedecinEntite medecin, 
            @Param("now") LocalDateTime now,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Trouve les rendez-vous du jour pour un médecin
     */
    @Query("SELECT r FROM RendezVous r WHERE r.medecin = :medecin AND DATE(r.dateHeure) = CURRENT_DATE AND r.statut IN :statuts ORDER BY r.dateHeure ASC")
    List<RendezVous> findTodayByMedecin(
            @Param("medecin") MedecinEntite medecin,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Vérifie s'il existe un conflit de rendez-vous pour un médecin à une plage horaire donnée
     */
    @Query("SELECT COUNT(r) > 0 FROM RendezVous r WHERE r.medecin = :medecin " +
           "AND r.id != :rendezVousId " +
           "AND r.statut IN :statuts " +
           "AND ((r.dateHeure <= :fin AND r.dateHeure >= :debut) " +
           "OR (r.dateHeure <= :debut AND r.dateHeure.plusMinutes(r.duree) >= :debut))")
    boolean existsConflictForMedecin(
            @Param("medecin") MedecinEntite medecin,
            @Param("rendezVousId") UUID rendezVousId,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Trouve tous les rendez-vous passés non terminés
     * Utilisé pour le nettoyage automatique
     */
    @Query("SELECT r FROM RendezVous r WHERE r.dateHeure < :now AND r.statut IN (:statuts)")
    List<RendezVous> findPastNotCompleted(
            @Param("now") LocalDateTime now,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Trouve tous les rendez-vous à venir qui nécessitent un rappel
     */
    @Query("SELECT r FROM RendezVous r WHERE r.dateHeure BETWEEN :debut AND :fin " +
           "AND r.rappelEnvoye = false AND r.statut IN :statuts")
    List<RendezVous> findNeedingReminder(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin,
            @Param("statuts") List<StatutRendezVous> statuts);
    
    /**
     * Trouve tous les rendez-vous nouvellement créés qui nécessitent une notification
     */
    List<RendezVous> findByNotificationEnvoyeeFalseAndStatutIn(List<StatutRendezVous> statuts);
}
