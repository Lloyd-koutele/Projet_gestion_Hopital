package sn.gestion_hospital.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Image_Medicale")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageMedicale 
{
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String typeImage;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String lienFichier;
    
    @Column(nullable = false)
    private LocalDateTime date;

    
    
    // Nouvelle relation avec l'antécédent médical
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
