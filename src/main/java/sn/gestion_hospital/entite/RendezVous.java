package sn.gestion_hospital.entite;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rendez_vous")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVous 
{

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference(value = "patient-rdv")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonBackReference(value = "medecin-rdv")
    private Medecin medecin;

    /** Date et heure de début */
    @Column(nullable = false)
    private LocalDateTime dateHeure;

    /** Durée du rendez-vous */
    @Column(nullable = false)
    private Duration duree;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRendezVous statut = StatutRendezVous.PLANIFIE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column
    private LocalDateTime dateDerniereModification;

    @Column(nullable = false)
    private boolean notificationEnvoyee = false;

    @Column(nullable = false)
    private boolean rappelEnvoye = false;

    public enum StatutRendezVous 
    {
        PLANIFIE,
        CONFIRME,
        ANNULE,
        REPORTE,
        TERMINE,
        ABSENCE
    }

    /** Constructeur métier */
    public RendezVous(Patient patient, Medecin medecin, LocalDateTime dateHeure, Duration duree) 
    {
        this.patient = patient;
        this.medecin = medecin;
        this.dateHeure = dateHeure;
        this.duree = duree;
    }

    /** Date de fin calculée */
    @Transient
    public LocalDateTime getDateFin() 
    {
        return dateHeure.plus(duree);
    }

    public boolean estPasse() 
    {
        return LocalDateTime.now().isAfter(getDateFin());
    }

    public boolean peutEtreModifie() 
    {
        return statut != StatutRendezVous.TERMINE && statut != StatutRendezVous.ABSENCE && !estPasse();
    }

    public boolean mettreAJourStatusSiPasse() 
    {
        if (estPasse() && (statut == StatutRendezVous.PLANIFIE || statut == StatutRendezVous.CONFIRME)) 
        {
            statut = StatutRendezVous.TERMINE;
            dateDerniereModification = LocalDateTime.now();
            return true;
        }
        return false;
    }

    public void annuler() 
    {
        if (!peutEtreModifie())
        {
            throw new IllegalStateException("Ce rendez-vous ne peut plus être annulé");
        }
        statut = StatutRendezVous.ANNULE;
        dateDerniereModification = LocalDateTime.now();
    }

    public void reporter(LocalDateTime nouvelleDateHeure) 
    {
        if (!peutEtreModifie()) 
        {
            throw new IllegalStateException("Ce rendez-vous ne peut plus être modifié");
        }
        this.dateHeure = nouvelleDateHeure;
        this.statut = StatutRendezVous.REPORTE;
        this.dateDerniereModification = LocalDateTime.now();
        this.notificationEnvoyee = false;
        this.rappelEnvoye = false;
    }

    public void confirmer() 
    {
        if (statut != StatutRendezVous.PLANIFIE && statut != StatutRendezVous.REPORTE) 
        {
            throw new IllegalStateException("Ce rendez-vous ne peut pas être confirmé");
        }
        statut = StatutRendezVous.CONFIRME;
        dateDerniereModification = LocalDateTime.now();
    }

    public void marquerAbsence() 
    {
        if (!estPasse() ||
           (statut != StatutRendezVous.PLANIFIE && statut != StatutRendezVous.CONFIRME)) 
        {
            throw new IllegalStateException("Impossible de marquer l'absence");
        }
        statut = StatutRendezVous.ABSENCE;
        dateDerniereModification = LocalDateTime.now();
    }

    
}
