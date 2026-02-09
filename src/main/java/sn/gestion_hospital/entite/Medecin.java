package sn.gestion_hospital.entite;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un médecin dans le système.
 */
@Entity
@Table(name = "medecins")
@DiscriminatorValue("MEDECIN")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Medecin extends User 
{

    @NotBlank(message = "La spécialité est obligatoire")
    @Size(min = 2, max = 100, message = "La spécialité doit contenir entre 2 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String specialite;
    
    @NotBlank(message = "Le numéro d'ordre est obligatoire")
    @Size(min = 2, max = 50, message = "Le numéro d'ordre doit contenir entre 2 et 50 caractères")
    @Column(name = "numero_ordre", nullable = true, length = 50, unique = true)
    private String numeroOrdre;

    // Patients dont ce médecin est le référent/créateur
    @OneToMany(mappedBy = "medecinReferent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private final List<Patient> patientsReferents = new ArrayList<>();
    
    // Autorisations accordées par ce médecin
    @OneToMany(mappedBy = "medecinAccordeur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference(value = "medecin-acces-accordes")
    private final List<AutorisationAccesPatient> autorisationsAccordees = new ArrayList<>();
    
    // Autorisations reçues par ce médecin
    @OneToMany(mappedBy = "medecinAutorise", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference(value = "medecin-acces-recus")
    private final List<AutorisationAccesPatient> autorisationsRecues = new ArrayList<>();


    public Medecin(String nom, String prenom, String email, String password, String telephone, String specialite, String numeroOrdre) 
    {
        super();
        this.setNom(nom);
        this.setPrenom(prenom);
        this.setEmail(email);
        this.setPassword(password);
        this.setRoles(Role.MEDECIN);
        this.setActif(true);
        this.setTelephone(telephone);
        this.specialite = specialite;
        this.numeroOrdre = numeroOrdre;
    }
    
    /**
     * Ajoute un patient à la liste des patients référents
     */
    public void ajouterPatientReferent(Patient patient) 
    {
        if (!this.patientsReferents.contains(patient)) 
        {
            this.patientsReferents.add(patient);
            patient.setMedecinReferent(this);
        }
    }
}
