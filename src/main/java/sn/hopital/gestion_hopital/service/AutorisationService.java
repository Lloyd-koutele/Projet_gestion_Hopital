package sn.hopital.gestion_hopital.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient;
import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient.NiveauAcces;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.repository.AutorisationAccesPatientRepository;
import sn.hopital.gestion_hopital.repository.MedecinRepository;
import sn.hopital.gestion_hopital.repository.PatientRepository;

/**
 * Service pour la gestion des autorisations d'accès aux patients
 */
@Service
public class AutorisationService {

    @Autowired
    private AutorisationAccesPatientRepository autorisationRepository;
    
    @Autowired
    private MedecinRepository medecinRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private MedecinService medecinService;
    
    /**
     * Vérifie si un médecin a accès à un patient
     * Un médecin a accès à un patient s'il est son médecin référent
     * ou s'il possède une autorisation active
     */
    public boolean verifierAcces(MedecinEntite medecin, Patient patient) {
        // Si le médecin est le référent du patient, il a automatiquement accès
        if (patient.getMedecinReferent() != null && patient.getMedecinReferent().equals(medecin)) {
            return true;
        }
        
        // Sinon, vérifier s'il existe une autorisation active
        return autorisationRepository.existsByMedecinAutoriseAndPatientAndActifTrueAndDateExpirationAfterOrDateExpirationIsNull(
                medecin, patient, LocalDateTime.now());
    }
    
    /**
     * Vérifie si une entité (médecin ou patient) peut accorder l'accès au dossier d'un patient
     */
    public boolean peutAccorderAcces(Object demandeur, Patient patient) {
        // Si le demandeur est le patient lui-même
        if (demandeur instanceof Patient) {
            Patient patientDemandeur = (Patient) demandeur;
            return patientDemandeur.getId() == patient.getId();
        }
        
        // Si le demandeur est un médecin
        if (demandeur instanceof MedecinEntite) {
            MedecinEntite medecinDemandeur = (MedecinEntite) demandeur;
            // Le médecin référent peut toujours accorder l'accès
            return patient.getMedecinReferent() != null && 
                   patient.getMedecinReferent().equals(medecinDemandeur);
        }
        
        return false;
    }
    
    /**
     * Crée une nouvelle autorisation d'accès par un médecin
     */
    @Transactional
    public AutorisationAccesPatient creerAutorisation(MedecinEntite medecinAccordeur, MedecinEntite medecinAutorise, 
                                                     Patient patient, LocalDateTime dateExpiration, String motif) {
        // Vérifier si le médecin accordeur est le référent du patient
        if (patient.getMedecinReferent() == null || !patient.getMedecinReferent().equals(medecinAccordeur)) {
            throw new IllegalArgumentException("Seul le médecin référent peut accorder une autorisation pour ce patient");
        }
        
        return creerAutorisationInterne(medecinAccordeur, medecinAutorise, patient, 
                                       NiveauAcces.COMPLET, dateExpiration, false);
    }
    
    /**
     * Crée une nouvelle autorisation d'accès par un patient
     */
    @Transactional
    public AutorisationAccesPatient creerAutorisationParPatient(Patient patientAccordeur, MedecinEntite medecinAutorise, 
                                                                NiveauAcces niveauAcces, LocalDateTime dateExpiration) {
        // Vérifier que le patient s'accorde bien l'autorisation à lui-même
        if (patientAccordeur == null) {
            throw new IllegalArgumentException("Le patient accordeur ne peut pas être null");
        }
        
        // Pour les autorisations accordées par le patient, on utilise le médecin référent comme accordeur
        // mais on marque l'autorisation comme "accordée par le patient"
        MedecinEntite medecinReferent = patientAccordeur.getMedecinReferent();
        if (medecinReferent == null) {
            throw new IllegalArgumentException("Le patient doit avoir un médecin référent");
        }
        
        return creerAutorisationInterne(medecinReferent, medecinAutorise, patientAccordeur, 
                                       niveauAcces, dateExpiration, true);
    }
    
