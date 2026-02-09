package sn.gestion_hospital.dto;

import java.util.Date;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

@Data
@Schema(description = "DTO pour la création d'un patient")
public class PatientCreationDTO {
    
    @Schema(description = "Nom du patient", example = "Dupont")
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @Schema(description = "Prénom du patient", example = "Jean")
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Schema(description = "Email du patient", example = "jean.dupont@email.com")
    @Email(message = "L'email n'est pas valide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @Schema(description = "Date de naissance du patient", example = "1990-01-01")
    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private Date dateNaissance;

    @Schema(description = "Numéro de téléphone du patient", example = "771234567")
    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String telephone;
    
    @Schema(description = "Sexe du patient (M ou F)", example = "M")
    @NotBlank(message = "Le sexe est obligatoire")
    private String sexe;

    @Schema(description = "Poids du patient", example = "80 Kg")
    @NotNull(message = "Le poids est obligatoire")
    private String poids;

    @Schema(description = "Taille du patient", example = "180 cm")
    @NotNull(message = "La taille est obligatoire")
    private String taille;

    @Schema(description = "Le mot de passe du patient", example = "password")
    @NotNull(message = "le mot de passe est obligatoire")
    private String password;
    
    
    private String groupeSanguin;
    
    private String contexte;

    // Getters et setters
    public String getNom() 
    {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(Date dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }

    public String getPoids() {
        return poids;
    }

    public void setPoids(String poids) {
        this.poids = poids;
    }

    public String getTaille() {
        return taille;
    }

    public void setTaille(String taille) {
        this.taille = taille;
    }

    public String getGroupeSanguin() {
        return groupeSanguin;
    }

    public void setGroupeSanguin(String groupeSanguin) {
        this.groupeSanguin = groupeSanguin;
    }

    public String getContexte() {
        return contexte;
    }

    public void setContexte(String contexte) {
        this.contexte = contexte;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
