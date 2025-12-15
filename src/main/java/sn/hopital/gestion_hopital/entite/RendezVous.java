package sn.hopital.gestion_hopital.entite;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un rendez-vous entre un patient et un médecin
 */
@Entity
@Table(name = "rendez_vous")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVous {

    @Id
    @GeneratedValue
    private UUID id;

    // Le patient concerné par le rendez-vous
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference(value = "patient-rdv")
    private Patient patient;

    // Le médecin qui reçoit le patient
    @ManyToOne
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonBackReference(value = "medecin-rdv")
    private MedecinEntite medecin;

    // Date et heure du rendez-vous
    @Column(nullable = false)
    private LocalDateTime dateHeure;

    // Durée prévue du rendez-vous en minutes
    @Column(nullable = false)
    private int duree = 30; // Par défaut 30 minutes

    // Motif du rendez-vous
    @Column(nullable = false, length = 500)
    private String motif;

    // Notes supplémentaires
    @Column(length = 1000)
    private String notes;

    // Statut du rendez-vous
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRendezVous statut = StatutRendezVous.PLANIFIE;

    // Date de création du rendez-vous
    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    // Dernière modification du rendez-vous
    @Column
    private LocalDateTime dateDerniereModification;

    // Notification envoyée au patient
    @Column(nullable = false)
    private boolean notificationEnvoyee = false;

    // Rappel envoyé au patient
    @Column(nullable = false)
    private boolean rappelEnvoye = false;

    // Enum pour les statuts possibles d'un rendez-vous
    public enum StatutRendezVous {
        PLANIFIE,    // Rendez-vous planifié mais pas encore confirmé
        CONFIRME,    // Rendez-vous confirmé
        ANNULE,      // Rendez-vous annulé
        REPORTE,     // Rendez-vous reporté à une date ultérieure
        TERMINE,     // Rendez-vous terminé
        ABSENCE      // Le patient ne s'est pas présenté
    }

    /**
     * Constructeur pour créer un nouveau rendez-vous
     */
    public RendezVous(Patient patient, MedecinEntite medecin, LocalDateTime dateHeure, 
                     int duree, String motif) {
        this.patient = patient;
        this.medecin = medecin;
        this.dateHeure = dateHeure;
        this.duree = duree;
        this.motif = motif;
    }

    /**
     * Vérifie si le rendez-vous est passé
     */
    public boolean estPasse() {
        return LocalDateTime.now().isAfter(this.dateHeure.plusMinutes(this.duree));
    }

    /**
     * Vérifie si le rendez-vous peut être modifié
     * Un rendez-vous ne peut pas être modifié s'il est déjà terminé ou s'il est passé
     */
    public boolean peutEtreModifie() {
        return this.statut != StatutRendezVous.TERMINE && 
               this.statut != StatutRendezVous.ABSENCE &&
               !estPasse();
    }

    /**
     * Met à jour le statut du rendez-vous à TERMINE s'il est passé
     * Retourne true si le statut a été modifié
     */
    public boolean mettreAJourStatusSiPasse() {
        if (estPasse() && (this.statut == StatutRendezVous.PLANIFIE || 
                          this.statut == StatutRendezVous.CONFIRME)) {
            this.statut = StatutRendezVous.TERMINE;
            this.dateDerniereModification = LocalDateTime.now();
            return true;
        }
        return false;
    }

    /**
     * Annuler le rendez-vous
     */
    public void annuler() {
        if (peutEtreModifie()) {
            this.statut = StatutRendezVous.ANNULE;
            this.dateDerniereModification = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Ce rendez-vous ne peut plus être annulé");
        }
    }

    /**
     * Reporter le rendez-vous à une nouvelle date
     */
    public void reporter(LocalDateTime nouvelleDateHeure) {
        if (peutEtreModifie()) {
            this.dateHeure = nouvelleDateHeure;
            this.statut = StatutRendezVous.REPORTE;
            this.dateDerniereModification = LocalDateTime.now();
            this.notificationEnvoyee = false;
            this.rappelEnvoye = false;
        } else {
            throw new IllegalStateException("Ce rendez-vous ne peut plus être modifié");
        }
    }

    /**
     * Confirmer le rendez-vous
     */
    public void confirmer() {
        if (this.statut == StatutRendezVous.PLANIFIE || this.statut == StatutRendezVous.REPORTE) {
            this.statut = StatutRendezVous.CONFIRME;
            this.dateDerniereModification = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Ce rendez-vous ne peut pas être confirmé");
        }
    }

    /**
     * Marquer l'absence du patient
     */
    public void marquerAbsence() {
        if (estPasse() && (this.statut == StatutRendezVous.PLANIFIE || 
                          this.statut == StatutRendezVous.CONFIRME)) {
            this.statut = StatutRendezVous.ABSENCE;
            this.dateDerniereModification = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Impossible de marquer l'absence pour ce rendez-vous");
        }
    }
}
