package sn.hopital.gestion_hopital.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient;
import sn.hopital.gestion_hopital.entite.AutorisationAccesPatient.NiveauAcces;
import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.service.AutorisationService;
import sn.hopital.gestion_hopital.service.MedecinService;

/**
 * Contrôleur pour la gestion des autorisations d'accès aux patients
 */
@RestController
@RequestMapping("/api/autorisations")
@Tag(name = "Gestion des autorisations", description = "API pour la gestion des autorisations d'accès aux patients")
public class AutorisationController 
{

    @Autowired
    private AutorisationService autorisationService;
    
    @Autowired
    private MedecinService medecinService;
    
    @Autowired
    private PatientRepository patientRepository;
    
    /**
     * DTO pour la création d'une autorisation d'accès
     */
    @Data
    public static class AutorisationRequest {
        @NotNull(message = "L'ID du médecin autorisé est obligatoire")
        private Long medecinAutoriseId;
        
        @NotNull(message = "Le niveau d'accès est obligatoire")
        private NiveauAcces niveauAcces;
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime dateExpiration;
    }
    
    /**
     * DTO pour la réponse d'une autorisation
     */
    @Data
    public static class AutorisationResponse {
        private UUID id;
        private Long medecinAutoriseId;
        private String medecinAutoriseNom;
        private Long medecinAccordeurId;
        private String medecinAccordeurNom;
        private NiveauAcces niveauAcces;
        private LocalDateTime dateCreation;
        private LocalDateTime dateExpiration;
        
        public AutorisationResponse(AutorisationAccesPatient autorisation) {
            this.id = autorisation.getId();
            this.medecinAutoriseId = autorisation.getMedecinAutorise().getId();
            this.medecinAutoriseNom = autorisation.getMedecinAutorise().getNom() + " " + 
                                     autorisation.getMedecinAutorise().getPrenom();
            this.medecinAccordeurId = autorisation.getMedecinAccordeur().getId();
            this.medecinAccordeurNom = autorisation.getMedecinAccordeur().getNom() + " " + 
                                      autorisation.getMedecinAccordeur().getPrenom();
            this.niveauAcces = autorisation.getNiveauAcces();
            this.dateCreation = autorisation.getDateCreation();
            this.dateExpiration = autorisation.getDateExpiration();
        }
    }
    
