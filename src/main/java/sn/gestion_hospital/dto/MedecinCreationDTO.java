package sn.gestion_hospital.dto;

import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import sn.gestion_hospital.entite.Role;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor 
@AllArgsConstructor
public class MedecinCreationDTO {
   
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;
    
    @Size(min = 2, max = 100, message = "Le prénom doit contenir entre 2 et 100 caractères")
    private String prenom;
    
    @Email(message = "L'email n'est pas valide")
    private String email;
    
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Size(min = 8, max = 20, message = "Le numéro de téléphone doit contenir entre 8 et 20 caractères")
    private String telephone;
    
    @Size(min = 2, max = 100, message = "La spécialité doit contenir entre 2 et 100 caractères")
    private String specialite;
    
    @Size(min = 2, max = 50, message = "Le numéro d'ordre doit contenir entre 2 et 50 caractères")
    private String numeroOrdre;
}