    /**
     * Méthode interne pour créer une autorisation
     */
    private AutorisationAccesPatient creerAutorisationInterne(MedecinEntite medecinAccordeur, MedecinEntite medecinAutorise, 
                                                              Patient patient, NiveauAcces niveauAcces,
                                                              LocalDateTime dateExpiration, boolean accordeParPatient) {
        // Vérifier si une autorisation active existe déjà pour ce médecin et ce patient
        Optional<AutorisationAccesPatient> autorisationExistante = 
                autorisationRepository.findByMedecinAutoriseAndPatientAndActifTrue(medecinAutorise, patient);
        
        if (autorisationExistante.isPresent()) {
            // Si une autorisation existe, mettre à jour sa date d'expiration et son niveau d'accès
            AutorisationAccesPatient autorisation = autorisationExistante.get();
            autorisation.setDateExpiration(dateExpiration);
            autorisation.setNiveauAcces(niveauAcces);
            autorisation.setAccordeParPatient(accordeParPatient);
            return autorisationRepository.save(autorisation);
        } else {
            // Sinon, créer une nouvelle autorisation
            AutorisationAccesPatient autorisation = new AutorisationAccesPatient(
                patient, 
                medecinAccordeur, 
                medecinAutorise, 
                niveauAcces
            );
            autorisation.setDateExpiration(dateExpiration);
            autorisation.setAccordeParPatient(accordeParPatient);
            
            return autorisationRepository.save(autorisation);
        }
    }
    
    /**
     * Révoque une autorisation d'accès par un médecin
     */
    @Transactional
    public void revoquerAutorisation(UUID autorisationId, MedecinEntite medecinDemandeur) {
        Optional<AutorisationAccesPatient> autorisationOpt = autorisationRepository.findById(autorisationId);
        
        if (!autorisationOpt.isPresent()) {
            throw new IllegalArgumentException("Autorisation non trouvée");
        }
        
        AutorisationAccesPatient autorisation = autorisationOpt.get();
        
        // Vérifier que le médecin demandeur est bien celui qui a accordé l'autorisation
        // ou qu'il est le médecin référent du patient
        Patient patient = autorisation.getPatient();
        if (!autorisation.getMedecinAccordeur().equals(medecinDemandeur) && 
            (patient.getMedecinReferent() == null || !patient.getMedecinReferent().equals(medecinDemandeur))) {
            throw new IllegalArgumentException("Vous n'avez pas les droits pour révoquer cette autorisation");
        }
        
        // Désactiver l'autorisation
        autorisation.setActif(false);
        autorisationRepository.save(autorisation);
    }
    
    /**
     * Révoque une autorisation d'accès par un patient
     */
    @Transactional
    public void revoquerAutorisationParPatient(UUID autorisationId, Patient patientDemandeur) {
        Optional<AutorisationAccesPatient> autorisationOpt = autorisationRepository.findById(autorisationId);
        
        if (!autorisationOpt.isPresent()) {
            throw new IllegalArgumentException("Autorisation non trouvée");
        }
        
        AutorisationAccesPatient autorisation = autorisationOpt.get();
        
        // Vérifier que le patient demandeur est bien celui concerné par l'autorisation
        if (autorisation.getPatient().getId() != patientDemandeur.getId()) {
            throw new IllegalArgumentException("Vous n'avez pas les droits pour révoquer cette autorisation");
        }
        
        // Désactiver l'autorisation
        autorisation.setActif(false);
        autorisationRepository.save(autorisation);
    }
    
    /**
     * Révoque l'accès d'un médecin à un patient (utilisé par le contrôleur)
     */
    @Transactional
    public void revoquerAcces(Object demandeur, MedecinEntite medecinCible, Patient patient) {
        // Vérifier si le demandeur peut révoquer l'accès
        if (!peutAccorderAcces(demandeur, patient)) {
            throw new IllegalArgumentException("Vous n'avez pas les droits pour révoquer cet accès");
        }
        
        // Trouver l'autorisation active pour ce médecin et ce patient
        Optional<AutorisationAccesPatient> autorisationOpt = 
                autorisationRepository.findByMedecinAutoriseAndPatientAndActifTrue(medecinCible, patient);
        
        if (!autorisationOpt.isPresent()) {
            throw new IllegalArgumentException("Aucune autorisation active trouvée pour ce médecin et ce patient");
        }
        
        AutorisationAccesPatient autorisation = autorisationOpt.get();
        
        // Désactiver l'autorisation
        autorisation.setActif(false);
        autorisationRepository.save(autorisation);
    }
    
    /**
     * Récupère toutes les autorisations actives pour un patient
     */
    public List<AutorisationAccesPatient> getAutorisationsActives(Patient patient) {
        return autorisationRepository.findByPatientAndActifTrue(patient);
    }
    
