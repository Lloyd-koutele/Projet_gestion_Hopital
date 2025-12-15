package sn.hopital.gestion_hopital.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Analyses 
{
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String typeAnalyse;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String resultat;
    
    @Column(nullable = false)
    private String laboratoire;
    
    // Alias pour maintenir la compatibilité avec le frontend existant
    @com.fasterxml.jackson.annotation.JsonProperty("Laboratoire")
    public String getLaboratoire() 
    {
        return laboratoire;
    }
    
    @com.fasterxml.jackson.annotation.JsonProperty("Laboratoire")
    public void setLaboratoire(String laboratoire) 
    {
        this.laboratoire = laboratoire;
    }
    
    @Column(nullable = false)
    private LocalDateTime dateAnalyse = LocalDateTime.now();

    public Analyses (String typeAnalyse, String resultat, String laboratoire)
    { 
        this.typeAnalyse = typeAnalyse;
        this.resultat = resultat;
        this.laboratoire = laboratoire;
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
