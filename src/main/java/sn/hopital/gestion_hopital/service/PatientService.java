package sn.hopital.gestion_hopital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.DossierMedical;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.Role;
import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.exception.BusinessException;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.repository.UserRepository;

/**
 * Service pour la gestion des patients
 */
@Service
public class PatientService 
{

    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AutorisationService autorisationService;

    /**
     * Récupère un patient par son ID
     */
    public Optional<Patient> getPatientById(int id) 
    {
        return patientRepository.findById(id);
    }

    /**
     * Récupère un patient par son email
     */
    public Optional<Patient> getPatientByEmail(String email) 
    {
        return patientRepository.findByEmail(email);
    }

    /**
     * Crée un nouveau patient
     */
    @Transactional
    public Patient createPatient(Patient patient, MedecinEntite medecinReferent) {
        if (patient == null) {
            throw new BusinessException("Le patient ne peut pas être null");
        }
        
        if (medecinReferent == null) {
            throw new BusinessException("Le médecin référent ne peut pas être null");
        }
        
        // Vérifier si un patient avec le même email existe déjà
        Optional<Patient> existingPatient = patientRepository.findByEmail(patient.getEmail());
        if (existingPatient.isPresent()) {
            throw new BusinessException("Un patient avec cet email existe déjà: " + patient.getEmail());
        }
        
        // Vérifier si un utilisateur avec le même email ET le rôle PATIENT existe déjà
        Optional<User> existingUser = userRepository.findByEmailAndRoles(patient.getEmail(), sn.hopital.gestion_hopital.entite.Role.PATIENT);
        if (existingUser.isPresent()) {
            throw new BusinessException("Un patient avec cet email existe déjà dans le système: " + patient.getEmail());
        }
        
        // S'assurer que le patient a un dossier médical
        if (patient.getDossierMedical() == null) {
            throw new BusinessException("Le patient doit avoir un dossier médical");
        }
        
        // Logs pour le débogage
        System.out.println("-----------------------------------");
        System.out.println("Création d'un patient avec médecin référent:");
        System.out.println("Médecin ID: " + medecinReferent.getId());
        System.out.println("Médecin nom: " + medecinReferent.getNom() + " " + medecinReferent.getPrenom());
        System.out.println("Patient email: " + patient.getEmail());
        
        // Associer le médecin référent
        patient.setMedecinReferent(medecinReferent);
        
        // Log après association
        System.out.println("Après association - Patient medecinReferent: " + 
            (patient.getMedecinReferent() != null ? patient.getMedecinReferent().getId() : "null"));
        
        // Activer le patient par défaut
        patient.setActif(true);
        
        // Créer un utilisateur correspondant dans la table users
        User user = new User();
        user.setEmail(patient.getEmail());
        user.setPassword(patient.getPassword());
        user.setNom(patient.getNom());
        user.setPrenom(patient.getPrenom());
        user.setRoles(sn.hopital.gestion_hopital.entite.Role.PATIENT); // Forcer le rôle PATIENT
        user.setActif(true);
        user.setTelephone(patient.getTelephone());
        
        System.out.println("-----------------------------------");
        System.out.println("Création d'un utilisateur pour le patient:");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Rôle: " + user.getRoles());
        
        // Sauvegarder l'utilisateur
        userRepository.save(user);
        System.out.println("Utilisateur créé avec succès dans la table users");
        
        // Sauvegarder et récupérer le patient
        Patient savedPatient = patientRepository.save(patient);
        
        // Vérifier que le médecin référent est bien sauvegardé
        System.out.println("Après sauvegarde - Patient ID: " + savedPatient.getId());
        System.out.println("Après sauvegarde - Patient medecinReferent: " + 
            (savedPatient.getMedecinReferent() != null ? savedPatient.getMedecinReferent().getId() : "null"));
        System.out.println("-----------------------------------");
        
        return savedPatient;
    }

    /**
     * Met à jour un patient existant
     */
    @Transactional
    public Patient updatePatient(Patient patient) {
        if (patient == null) {
            throw new BusinessException("Le patient ne peut pas être null");
        }
        
        // Vérifier si le patient existe
        Optional<Patient> existingPatient = patientRepository.findById(patient.getId());
        if (!existingPatient.isPresent()) {
            throw new BusinessException("Patient non trouvé");
        }
        
        return patientRepository.save(patient);
    }

    /**
     * Désactive un patient (au lieu de le supprimer)
     */
    @Transactional
    public void desactiverPatient(int patientId) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new BusinessException("Patient non trouvé");
        }
        
        Patient patient = patientOpt.get();
        patient.setActif(false);
        patientRepository.save(patient);
    }

    /**
     * Réactive un patient désactivé
     */
    @Transactional
    public void activerPatient(int patientId) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new BusinessException("Patient non trouvé");
        }
        
        Patient patient = patientOpt.get();
        patient.setActif(true);
        patientRepository.save(patient);
    }

    /**
     * Vérifie si un médecin a accès à un patient
     */
    public boolean verifierAccesMedecin(int patientId, MedecinEntite medecin) {
        if (medecin == null) {
            return false;
        }
        
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            return false;
        }
        
        Patient patient = patientOpt.get();
        
        // Le médecin référent a toujours accès
        if (patient.getMedecinReferent() != null && 
            patient.getMedecinReferent().getId() == medecin.getId()) {
            return true;
        }
        
        // Vérifier les autorisations d'accès
        return autorisationService.verifierAcces(medecin, patient);
    }

    /**
     * Récupère tous les patients accessibles par un médecin
     */
    public List<Patient> getPatientsAccessiblesByMedecin(MedecinEntite medecin) {
        if (medecin == null) {
            throw new BusinessException("Le médecin ne peut pas être null");
        }
        
        return autorisationService.getPatientsAccessibles(medecin);
    }

    /**
     * Met à jour le dossier médical d'un patient
     */
    @Transactional
    public DossierMedical updateDossierMedical(int patientId, DossierMedical dossierMedical) {
        if (dossierMedical == null) {
            throw new BusinessException("Le dossier médical ne peut pas être null");
        }
        
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new BusinessException("Patient non trouvé");
        }
        
        Patient patient = patientOpt.get();
        DossierMedical existingDossier = patient.getDossierMedical();
        
        if (existingDossier == null) {
            throw new BusinessException("Le patient n'a pas de dossier médical");
        }
        
        // Mise à jour des champs du dossier médical
        existingDossier.setSexe(dossierMedical.getSexe());
        existingDossier.setGroupeSanguin(dossierMedical.getGroupeSanguin());
        existingDossier.setContexte(dossierMedical.getContexte());
        existingDossier.setPoids(dossierMedical.getPoids());
        existingDossier.setTaille(dossierMedical.getTaille());
        
        // Sauvegarder le patient va aussi sauvegarder le dossier médical grâce à la cascade
        patientRepository.save(patient);
        
        return existingDossier;
    }
}
