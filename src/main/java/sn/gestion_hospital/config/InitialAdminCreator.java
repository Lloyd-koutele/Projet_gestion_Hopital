package sn.gestion_hospital.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import sn.gestion_hospital.repository.AdminRepository;
import sn.gestion_hospital.entite.Admin;

@Component
public class InitialAdminCreator implements CommandLineRunner 
{

    private static final Logger logger = LoggerFactory.getLogger(InitialAdminCreator.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public InitialAdminCreator(AdminRepository adminRepository, PasswordEncoder passwordEncoder) 
    {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) 
    {
        try 
        {
            createInitialAdminIfNeeded();
        } 
        catch (Exception e) 
        {
            logger.error("Erreur lors de la création de l'administrateur initial", e);
        }
    }

    private void createInitialAdminIfNeeded() {
        String adminEmail = "koutelemarvinlloyd@gmail.com";

        if (adminRepository.findByEmail(adminEmail).isEmpty()) 
        {
            Admin admin = new Admin(
                    "Marvin",
                    "Lloyd",
                    adminEmail,
                    passwordEncoder.encode("Marvic&21"),
                    "778370157",
                    "Direction");

            adminRepository.save(admin);
            logger.info("Administrateur initial créé avec succès\n"
                    + "Le login est : kooutelemarvinlloyd@gmail.com\n"
                    + "Le mot de passe est : Marvic&21");
        } 
        else 
        {
            logger.info(
                    "L'administrateur initial existe déjà\n"
                            + "Le login est : kooutelemarvinlloyd@gmail.com\n"
                            + "Le mot de passe est : Marvic&21");
        }
    }
}
