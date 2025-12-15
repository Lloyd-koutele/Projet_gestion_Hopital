package sn.hopital.gestion_hopital.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import sn.hopital.gestion_hopital.dto.RendezVousDTO;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.entite.RendezVous;
import sn.hopital.gestion_hopital.entite.RendezVous.StatutRendezVous;
import sn.hopital.gestion_hopital.service.MedecinService;
import sn.hopital.gestion_hopital.service.PatientService;
import sn.hopital.gestion_hopital.service.RendezVousService;

/**
 * Contrôleur REST pour la gestion des rendez-vous
 */
@RestController
@RequestMapping("/api/rendez-vous")
public class RendezVousController {

    @Autowired
    private RendezVousService rendezVousService;
    
    @Autowired
    private MedecinService medecinService;
    
    @Autowired
    private PatientService patientService;
    
    /**
     * DTO pour la création ou la mise à jour d'un rendez-vous
     */
    public static class RendezVousCreationDTO {
        private int patientId;
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime dateHeure;
        
        private int duree = 30;
        private String motif;
        private String notes;
        
        // Getters et setters
        public int getPatientId() { return patientId; }
        public void setPatientId(int patientId) { this.patientId = patientId; }
        
        public LocalDateTime getDateHeure() { return dateHeure; }
        public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }
        
        public int getDuree() { return duree; }
        public void setDuree(int duree) { this.duree = duree; }
        
