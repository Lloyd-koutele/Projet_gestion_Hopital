package sn.hopital.gestion_hopital.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import sn.hopital.gestion_hopital.repository.AdminRepository;
import sn.hopital.gestion_hopital.entite.AdminEntite;


@Component
public class InitialAdminCreator implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(InitialAdminCreator.class);
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    
    public InitialAdminCreator(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) {
        try {
            createInitialAdminIfNeeded();
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'administrateur initial", e);
        }
    }
    
    private void createInitialAdminIfNeeded() {
        String adminEmail = "koutelemarvinlloyd@gmail.com";
        
        if (adminRepository.findByEmail(adminEmail).isEmpty()) {
            AdminEntite admin = new AdminEntite(
                "Marvin",        // nom
                "Lloyd",         // prenom
                adminEmail,      // email
                passwordEncoder.encode("passer"), // password encodé
                "778370157",     // telephone
                "Direction"      // departement
            );
            
            adminRepository.save(admin);
            logger.info("Administrateur initial créé avec succès");
        } else {
            logger.info("L'administrateur initial existe déjà");
        }
    }
}
