package sn.gestion_hospital.entite;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.OneToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Patient")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends User 
{
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 1, max = 100, message = "Le nom doit contenir entre 1 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    @Size(min = 1, max = 100, message = "Le prenom doit contenir entre 1 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private boolean actif = true;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private Date dateNaissance;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Column(nullable = false, length = 100)
    private String telephone;

    @NotBlank(message = "le mot de passe est obligatoire")
    @Column(nullable = false, length = 100)
    private String password;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dossier_medical_id")
    @JsonManagedReference
    private DossierMedical dossierMedical;

    @ManyToOne
    @JoinColumn(name = "medecin_referent_id", nullable = false)
    @JsonBackReference(value = "medecin-patient")
    private Medecin medecinReferent;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "patient-autorisations")
    private List<AutorisationAccesPatient> autorisationsAcces = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RendezVous> rendezVous = new ArrayList<>();

    public Patient(String nom, String prenom, String email, DossierMedical dossierMedical, Date dateNaissance, String telephone) 
    {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.actif = true;
        this.setRoles(Role.PATIENT);
        this.dossierMedical = dossierMedical;
        this.dateNaissance = dateNaissance;
        this.telephone = telephone;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role roles;

    public void setRoles(Role roles) 
    {
        this.roles = roles;
    }

    public Role getRoles() 
    {
        return this.roles;
    }

    public Patient(String nom, String prenom, String email, DossierMedical dossierMedical, Date dateNaissance, String telephone, Medecin medecinReferent) 
    {
        this(nom, prenom, email, dossierMedical, dateNaissance, telephone);
        this.medecinReferent = medecinReferent;
    }

    public void setDossierMedical(DossierMedical dossierMedical) 
    {
        if (this.dossierMedical != dossierMedical) 
        {
            this.dossierMedical = dossierMedical;
            if (dossierMedical != null && dossierMedical.getPatient() != this) 
            {
                dossierMedical.setPatient(this);
            }
        }
    }

    public void ajouterAutorisation(AutorisationAccesPatient autorisation) 
    {
        this.autorisationsAcces.add(autorisation);
    }

    public void supprimerAutorisation(AutorisationAccesPatient autorisation) 
    {
        this.autorisationsAcces.remove(autorisation);
    }
}
