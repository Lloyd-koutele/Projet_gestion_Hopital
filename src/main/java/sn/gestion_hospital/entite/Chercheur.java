package sn.gestion_hospital.entite;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "chercheurs")
@DiscriminatorValue("CHERCHEUR")
@Data
@EqualsAndHashCode(callSuper = true)
public class Chercheur extends User
{
    @Size(min = 2, max = 100, message = "La spécialité doit contenir entre 2 et 100 caractères")
    @Column(nullable = true, length = 100)
    private String specialiteRecherche;

    public Chercheur () 
    {
        super();
    }

    private Role role;

    public Chercheur(String nom, String prenom, String email, String password, String telephone, String specialiteRecherche) 
    {
        super();
        this.setNom(nom);
        this.setPrenom(prenom);
        this.setEmail(email);
        this.setPassword(password);
        this.setRoles(Role.CHERCHEUR);
        this.setActif(true);
        this.setTelephone(telephone);
        this.specialiteRecherche = specialiteRecherche;
    }
}