        public String getMotif() { return motif; }
        public void setMotif(String motif) { this.motif = motif; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    /**
     * DTO pour la mise à jour de la date d'un rendez-vous
     */
    public static class RendezVousReportDTO {
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime nouvelleDateHeure;
        
        // Getters et setters
        public LocalDateTime getNouvelleDateHeure() { return nouvelleDateHeure; }
        public void setNouvelleDateHeure(LocalDateTime nouvelleDateHeure) { this.nouvelleDateHeure = nouvelleDateHeure; }
    }
    
    /**
     * Wrapper de réponse pour les API
     */
    public static class RendezVousApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
        
        public RendezVousApiResponse(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }
    
    /**
     * Crée un nouveau rendez-vous pour le médecin connecté
     */
    @Operation(summary = "Créer un rendez-vous", description = "Crée un nouveau rendez-vous entre le médecin connecté et un patient")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rendez-vous créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @Secured("ROLE_MEDECIN")
    @PostMapping
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> creerRendezVous(@Valid @RequestBody RendezVousCreationDTO dto) {
        try {
            // Récupérer le médecin connecté
            Optional<MedecinEntite> medecinOpt = medecinService.getMedecinConnecte();
            if (!medecinOpt.isPresent()) {
                return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, "Médecin non connecté", null));
            }
            
            // Récupérer le patient
            Optional<Patient> patientOpt = patientService.getPatientById(dto.getPatientId());
            if (!patientOpt.isPresent()) {
                return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, "Patient non trouvé", null));
            }
            
            // Créer le rendez-vous
            RendezVous rendezVous = rendezVousService.creerRendezVous(
                patientOpt.get(), 
                medecinOpt.get(), 
                dto.getDateHeure(), 
                dto.getDuree(), 
                dto.getMotif()
            );
            
            // Ajouter les notes si présentes
            if (dto.getNotes() != null && !dto.getNotes().isEmpty()) {
                rendezVous.setNotes(dto.getNotes());
                rendezVous = rendezVousService.getRendezVousById(rendezVous.getId()).get();
            }
            
            // Convertir en DTO et retourner
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous créé avec succès", rendezVousDTO));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Récupère tous les rendez-vous du médecin connecté
     */
    @Operation(summary = "Récupérer tous les rendez-vous", description = "Récupère tous les rendez-vous du médecin connecté")
    @Secured("ROLE_MEDECIN")
    @GetMapping
    public ResponseEntity<RendezVousApiResponse<List<RendezVousDTO>>> getMesRendezVous() {
        try {
            List<RendezVous> rendezVous = rendezVousService.getRendezVousMedecinConnecte();
            List<RendezVousDTO> rendezVousDTO = rendezVous.stream()
                .map(this::convertToDTO)
                .toList();
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous récupérés avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Récupère tous les rendez-vous à venir du médecin connecté
     */
    @Operation(summary = "Récupérer les rendez-vous à venir", description = "Récupère tous les rendez-vous à venir du médecin connecté")
    @Secured("ROLE_MEDECIN")
    @GetMapping("/a-venir")
    public ResponseEntity<RendezVousApiResponse<List<RendezVousDTO>>> getRendezVousAVenir() {
        try {
            List<RendezVous> rendezVous = rendezVousService.getRendezVousAVenirMedecinConnecte();
            List<RendezVousDTO> rendezVousDTO = rendezVous.stream()
                .map(this::convertToDTO)
                .toList();
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous récupérés avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Récupère tous les rendez-vous du jour du médecin connecté
     */
    @Operation(summary = "Récupérer les rendez-vous du jour", description = "Récupère tous les rendez-vous du jour du médecin connecté")
    @Secured("ROLE_MEDECIN")
    @GetMapping("/aujourd-hui")
    public ResponseEntity<RendezVousApiResponse<List<RendezVousDTO>>> getRendezVousDuJour() {
        try {
            List<RendezVous> rendezVous = rendezVousService.getRendezVousDuJourMedecinConnecte();
            List<RendezVousDTO> rendezVousDTO = rendezVous.stream()
                .map(this::convertToDTO)
                .toList();
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous récupérés avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Récupère tous les rendez-vous d'un patient (pour le médecin connecté)
     */
    @Operation(summary = "Récupérer les rendez-vous d'un patient", description = "Récupère tous les rendez-vous d'un patient")
    @Secured("ROLE_MEDECIN")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<RendezVousApiResponse<List<RendezVousDTO>>> getRendezVousByPatient(@PathVariable int patientId) {
        try {
            List<RendezVous> rendezVous = rendezVousService.getRendezVousByPatientId(patientId);
            List<RendezVousDTO> rendezVousDTO = rendezVous.stream()
                .map(this::convertToDTO)
                .toList();
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous récupérés avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Récupère un rendez-vous par son ID
     */
    @Operation(summary = "Récupérer un rendez-vous", description = "Récupère un rendez-vous par son ID")
    @Secured({"ROLE_MEDECIN", "ROLE_PATIENT"})
    @GetMapping("/{id}")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> getRendezVousById(@PathVariable UUID id) {
        Optional<RendezVous> rendezVousOpt = rendezVousService.getRendezVousById(id);
        
        if (!rendezVousOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        RendezVous rendezVous = rendezVousOpt.get();
        RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
        
        return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous récupéré avec succès", rendezVousDTO));
    }
    
    /**
     * Annule un rendez-vous
     */
    @Operation(summary = "Annuler un rendez-vous", description = "Annule un rendez-vous existant")
    @Secured({"ROLE_MEDECIN", "ROLE_PATIENT"})
    @PostMapping("/{id}/annuler")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> annulerRendezVous(@PathVariable UUID id) {
        try {
            RendezVous rendezVous = rendezVousService.annulerRendezVous(id);
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous annulé avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Reporte un rendez-vous à une nouvelle date
     */
    @Operation(summary = "Reporter un rendez-vous", description = "Reporte un rendez-vous à une nouvelle date")
    @Secured("ROLE_MEDECIN")
    @PostMapping("/{id}/reporter")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> reporterRendezVous(
            @PathVariable UUID id, 
            @Valid @RequestBody RendezVousReportDTO dto) {
        try {
            RendezVous rendezVous = rendezVousService.reporterRendezVous(id, dto.getNouvelleDateHeure());
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous reporté avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Confirme un rendez-vous
     */
    @Operation(summary = "Confirmer un rendez-vous", description = "Confirme un rendez-vous existant")
    @Secured("ROLE_MEDECIN")
    @PostMapping("/{id}/confirmer")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> confirmerRendezVous(@PathVariable UUID id) {
        try {
            RendezVous rendezVous = rendezVousService.confirmerRendezVous(id);
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous confirmé avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Marque un rendez-vous comme terminé
     */
    @Operation(summary = "Terminer un rendez-vous", description = "Marque un rendez-vous comme terminé")
    @Secured("ROLE_MEDECIN")
    @PostMapping("/{id}/terminer")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> terminerRendezVous(@PathVariable UUID id) {
        try {
            RendezVous rendezVous = rendezVousService.terminerRendezVous(id);
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Rendez-vous terminé avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Marque un patient comme absent à un rendez-vous
     */
    @Operation(summary = "Marquer l'absence d'un patient", description = "Marque un patient comme absent à un rendez-vous")
    @Secured("ROLE_MEDECIN")
    @PostMapping("/{id}/absence")
    public ResponseEntity<RendezVousApiResponse<RendezVousDTO>> marquerAbsence(@PathVariable UUID id) {
        try {
            RendezVous rendezVous = rendezVousService.marquerAbsence(id);
            RendezVousDTO rendezVousDTO = convertToDTO(rendezVous);
            
            return ResponseEntity.ok(new RendezVousApiResponse<>(true, "Absence marquée avec succès", rendezVousDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RendezVousApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * Convertit une entité RendezVous en DTO
     */
    private RendezVousDTO convertToDTO(RendezVous rendezVous) {
        RendezVousDTO dto = new RendezVousDTO();
        dto.setId(rendezVous.getId());
        dto.setPatientId(rendezVous.getPatient().getId());
        dto.setPatientNom(rendezVous.getPatient().getNom());
        dto.setPatientPrenom(rendezVous.getPatient().getPrenom());
        dto.setMedecinId(UUID.fromString(rendezVous.getMedecin().getId().toString()));
        dto.setMedecinNom(rendezVous.getMedecin().getNom());
        dto.setMedecinPrenom(rendezVous.getMedecin().getPrenom());
        dto.setDateHeure(rendezVous.getDateHeure());
        dto.setDuree(rendezVous.getDuree());
        dto.setMotif(rendezVous.getMotif());
        dto.setNotes(rendezVous.getNotes());
        dto.setStatut(rendezVous.getStatut());
        dto.setDateCreation(rendezVous.getDateCreation());
        dto.setDateDerniereModification(rendezVous.getDateDerniereModification());
        return dto;
    }
}
