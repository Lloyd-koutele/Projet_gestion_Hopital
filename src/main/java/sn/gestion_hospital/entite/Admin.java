package sn.gestion_hospital.entite;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin")
@DiscriminatorValue("ADMIN")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class Admin extends User 
{
    @NotBlank(message = "Le département est obligatoire")
    @Size(min = 2, max = 100, message = "Le département doit contenir entre 2 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String departement;

    public Admin(String nom, String prenom, String email, String password, String telephone, String departement) 
    {
        super();
        this.setNom(nom);
        this.setPrenom(prenom);
        this.setEmail(email);
        this.setPassword(password);
        this.setRoles(Role.ADMIN);
        this.setActif(true);
        this.setTelephone(telephone);
        this.departement = departement;
    }

}