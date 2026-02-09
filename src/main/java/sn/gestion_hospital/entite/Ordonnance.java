package sn.gestion_hospital.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Ordonnance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ordonnance
{
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "medicaments", nullable = false, columnDefinition = "TEXT")
    private String medicaments = "Aucun";
    
    @Column(name = "posologie",nullable = false, columnDefinition = "TEXT")
    private String posologie = "Aucune";
    
    @Column(name = "instructions", nullable = false, columnDefinition = "TEXT")
    private String instructions = "Aucune";

    @Column(name = "nom_medecin",nullable = false)
    private String nomMedecin;

    @Column(name = "num_medecin",nullable = false)
    private String numMedecin;
    
    @Column(name = "date", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(value = "date")
    private LocalDateTime date = LocalDateTime.now();

    
    // Méthode pour faciliter la désérialisation de la date depuis le frontend
    @com.fasterxml.jackson.annotation.JsonProperty("date")
    public void setDatePrescriptionFromString(String date) {
        if (date != null && !date.isEmpty()) {
            try {
                // Si la date est au format ISO (avec heure)
                if (date.length() > 10 && date.contains("T")) {
                    this.date = LocalDateTime.parse(date);
                } 
                // Si la date est au format simple YYYY-MM-DD
                else if (date.length() == 10) {
                    this.date = java.time.LocalDate.parse(date).atStartOfDay();
                }
            } catch (Exception e) {
                // En cas d'erreur, on garde la date actuelle
                this.date = LocalDateTime.now();
            }
        }
    }

    public Ordonnance (String medicaments, String instructions, String posologie, String nomMedecin, String numMedecin)
    {
        this.medicaments = medicaments;
        this.instructions = instructions;
        this.posologie = posologie;
        this.nomMedecin = nomMedecin;
        this.numMedecin = numMedecin;
    }

    
    // Nouvelle relation avec la consultation médicale
    @ManyToOne
    @JoinColumn(name = "consultation_id")
    @JsonIgnore
    private Consultation consultation;
    
    
    // Méthode explicite pour corriger les erreurs de lint
    public void setConsultation(Consultation consultation) 
    {
        this.consultation = consultation;
    }
}