    /**
     * Accorde une autorisation d'accès à un patient
     */
    @Operation(summary = "Accorder l'accès à un patient", 
              description = "Permet à un médecin ou à un patient d'accorder l'accès à un médecin pour un dossier patient spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Autorisation accordée avec succès"),
        @ApiResponse(responseCode = "400", description = "Requête invalide"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Vous n'avez pas les droits pour accorder cet accès"),
        @ApiResponse(responseCode = "404", description = "Médecin ou patient non trouvé")
    })
    @Secured({"ROLE_MEDECIN", "ROLE_PATIENT"})
    @PostMapping("/patients/{patientId}/accorder")
    public ResponseEntity<?> accorderAcces(
            @PathVariable int patientId,
            @Valid @RequestBody AutorisationRequest request) {
        
        // Récupérer le patient concerné
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Patient patient = patientOpt.get();
        
        // Récupérer le médecin à autoriser
        Optional<MedecinEntite> medecinAutoriseOpt = medecinService.getMedecinById(request.getMedecinAutoriseId());
        if (!medecinAutoriseOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Médecin à autoriser non trouvé");
        }
        
        MedecinEntite medecinAutorise = medecinAutoriseOpt.get();
        
        // Déterminer si le demandeur est un médecin ou un patient
        Object demandeur = null;
        
        // Tenter de récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (medecinConnecteOpt.isPresent()) {
            MedecinEntite medecinConnecte = medecinConnecteOpt.get();
            
            // Ne pas permettre d'accorder l'accès à soi-même si on est médecin
            if (medecinConnecte.equals(medecinAutorise)) {
                return ResponseEntity.badRequest().body("Vous ne pouvez pas vous accorder l'accès à vous-même");
            }
            
            demandeur = medecinConnecte;
        } else {
            // Si ce n'est pas un médecin, vérifier si c'est le patient lui-même
            // Récupérer l'email de l'utilisateur connecté depuis le contexte de sécurité
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = null;
            
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }
            
            // Vérifier si c'est le patient concerné
            if (patient.getEmail().equals(email)) {
                demandeur = patient;
            }
        }
        
        // Si aucun demandeur valide n'a été trouvé
        if (demandeur == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous n'êtes pas autorisé à effectuer cette action");
        }
        
        // Vérifier que le demandeur peut accorder l'accès
        if (!autorisationService.peutAccorderAcces(demandeur, patient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous n'avez pas les droits pour accorder l'accès à ce patient");
        }
        
        try {
            // Accorder l'accès
            AutorisationAccesPatient autorisation = autorisationService.accorderAcces(
                    demandeur, medecinAutorise, patient, 
                    request.getNiveauAcces(), request.getDateExpiration());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new AutorisationResponse(autorisation));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'attribution de l'accès: " + e.getMessage());
        }
    }
    
    /**
     * Révoque une autorisation d'accès à un patient
     */
    @Operation(summary = "Révoquer l'accès à un patient", 
              description = "Permet à un médecin ou à un patient de révoquer l'accès d'un médecin pour un patient spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autorisation révoquée avec succès"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Vous n'avez pas les droits pour révoquer cet accès"),
        @ApiResponse(responseCode = "404", description = "Médecin, patient ou autorisation non trouvé")
    })
    @Secured({"ROLE_MEDECIN", "ROLE_PATIENT"})
    @DeleteMapping("/patients/{patientId}/medecins/{medecinId}")
    public ResponseEntity<?> revoquerAcces(
            @PathVariable int patientId,
            @PathVariable Long medecinId) {
        
        // Récupérer le patient concerné
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Patient patient = patientOpt.get();
        
        // Récupérer le médecin à révoquer
        Optional<MedecinEntite> medecinCibleOpt = medecinService.getMedecinById(medecinId);
        if (!medecinCibleOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        MedecinEntite medecinCible = medecinCibleOpt.get();
        
        // Déterminer si le demandeur est un médecin ou un patient
        Object demandeur = null;
        
        // Tenter de récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (medecinConnecteOpt.isPresent()) {
            demandeur = medecinConnecteOpt.get();
        } else {
            // Si ce n'est pas un médecin, vérifier si c'est le patient lui-même
            // Récupérer l'email de l'utilisateur connecté depuis le contexte de sécurité
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = null;
            
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }
            
            // Vérifier si c'est le patient concerné
            if (patient.getEmail().equals(email)) {
                demandeur = patient;
            }
        }
        
        // Si aucun demandeur valide n'a été trouvé
        if (demandeur == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous n'êtes pas autorisé à effectuer cette action");
        }
        
        try {
            // Révoquer l'accès
            autorisationService.revoquerAcces(demandeur, medecinCible, patient);
            return ResponseEntity.ok().body("Accès révoqué avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la révocation de l'accès: " + e.getMessage());
        }
    }
    
    /**
     * Révoque une autorisation d'accès par son ID UUID
     */
    @Operation(summary = "Révoquer l'accès par ID d'autorisation", 
              description = "Permet à un médecin ou à un patient de révoquer un accès spécifique par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autorisation révoquée avec succès"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Vous n'avez pas les droits pour révoquer cet accès"),
        @ApiResponse(responseCode = "404", description = "Autorisation non trouvée")
    })
    @Secured({"ROLE_MEDECIN", "ROLE_PATIENT"})
    @DeleteMapping("/acces/{autorisationId}")
    public ResponseEntity<?> revoquerAccesParId(@PathVariable UUID autorisationId) {
        // Récupérer l'autorisation
        Optional<AutorisationAccesPatient> autorisationOpt = autorisationService.getAutorisationById(autorisationId);
        if (!autorisationOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        AutorisationAccesPatient autorisation = autorisationOpt.get();
        Patient patient = autorisation.getPatient();
        MedecinEntite medecinCible = autorisation.getMedecinAutorise();
        
        // Déterminer si le demandeur est un médecin ou un patient
        Object demandeur = null;
        
        // Tenter de récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (medecinConnecteOpt.isPresent()) {
            demandeur = medecinConnecteOpt.get();
        } else {
            // Si ce n'est pas un médecin, vérifier si c'est le patient lui-même
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = null;
            
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }
            
            // Vérifier si c'est le patient concerné
            if (patient.getEmail().equals(email)) {
                demandeur = patient;
            }
        }
        
        // Si aucun demandeur valide n'a été trouvé
        if (demandeur == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous n'êtes pas autorisé à effectuer cette action");
        }
        
        try {
            // Révoquer l'accès
            autorisationService.revoquerAcces(demandeur, medecinCible, patient);
            return ResponseEntity.ok().body("Accès révoqué avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la révocation de l'accès: " + e.getMessage());
        }
    }
    
    /**
     * Liste les médecins ayant accès à un patient
     */
    @Operation(summary = "Lister les médecins ayant accès à un patient", 
              description = "Récupère la liste des médecins ayant accès à un patient spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Le médecin n'a pas les droits pour voir ces informations"),
        @ApiResponse(responseCode = "404", description = "Patient non trouvé")
    })
    @Secured("ROLE_MEDECIN")
    @GetMapping("/patients/{patientId}/medecins")
    public ResponseEntity<?> listerMedecinsAvecAcces(@PathVariable int patientId) {
        // Récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (!medecinConnecteOpt.isPresent()) 
        {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non authentifié");
        }
        
        MedecinEntite medecinConnecte = medecinConnecteOpt.get();
        
        // Récupérer le patient
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) 
        {
            return ResponseEntity.notFound().build();
        }
        
        Patient patient = patientOpt.get();
        
        // Vérifier que le médecin connecté peut voir ces informations
        if (!autorisationService.peutAccorderAcces(medecinConnecte, patient)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous n'avez pas les droits pour voir ces informations");
        }
        
        // Récupérer les autorisations
        List<AutorisationAccesPatient> autorisations = autorisationService.getMedecinsAvecAcces(patient);
        
        // Convertir en DTO
        List<AutorisationResponse> responses = autorisations.stream()
                .map(AutorisationResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Liste les patients accessibles par le médecin connecté
     */
    @Operation(summary = "Lister les patients accessibles", 
              description = "Récupère la liste des patients auxquels le médecin connecté a accès")
    @Secured("ROLE_MEDECIN")
    @GetMapping("/patients-accessibles")
    public ResponseEntity<?> listerPatientsAccessibles() {
        // Récupérer le médecin connecté
        Optional<MedecinEntite> medecinConnecteOpt = medecinService.getMedecinConnecte();
        if (!medecinConnecteOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non authentifié");
        }
        
        MedecinEntite medecinConnecte = medecinConnecteOpt.get();
        
        // Récupérer les patients accessibles
        List<Patient> patients = autorisationService.getPatientsAccessibles(medecinConnecte);
        
        return ResponseEntity.ok(patients);
    }
}
