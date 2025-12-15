package sn.hopital.gestion_hopital.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.RendezVous;
import sn.hopital.gestion_hopital.entite.RendezVous.StatutRendezVous;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.repository.RendezVousRepository;

/**
 * Service pour la gestion des rendez-vous
 */
@Service
public class RendezVousService {

    @Autowired
    private RendezVousRepository rendezVousRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private MedecinService medecinService;
    
    @Autowired
    private AutorisationService autorisationService;
    
    /**
     * Crée un nouveau rendez-vous
     */
    @Transactional
    public RendezVous creerRendezVous(Patient patient, MedecinEntite medecin, 
                                     LocalDateTime dateHeure, int duree, String motif) {
        // Vérifier si le médecin a accès au patient
        if (!autorisationService.verifierAcces(medecin, patient) && !medecin.equals(patient.getMedecinReferent())) {
            throw new IllegalArgumentException("Le médecin n'a pas accès à ce patient");
        }
        
        // Vérifier s'il y a un conflit d'horaire pour le médecin
        LocalDateTime fin = dateHeure.plusMinutes(duree);
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        
        if (rendezVousRepository.existsConflictForMedecin(medecin, null, dateHeure, fin, statutsActifs)) {
            throw new IllegalArgumentException("Il existe déjà un rendez-vous à cette heure pour ce médecin");
        }
        
        // Créer le rendez-vous
        RendezVous rendezVous = new RendezVous(patient, medecin, dateHeure, duree, motif);
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Annule un rendez-vous
     */
    @Transactional
    public RendezVous annulerRendezVous(UUID rendezVousId) {
        RendezVous rendezVous = getRendezVousById(rendezVousId)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous non trouvé"));
        
        rendezVous.annuler();
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Reporte un rendez-vous à une nouvelle date
     */
    @Transactional
    public RendezVous reporterRendezVous(UUID rendezVousId, LocalDateTime nouvelleDateHeure) {
        RendezVous rendezVous = getRendezVousById(rendezVousId)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous non trouvé"));
        
        // Vérifier s'il y a un conflit d'horaire pour le médecin à la nouvelle date
        LocalDateTime fin = nouvelleDateHeure.plusMinutes(rendezVous.getDuree());
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        
        if (rendezVousRepository.existsConflictForMedecin(rendezVous.getMedecin(), rendezVous.getId(), 
                                                        nouvelleDateHeure, fin, statutsActifs)) {
            throw new IllegalArgumentException("Il existe déjà un rendez-vous à cette heure pour ce médecin");
        }
        
        rendezVous.reporter(nouvelleDateHeure);
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Confirme un rendez-vous
     */
    @Transactional
    public RendezVous confirmerRendezVous(UUID rendezVousId) {
        RendezVous rendezVous = getRendezVousById(rendezVousId)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous non trouvé"));
        
        rendezVous.confirmer();
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Marque un rendez-vous comme terminé
     */
    @Transactional
    public RendezVous terminerRendezVous(UUID rendezVousId) {
        RendezVous rendezVous = getRendezVousById(rendezVousId)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous non trouvé"));
        
        if (!rendezVous.estPasse()) {
            throw new IllegalStateException("Ce rendez-vous n'est pas encore passé");
        }
        
        rendezVous.mettreAJourStatusSiPasse();
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Marque un patient comme absent à un rendez-vous
     */
    @Transactional
    public RendezVous marquerAbsence(UUID rendezVousId) {
        RendezVous rendezVous = getRendezVousById(rendezVousId)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous non trouvé"));
        
        rendezVous.marquerAbsence();
        return rendezVousRepository.save(rendezVous);
    }
    
    /**
     * Récupère un rendez-vous par son ID
     */
    public Optional<RendezVous> getRendezVousById(UUID id) {
        return rendezVousRepository.findById(id);
    }
    
    /**
     * Récupère tous les rendez-vous d'un patient
     */
    public List<RendezVous> getRendezVousByPatient(Patient patient) {
        return rendezVousRepository.findByPatientOrderByDateHeureDesc(patient);
    }
    
    /**
     * Récupère tous les rendez-vous d'un patient par son ID
     */
    public List<RendezVous> getRendezVousByPatientId(int patientId) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new IllegalArgumentException("Patient non trouvé");
        }
        return getRendezVousByPatient(patientOpt.get());
    }
    
    /**
     * Récupère tous les rendez-vous d'un médecin
     */
    public List<RendezVous> getRendezVousByMedecin(MedecinEntite medecin) {
        return rendezVousRepository.findByMedecinOrderByDateHeureDesc(medecin);
    }
    
    /**
     * Récupère tous les rendez-vous du médecin connecté
     */
    public List<RendezVous> getRendezVousMedecinConnecte() {
        Optional<MedecinEntite> medecinOpt = medecinService.getMedecinConnecte();
        if (!medecinOpt.isPresent()) {
            throw new IllegalStateException("Aucun médecin connecté");
        }
        return getRendezVousByMedecin(medecinOpt.get());
    }
    
    /**
     * Récupère tous les rendez-vous à venir d'un patient
     */
    public List<RendezVous> getRendezVousAVenirByPatient(Patient patient) {
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        return rendezVousRepository.findUpcomingByPatient(patient, LocalDateTime.now(), statutsActifs);
    }
    
    /**
     * Récupère tous les rendez-vous à venir du médecin connecté
     */
    public List<RendezVous> getRendezVousAVenirMedecinConnecte() {
        Optional<MedecinEntite> medecinOpt = medecinService.getMedecinConnecte();
        if (!medecinOpt.isPresent()) {
            throw new IllegalStateException("Aucun médecin connecté");
        }
        
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        return rendezVousRepository.findUpcomingByMedecin(medecinOpt.get(), LocalDateTime.now(), statutsActifs);
    }
    
    /**
     * Récupère les rendez-vous du jour du médecin connecté
     */
    public List<RendezVous> getRendezVousDuJourMedecinConnecte() {
        Optional<MedecinEntite> medecinOpt = medecinService.getMedecinConnecte();
        if (!medecinOpt.isPresent()) {
            throw new IllegalStateException("Aucun médecin connecté");
        }
        
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        return rendezVousRepository.findTodayByMedecin(medecinOpt.get(), statutsActifs);
    }
    
    /**
     * Met à jour les statuts des rendez-vous passés
     * Utilisé par la tâche planifiée
     */
    @Transactional
    public void mettreAJourRendezVousPasses() {
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME);
        List<RendezVous> rendezVousPasses = rendezVousRepository.findPastNotCompleted(LocalDateTime.now(), statutsActifs);
        
        for (RendezVous rendezVous : rendezVousPasses) {
            rendezVous.mettreAJourStatusSiPasse();
            rendezVousRepository.save(rendezVous);
        }
    }
    
    /**
     * Marque une notification comme envoyée
     */
    @Transactional
    public void marquerNotificationEnvoyee(UUID rendezVousId) {
        Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);
        if (rendezVousOpt.isPresent()) {
            RendezVous rendezVous = rendezVousOpt.get();
            rendezVous.setNotificationEnvoyee(true);
            rendezVousRepository.save(rendezVous);
        }
    }
    
    /**
     * Marque un rappel comme envoyé
     */
    @Transactional
    public void marquerRappelEnvoye(UUID rendezVousId) {
        Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);
        if (rendezVousOpt.isPresent()) {
            RendezVous rendezVous = rendezVousOpt.get();
            rendezVous.setRappelEnvoye(true);
            rendezVousRepository.save(rendezVous);
        }
    }
    
    /**
     * Récupère tous les rendez-vous qui nécessitent l'envoi d'une notification
     */
    public List<RendezVous> getRendezVousNecessitantNotification() {
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        return rendezVousRepository.findByNotificationEnvoyeeFalseAndStatutIn(statutsActifs);
    }
    
    /**
     * Récupère tous les rendez-vous qui nécessitent l'envoi d'un rappel
     * (rendez-vous dans les 24 prochaines heures)
     */
    public List<RendezVous> getRendezVousNecessitantRappel() {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime dansUnJour = maintenant.plusDays(1);
        
        List<StatutRendezVous> statutsActifs = Arrays.asList(StatutRendezVous.PLANIFIE, StatutRendezVous.CONFIRME, StatutRendezVous.REPORTE);
        return rendezVousRepository.findNeedingReminder(maintenant, dansUnJour, statutsActifs);
    }
}
