package sn.gestion_hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.dto.PatientCreationDTO;
import sn.gestion_hospital.entite.DossierMedical;
import sn.gestion_hospital.entite.Patient;
import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.PatientRepository;
import sn.gestion_hospital.repository.MedecinRepository;

/**
 * Service pour la gestion des patients
 */
@Service
public class PatientService 
{

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AutorisationService autorisationService;
    @Autowired
    private MedecinService medecinService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MedecinRepository medecinRepository;

    /**
     * Récupère un patient par son ID
     */
    public Optional<Patient> getPatientById(Long id) 
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
    public Patient createPatient(PatientCreationDTO dto, Long medecinId) 
    {
        // 1. Vérifier si le médecin référent existe
        Medecin medecinReferent = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new BusinessException("Médecin référent introuvable avec l'ID : " + medecinId));

        // 2. Vérifier si un patient avec le même email existe déjà
        patientRepository.findByEmail(dto.getEmail()).ifPresent(p -> 
        {
            throw new BusinessException("Un patient avec cet email existe déjà : " + dto.getEmail());
        });

        // 3. Vérifier que l'utilisateur actuel est bien authentifié
        medecinService.getMedecinConnecte()
                .orElseThrow(() -> new BusinessException("Action non autorisée : médecin non authentifié"));

        // 4. Création du Dossier Médical
        DossierMedical dossier = new DossierMedical();
        dossier.setSexe(dto.getSexe());
        dossier.setGroupeSanguin(dto.getGroupeSanguin());
        dossier.setContexte(dto.getContexte());
        dossier.setPoids(dto.getPoids());
        dossier.setTaille(dto.getTaille());

        // 5. Création du Patient (Correction : on utilise bien le 'dto')
        Patient patient = new Patient();
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setTelephone(dto.getTelephone());
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        // 6. Établissement des relations
        patient.setMedecinReferent(medecinReferent);
        
        // Relation bidirectionnelle
        patient.setDossierMedical(dossier);

        // 7. Sauvegarde
        return patientRepository.save(patient);
    }
    /**
     * Met à jour un patient existant
     */
    @Transactional
    public Patient updatePatient(Patient patient) 
    {
        // Vérifier si le patient existe
        Optional<Patient> existingPatient = patientRepository.findById(patient.getId());
        if (!existingPatient.isPresent()) 
        {
            throw new BusinessException("Patient non trouvé");
        }



        return patientRepository.save(patient);
    }

    /**
     * Désactive un patient (au lieu de le supprimer)
     */
    @Transactional
    public void desactiverPatient(Long patientId) 
    {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) 
        {
            throw new BusinessException("Patient non trouvé");
        }

        Patient patient = patientOpt.get();
        patient.setActif(false);
        patientRepository.save(patient);
    }

    @Transactional
    public void activerPatient(Long patientId) 
    {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) 
        {
            throw new BusinessException("Patient non trouvé");
        }

        Patient patient = patientOpt.get();
        patient.setActif(true);
        patientRepository.save(patient);
    }

    /**
     * Vérifie si un médecin a accès à un patient
     */
    // public boolean verifierAccesMedecin(int patientId, Medecin medecin)
    // {
    // if (medecin == null)
    // {
    // return false;
    // }

    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent())
    // {
    // return false;
    // }

    // Patient patient = patientOpt.get();

    // // Le médecin référent a toujours accès
    // if (patient.getMedecinReferent() != null &&
    // patient.getMedecinReferent().getId() == medecin.getId())
    // {
    // return true;
    // }

    // // Vérifier les autorisations d'accès
    // return autorisationService.verifierAcces(patient, medecin);
    // }

    /**
     * Récupère tous les patients accessibles par un médecin
     */
    public List<Patient> getPatientsAccessiblesByMedecin(Medecin medecin) 
    {
        if (medecin == null) 
        {
            throw new BusinessException("Le médecin ne peut pas être null");
        }

        return autorisationService.getPatientsAccessibles(medecin);
    }

    /**
     * Met à jour le dossier médical d'un patient
     */
    @Transactional
    public DossierMedical updateDossierMedical(Long patientId, DossierMedical dossierMedical) 
    {
        if (dossierMedical == null) 
        {
            throw new BusinessException("Le dossier médical ne peut pas être null");
        }

        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) 
        {
            throw new BusinessException("Patient non trouvé");
        }

        Patient patient = patientOpt.get();
        DossierMedical existingDossier = patient.getDossierMedical();

        if (existingDossier == null) 
        {
            throw new BusinessException("Le patient n'a pas de dossier médical");
        }

        // Mise à jour des champs du dossier médical
        existingDossier.setSexe(dossierMedical.getSexe());
        existingDossier.setGroupeSanguin(dossierMedical.getGroupeSanguin());
        existingDossier.setContexte(dossierMedical.getContexte());
        existingDossier.setPoids(dossierMedical.getPoids());
        existingDossier.setTaille(dossierMedical.getTaille());

        // Sauvegarder le patient va aussi sauvegarder le dossier médical grâce à la
        // cascade
        patientRepository.save(patient);

        return existingDossier;
    }
}
