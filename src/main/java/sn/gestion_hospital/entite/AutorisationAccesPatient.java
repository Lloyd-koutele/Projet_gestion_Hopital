package sn.gestion_hospital.entite;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant une autorisation d'accès à un patient
 * Accordée soit par un médecin, soit par le patient lui-même.
 */
@Entity
@Table(name = "autorisations_acces_patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutorisationAccesPatient 
{

    @Id
    @GeneratedValue
    private UUID id;

    // Le patient concerné par l'autorisation
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference(value = "patient-autorisations")
    private Patient patient;

    // Médecin autorisé à accéder au dossier
    @ManyToOne
    @JoinColumn(name = "medecin_autorise_id", nullable = false)
    @JsonManagedReference(value = "medecin-acces-recus")
    private Medecin medecinAutorise;

    // Médecin qui accorde l'accès (nullable si c'est le patient qui accorde)
    @ManyToOne
    @JoinColumn(name = "medecin_accordeur_id")
    @JsonManagedReference(value = "medecin-acces-accordes")
    private Medecin medecinAccordeur;

    // Indique si c’est le patient qui a accordé l’accès
    @Column(nullable = false)
    private boolean accordeParPatient = false;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column
    private LocalDateTime dateExpiration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauAcces niveauAcces;

    @Column(nullable = false)
    private boolean actif = true;

    // Niveaux d'accès possibles
    public enum NiveauAcces 
    {
        LECTURE_SEULE,
        COMPLET
    }

    // Constructeur pour autorisation accordée par un médecin
    public AutorisationAccesPatient(Patient patient, Medecin medecinAccordeur, Medecin medecinAutorise, NiveauAcces niveauAcces) 
    {
        this.patient = patient;
        this.medecinAccordeur = medecinAccordeur;
        this.medecinAutorise = medecinAutorise;
        this.niveauAcces = niveauAcces;
        this.accordeParPatient = false;
    }

    // Constructeur pour autorisation accordée par le patient
    public AutorisationAccesPatient(Patient patient, Medecin medecinAutorise,
                                     NiveauAcces niveauAcces) 
    {
        this.patient = patient;
        this.medecinAutorise = medecinAutorise;
        this.niveauAcces = niveauAcces;
        this.accordeParPatient = true;
    }

    // Vérifie si l'autorisation est expirée
    public boolean estExpiree() 
    {
        return dateExpiration != null && LocalDateTime.now().isAfter(dateExpiration);
    }

    // Vérifie si l'autorisation est valide
    public boolean estValide() 
    {
        return actif && !estExpiree();
    }
}
