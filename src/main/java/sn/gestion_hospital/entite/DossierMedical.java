package sn.gestion_hospital.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "Dossier_Medical")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedical
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(nullable = false)
    private String sexe;

    private String groupeSanguin;

    private String contexte;

    private String poids;

    private String taille;

    @OneToMany(mappedBy = "dossierMedical", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consultation> consultation = new ArrayList<>();

    
    @OneToOne(mappedBy = "dossierMedical")
    @JsonBackReference
    private Patient patient;


    public DossierMedical(String sexe, String groupeSanguin, String contexte, String poids, String taille) 
    {
        this.sexe = sexe;
        this.groupeSanguin = groupeSanguin;
        this.contexte = contexte;
        this.poids = poids;
        this.taille = taille;
    }

    // Gestion de la relation bidirectionnelle avec Patient
    public void setPatient(Patient patient)
    {
        if (this.patient != patient) 
        {
            this.patient = patient;
            if (patient != null && patient.getDossierMedical() != this) 
            {
                patient.setDossierMedical(this);
            }
        }
    }
    
    

    // Calcul de l'âge à partir de la date de naissance du patient
    public int getAge() 
    {
        if (patient != null && patient.getDateNaissance() != null) 
        {
            LocalDate birthDate = new Date(patient.getDateNaissance().getTime())
                .toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate();
            return Period.between(birthDate, LocalDate.now()).getYears();
        }
        return 0;
    }

}
