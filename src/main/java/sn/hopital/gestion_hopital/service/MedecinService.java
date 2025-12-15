package sn.hopital.gestion_hopital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.hopital.gestion_hopital.dto.PatientCreationDTO;
import sn.hopital.gestion_hopital.dto.MedecinCreationDTO;
import sn.hopital.gestion_hopital.entite.DossierMedical;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.Role;
import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.exception.BusinessException;
import sn.hopital.gestion_hopital.repository.MedecinRepository;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.repository.UserRepository;

/**
 * Service pour la gestion des médecins
 */
@Service
public class MedecinService 
{

    @Autowired
    private MedecinRepository medecinRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    @org.springframework.context.annotation.Lazy
    private PatientService patientService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Récupère le médecin connecté actuellement
     */
    public Optional<MedecinEntite> getMedecinConnecte() 
    {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = null;
        
        if (principal instanceof UserDetails) 
        {
            email = ((UserDetails) principal).getUsername();
        } 
        else 
        {
            email = principal.toString();
        }
        
        return medecinRepository.findByEmail(email);
    }
    
    /**
     * Vérifie si l'utilisateur est un médecin
     */
    public boolean estMedecin(User user) 
    {
        return user != null && Role.MEDECIN.equals(user.getRoles());
    }
    
    /**
     * Récupère un médecin par son ID
     */
    public Optional<MedecinEntite> getMedecinById(Long id) 
    {
        return medecinRepository.findById(id);
    }
    
    /**
     * Récupère un médecin par son email
     */
    public Optional<MedecinEntite> getMedecinByEmail(String email) 
    {
        return medecinRepository.findByEmail(email);
    }
    
    /**
     * Récupère tous les médecins actifs
     */
    public List<MedecinEntite> getAllMedecinsActifs() 
    {
        return medecinRepository.findByActifTrue();
    }
    
    /**
     * Récupère les médecins par spécialité
     */
    public List<MedecinEntite> getMedecinsBySpecialite(String specialite) 
    {
        return medecinRepository.findBySpecialite(specialite);
    }
    
    /**
     * Crée ou met à jour un médecin
     */
    @Transactional
    public MedecinEntite saveMedecin(MedecinEntite medecin) 
    {
        return medecinRepository.save(medecin);
    }
    
    /**
     * Vérifie si un utilisateur est un médecin et retourne son entité si elle existe
     */
    public Optional<MedecinEntite> getMedecinFromUser(User user) 
    {
        if (!estMedecin(user)) {
            return Optional.empty();
        }
        
        // Vérifier si le médecin existe déjà
        return medecinRepository.findByEmail(user.getEmail());
    }

    /**
     * Crée un nouveau médecin
     *
     * @param dto les données du médecin à créer
     * @return le médecin créé
     * @throws BusinessException si les données sont invalides ou si l'email est déjà utilisé
     */
    @Transactional
    public MedecinEntite createMedecin(MedecinCreationDTO dto) 
    {
        validateMedecinData(dto);
        
        // Vérifier si l'utilisateur existe déjà
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) 
        {
            throw new BusinessException("Cet email est déjà utilisé");
        }
        
        // Créer et sauvegarder le médecin
        MedecinEntite medecin = new MedecinEntite(
            dto.getNom(),
            dto.getPrenom(),
            dto.getEmail(),
            passwordEncoder.encode(dto.getPassword()),
            dto.getTelephone(),
            dto.getSpecialite(),
            dto.getNumeroOrdre()
        );
        
        return medecinRepository.save(medecin);
    }
    
    private void validateMedecinData(MedecinCreationDTO dto) 
    {
        if (!StringUtils.hasText(dto.getNom())) {
            throw new BusinessException("Le nom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPrenom())) {
            throw new BusinessException("Le prénom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getEmail())) {
            throw new BusinessException("L'email est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BusinessException("Le mot de passe est obligatoire");
        }
        if (dto.getPassword().length() < 6) {
            throw new BusinessException("Le mot de passe doit contenir au moins 6 caractères");
        }
        if (!StringUtils.hasText(dto.getTelephone())) {
            throw new BusinessException("Le téléphone est obligatoire");
        }
        if (!StringUtils.hasText(dto.getSpecialite())) {
            throw new BusinessException("La spécialité est obligatoire");
        }
        if (!StringUtils.hasText(dto.getNumeroOrdre())) {
            throw new BusinessException("Le numéro d'ordre est obligatoire");
        }
    }
    
    /**
     * Crée un nouveau patient à partir d'un DTO
     * 
     * @param dto Les données du patient à créer
     * @return Le patient créé
     * @throws BusinessException si les données sont invalides ou si le patient existe déjà
     */
    @Transactional
    public Patient createPatient(PatientCreationDTO dto) {
        // Validation des données
        validatePatientData(dto);
        
        // Récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = getMedecinConnecte();
        if (!medecinConnecteOpt.isPresent()) 
        {
            throw new BusinessException("Médecin non authentifié");
        }
        
        MedecinEntite medecinConnecte = medecinConnecteOpt.get();
        
        // Vérifier si le patient existe déjà (vérification centralisée au niveau du service)
        // La vérification redondante est supprimée ici car elle est déjà faite dans PatientService
        
        // Création du patient
        // Création du dossier médical
        DossierMedical dossierMedical = new DossierMedical(
            dto.getSexe(),
            dto.getGroupeSanguin(),
            dto.getContexte(),
            dto.getPoids(),
            dto.getTaille()
        );

        // Création du patient
        Patient patient = new Patient(
            dto.getNom(),
            dto.getPrenom(),
            dto.getEmail(),
            dossierMedical,
            dto.getDateNaissance(),
            dto.getTelephone()
        );
        
        // Hasher le mot de passe avant de l'enregistrer
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        // Association du dossier médical au patient
        patient.setDossierMedical(dossierMedical);
        
        // Utiliser le PatientService pour créer le patient
        return patientService.createPatient(patient, medecinConnecte);
    }
    
    /**
     * Valide les données d'un patient
     */
    private void validatePatientData(PatientCreationDTO dto) {
        if (!StringUtils.hasText(dto.getNom())) {
            throw new BusinessException("Le nom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPrenom())) {
            throw new BusinessException("Le prénom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getEmail())) {
            throw new BusinessException("L'email est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BusinessException("Le mot de passe est obligatoire");
        }
        if (dto.getPassword().length() < 6) {
            throw new BusinessException("Le mot de passe doit contenir au moins 6 caractères");
        }
        if (dto.getDateNaissance() == null) {
            throw new BusinessException("La date de naissance est obligatoire");
        }
        if (!StringUtils.hasText(dto.getTelephone())) {
            throw new BusinessException("Le téléphone est obligatoire");
        }
        if (!StringUtils.hasText(dto.getSexe())) {
            throw new BusinessException("Le sexe est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPoids())) {
            throw new BusinessException("Le poids est obligatoire");
        }
        if (!StringUtils.hasText(dto.getTaille())) {
            throw new BusinessException("La taille est obligatoire");
        }
        if (!StringUtils.hasText(dto.getGroupeSanguin())) {
            throw new BusinessException("Le groupe sanguin est obligatoire");
        }
        if (!StringUtils.hasText(dto.getContexte())) {
            throw new BusinessException("Le contexte est obligatoire");
        }
    }
    
}
