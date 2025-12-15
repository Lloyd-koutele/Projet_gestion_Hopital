package sn.hopital.gestion_hopital.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation
{
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String type; // ANALYSE, ORDONNANCE, IMAGE
    
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String nomMedecin ;

    @Column(nullable = false)
    private String numeroMedecin;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @ElementCollection
    @CollectionTable(name = "consultation_reference_types", joinColumns = @JoinColumn(name = "antecedent_id"))
    @Column(name = "reference_type")
    private List<String> referenceTypes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "consultation_reference_ids", joinColumns = @JoinColumn(name = "antecedent_id"))
    @Column(name = "reference_id")
    private List<UUID> referenceIds = new ArrayList<>(); 

    // Relation avec le dossier médical
    @ManyToOne
    @JoinColumn(name = "dossier_medical_id", nullable = false)
    @JsonIgnore 
    private DossierMedical dossierMedical;
    
    // Collections d'éléments médicaux associés à cet antécédent
    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImageMedicale> images = new ArrayList<>();
    
    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ordonnance> ordonnances = new ArrayList<>();
    
    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Analyses> analyses = new ArrayList<>();

    public Consultation (String type, String description, String nomMedecin, String numeroMedecin)
    {
        this.type = type;
        this.description = description;
        this.nomMedecin = nomMedecin;
        this.numeroMedecin = numeroMedecin;
    }
    
   // Méthodes pour gérer les images
   public void ajouterImage(ImageMedicale image) 
   {
       if (this.images == null) {
           this.images = new ArrayList<>();
       }
       
       if (image != null)
       {
           this.images.add(image);
           if (image.getConsultation() != this) 
           {
               image.setConsultation(this);
           }
       }
   }
   
   public void supprimerImage(ImageMedicale image) 
   {
       if (this.images == null) {
           this.images = new ArrayList<>();
           return;
       }
       
       if (image != null && this.images.contains(image)) 
       {
           this.images.remove(image);
           if (image.getConsultation() == this) 
           {
               image.setConsultation(null);
           }
       }
   }
    
    // Méthodes pour gérer les analyses
    public void ajouterAnalyse(Analyses analyse) 
    {
        if (this.analyses == null) {
            this.analyses = new ArrayList<>();
        }
        
        if(analyse != null)
        {
            this.analyses.add(analyse);
            if(analyse.getConsultation() != this)
            {
                analyse.setConsultation(this);
            }
        }
    }
    
    // Méthodes pour gérer les ordonnances
    public void ajouterOrdonnance(Ordonnance ordonnance) 
    {
        if (this.ordonnances == null) {
            this.ordonnances = new ArrayList<>();
        }
        
        if(ordonnance != null)
        {
            this.ordonnances.add(ordonnance);
            if(ordonnance.getConsultation() != this)
            {
                ordonnance.setConsultation(this);
            }
        }
    }
    
}
