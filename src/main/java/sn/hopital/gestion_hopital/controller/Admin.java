package sn.hopital.gestion_hopital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import sn.hopital.gestion_hopital.dto.AdminCreationDTO;
import sn.hopital.gestion_hopital.dto.ChercheurCreationDTO;
import sn.hopital.gestion_hopital.dto.MedecinCreationDTO;
import sn.hopital.gestion_hopital.dto.UserStatusUpdateDTO;
import sn.hopital.gestion_hopital.service.AdminService;
import sn.hopital.gestion_hopital.service.ChercheurService;
import sn.hopital.gestion_hopital.service.MedecinService;
import sn.hopital.gestion_hopital.service.UtilisateurService;
import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.entite.Role;

import org.springframework.security.access.annotation.Secured;

@Tag(name = "Administration", description = "API d'administration pour la gestion des utilisateurs")
@RequestMapping("/api/admin")
@RestController
public class Admin {
    
    private final MedecinService medecinService;
    private final ChercheurService chercheurService;
    private final AdminService adminService;
    private final UtilisateurService utilisateurService;

    public Admin(MedecinService medecinService, ChercheurService chercheurService, AdminService adminService, UtilisateurService utilisateurService) {
        this.medecinService = medecinService;
        this.chercheurService = chercheurService;
        this.adminService = adminService;
        this.utilisateurService = utilisateurService;
    }

    @Operation(summary = "Créer un nouveau médecin")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Médecin créé avec succès",
                content = @Content(schema = @Schema(implementation = MedecinCreationDTO.class))),
        @ApiResponse(responseCode = "400",
                description = "Email déjà utilisé ou données invalides"),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @PostMapping("/medecins")
    public ResponseEntity<?> createMedecin(@Valid @RequestBody MedecinCreationDTO dto) {
        return ResponseEntity.ok(medecinService.createMedecin(dto));
    }

    @Operation(summary = "Créer un nouveau chercheur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Chercheur créé avec succès",
                content = @Content(schema = @Schema(implementation = ChercheurCreationDTO.class))),
        @ApiResponse(responseCode = "400",
                description = "Email déjà utilisé ou données invalides"),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @PostMapping("/chercheurs")
    public ResponseEntity<?> createChercheur(@Valid @RequestBody ChercheurCreationDTO dto) {
        return ResponseEntity.ok(chercheurService.createChercheur(dto));
    }

    @Operation(summary = "Créer un nouvel administrateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Administrateur créé avec succès",
                content = @Content(schema = @Schema(implementation = AdminCreationDTO.class))),
        @ApiResponse(responseCode = "400",
                description = "Email déjà utilisé ou données invalides"),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminCreationDTO dto) {
        return ResponseEntity.ok(adminService.createAdmin(dto));
    }

    @Operation(summary = "Récupérer tous les utilisateurs", description = "Permet à l'administrateur de récupérer la liste de tous les utilisateurs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Liste des utilisateurs récupérée avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = utilisateurService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs: " + e.getMessage());
        }
    }

    @Operation(summary = "Récupérer les médecins", description = "Permet à l'administrateur de récupérer la liste de tous les médecins")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Liste des médecins récupérée avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/medecins")
    public ResponseEntity<?> getAllMedecins() {
        try {
            List<User> medecins = utilisateurService.getUsersByRole(Role.MEDECIN);
            return ResponseEntity.ok(medecins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des médecins: " + e.getMessage());
        }
    }

    @Operation(summary = "Récupérer les chercheurs", description = "Permet à l'administrateur de récupérer la liste de tous les chercheurs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Liste des chercheurs récupérée avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/chercheurs")
    public ResponseEntity<?> getAllChercheurs() {
        try {
            List<User> chercheurs = utilisateurService.getUsersByRole(Role.CHERCHEUR);
            return ResponseEntity.ok(chercheurs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des chercheurs: " + e.getMessage());
        }
    }

    @Operation(summary = "Récupérer les administrateurs", description = "Permet à l'administrateur de récupérer la liste de tous les administrateurs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Liste des administrateurs récupérée avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() {
        try {
            List<User> admins = utilisateurService.getUsersByRole(Role.ADMIN);
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des administrateurs: " + e.getMessage());
        }
    }

    @Operation(summary = "Récupérer les utilisateurs inactifs", description = "Permet à l'administrateur de récupérer la liste des utilisateurs inactifs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Liste des utilisateurs inactifs récupérée avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/users/inactifs")
    public ResponseEntity<?> getUsersInactifs() {
        try {
            List<User> users = utilisateurService.getUsersByStatus(false);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs inactifs: " + e.getMessage());
        }
    }

    @Operation(summary = "Vérifier si un utilisateur est actif", description = "Permet à l'administrateur de vérifier le statut d'un utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Statut de l'utilisateur récupéré avec succès",
                content = @Content(schema = @Schema(implementation = Boolean.class))),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @GetMapping("/users/{userId}/status")
    public ResponseEntity<?> checkUserStatus(@PathVariable Long userId) {
        try {
            boolean isActive = utilisateurService.isUserActive(userId);
            return ResponseEntity.ok(isActive);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la vérification du statut: " + e.getMessage());
        }
    }

    @Operation(summary = "Mettre à jour le statut d'un utilisateur", description = "Permet à l'administrateur de bloquer/débloquer un utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",
                description = "Statut de l'utilisateur mis à jour avec succès",
                content = @Content(schema = @Schema(implementation = User.class))),
        @ApiResponse(responseCode = "400",
                description = "Utilisateur non trouvé ou erreur lors de la mise à jour"),
        @ApiResponse(responseCode = "403",
                description = "Accès refusé - Réservé aux administrateurs")
    })

    @Secured("ROLE_ADMIN")
    @PutMapping("/users/status")
    public ResponseEntity<?> updateUserStatus(@Valid @RequestBody UserStatusUpdateDTO dto) {
        try {
            User updatedUser = utilisateurService.updateUserStatus(dto);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du statut: " + e.getMessage());
        }
    }
}
