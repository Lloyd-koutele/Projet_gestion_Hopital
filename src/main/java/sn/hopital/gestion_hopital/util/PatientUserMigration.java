package sn.hopital.gestion_hopital.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.repository.UserRepository;

import java.util.List;
import java.util.Optional;

/**
 * Utilitaire pour migrer les patients existants vers la table users.
 * Cette classe s'exécutera automatiquement au démarrage de l'application lorsque le profil "migration" est actif.
 * Pour activer ce profil, démarrez l'application avec -Dspring.profiles.active=migration
 */
@Component
@Profile("migration")
public class PatientUserMigration implements CommandLineRunner {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("==========================================================");
        System.out.println("DÉMARRAGE DE LA MIGRATION DES PATIENTS VERS LA TABLE USERS");
        System.out.println("==========================================================");

        // Récupérer tous les patients
        Iterable<Patient> patients = patientRepository.findAll();
        int count = 0;
        for (Patient p : patients) {
            count++;
        }
        System.out.println("Nombre total de patients trouvés: " + count);

        int migrés = 0;
        int déjàExistants = 0;
        int erreurs = 0;

        // Pour chaque patient, vérifier s'il existe déjà dans la table users
        for (Patient patient : patients) {
            try {
                // Vérifier si l'utilisateur existe déjà avec cet email ET le rôle PATIENT
                Optional<User> existingUser = userRepository.findByEmailAndRoles(patient.getEmail(), sn.hopital.gestion_hopital.entite.Role.PATIENT);
                
                if (existingUser.isPresent()) {
                    System.out.println("L'utilisateur existe déjà pour le patient " + patient.getEmail());
                    déjàExistants++;
                } else {
                    // Créer un nouvel utilisateur à partir des données du patient
                    User user = new User();
                    user.setEmail(patient.getEmail());
                    user.setPassword(patient.getPassword());
                    user.setNom(patient.getNom());
                    user.setPrenom(patient.getPrenom());
                    user.setRoles(sn.hopital.gestion_hopital.entite.Role.PATIENT); // Forcer le rôle PATIENT
                    user.setActif(patient.isActif());
                    user.setTelephone(patient.getTelephone());

                    // Sauvegarder l'utilisateur
                    userRepository.save(user);
                    migrés++;
                    System.out.println("Patient migré avec succès: " + patient.getEmail());
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la migration du patient " + patient.getEmail() + ": " + e.getMessage());
                erreurs++;
            }
        }

        System.out.println("==========================================================");
        System.out.println("RÉSUMÉ DE LA MIGRATION:");
        System.out.println("- Patients migrés: " + migrés);
        System.out.println("- Patients déjà existants dans users: " + déjàExistants);
        System.out.println("- Erreurs: " + erreurs);
        System.out.println("==========================================================");
    }
}