    /**
     * Récupère toutes les autorisations accordées par un médecin
     */
    public List<AutorisationAccesPatient> getAutorisationsAccordees(MedecinEntite medecinAccordeur) {
        return autorisationRepository.findByMedecinAccordeurAndActifTrue(medecinAccordeur);
    }
    
    /**
     * Récupère toutes les autorisations reçues par un médecin
     */
    public List<AutorisationAccesPatient> getAutorisationsRecues(MedecinEntite medecinAutorise) {
        return autorisationRepository.findByMedecinAutoriseAndActifTrue(medecinAutorise);
    }
    
    /**
     * Récupère toutes les autorisations concernant un patient
     */
    public List<AutorisationAccesPatient> getMedecinsAvecAcces(Patient patient) {
        return autorisationRepository.findByPatientAndActifTrue(patient);
    }
    
    /**
     * Récupère une autorisation d'accès par son ID
     * @param autorisationId ID de l'autorisation à récupérer
     * @return L'autorisation si elle existe, sinon un Optional vide
     */
    public Optional<AutorisationAccesPatient> getAutorisationById(UUID autorisationId) {
        return autorisationRepository.findById(autorisationId);
    }
    
    /**
     * Vérifie si une autorisation est accordée par le patient lui-même
     */
    public boolean isAutorisationAccordeeParPatient(UUID autorisationId) {
        Optional<AutorisationAccesPatient> autorisationOpt = autorisationRepository.findById(autorisationId);
        return autorisationOpt.isPresent() && autorisationOpt.get().isAccordeParPatient();
    }
    
    /**
     * Accorde un accès à un patient (méthode utilisée par le contrôleur)
     */
    @Transactional
    public AutorisationAccesPatient accorderAcces(Object demandeur, MedecinEntite medecinAutorise, 
                                                 Patient patient, NiveauAcces niveauAcces, 
                                                 LocalDateTime dateExpiration) {
        // Vérifier si le demandeur peut accorder l'accès
        if (!peutAccorderAcces(demandeur, patient)) {
            throw new IllegalArgumentException("Vous n'avez pas les droits pour accorder l'accès à ce patient");
        }
        
        // Si le demandeur est un patient
        if (demandeur instanceof Patient) {
            Patient patientDemandeur = (Patient) demandeur;
            return creerAutorisationParPatient(patientDemandeur, medecinAutorise, niveauAcces, dateExpiration);
        }
        
        // Si le demandeur est un médecin
        if (demandeur instanceof MedecinEntite) {
            MedecinEntite medecinDemandeur = (MedecinEntite) demandeur;
            return creerAutorisation(medecinDemandeur, medecinAutorise, patient, dateExpiration, null);
        }
        
        throw new IllegalArgumentException("Type de demandeur non reconnu");
    }
    
    /**
     * Récupère tous les patients accessibles par un médecin
     */
    public List<Patient> getPatientsAccessibles(MedecinEntite medecin) {
        return autorisationRepository.findPatientsAccessiblesByMedecin(medecin, LocalDateTime.now());
    }
    
    /**
     * Récupère une autorisation active pour un médecin et un patient
     * @param medecin Le médecin autorisé
     * @param patient Le patient concerné
     * @return L'autorisation active si elle existe, sinon un Optional vide
     */
    public Optional<AutorisationAccesPatient> getAutorisationByMedecinAndPatient(MedecinEntite medecin, Patient patient) {
        return autorisationRepository.findByMedecinAutoriseAndPatientAndActifTrue(medecin, patient);
    }
    
    /**
     * Vérifie si le médecin connecté a accès à un patient spécifique
     */
    public boolean verifierAccesMedecinConnecte(int patientId) {
        // Récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (!medecinConnecteOpt.isPresent()) {
            return false;
        }
        
        MedecinEntite medecinConnecte = medecinConnecteOpt.get();
        
        // Récupérer le patient
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            return false;
        }
        
        Patient patient = patientOpt.get();
        
        // Vérifier si le médecin a accès
        return verifierAcces(medecinConnecte, patient);
    }
    
    /**
     * Désactive les autorisations expirées
     * Utilisé par la tâche planifiée
     */
    @Transactional
    public void desactiverAutorisationsExpirees() {
        List<AutorisationAccesPatient> autorisationsExpirees = 
                autorisationRepository.findByActifTrueAndDateExpirationBefore(LocalDateTime.now());
        
        for (AutorisationAccesPatient autorisation : autorisationsExpirees) {
            autorisation.setActif(false);
            autorisationRepository.save(autorisation);
        }
    }
}
