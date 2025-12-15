package sn.hopital.gestion_hopital.security;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import java.util.Map;

import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.repository.UserRepository;
import sn.hopital.gestion_hopital.entite.Role;


@Tag(name = "Authentification", description = "API d'authentification et de vérification des rôles")
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
@RestController
@RequestMapping({"/", "/api"})
@RequiredArgsConstructor
public class AuthController
{

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    // Ajouter repository pour les patients
    private final sn.hopital.gestion_hopital.repository.PatientRepository patientRepository;

    @Operation(
            summary = "Authentifier un utilisateur",
            description = "Permet à un utilisateur de se connecter avec son email et mot de passe"
    )
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200",
                    description = "Authentification réussie",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400",
                    description = "Échec de l'authentification ou utilisateur non trouvé")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request)
    {
        try
        {
            System.out.println("Tentative de connexion pour: " + request.getEmail() + ", rôle demandé: " + request.getRole());
            
            // Cas spécial pour les patients - vérifier d'abord s'ils existent dans la table Patient
            if ("PATIENT".equals(request.getRole())) {
                // Vérifier si ce patient existe dans la table Patient
                boolean patientExists = patientRepository.existsByEmail(request.getEmail());
                
                if (patientExists) {
                    System.out.println("Patient trouvé dans la table Patient: " + request.getEmail());
                    
                    try {
                        // Tenter l'authentification
                        Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                        );
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        // Générer un token pour le patient
                        String token = jwtService.generateToken(request.getEmail(), "PATIENT");
                        System.out.println("Token généré pour le patient avec succès");
                        return ResponseEntity.ok(new LoginResponse("Connexion réussie", token));
                    } catch (AuthenticationException e) {
                        System.out.println("Échec de l'authentification pour le patient: " + e.getMessage());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("success", false, "message", "Identifiants invalides"));
                    }
                }
            }
            
            // Authentification standard
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isPresent())
            {
                User user = userOpt.get();
                System.out.println("Utilisateur trouvé: " + user.getEmail() + ", rôle actuel: " + user.getRoles().name());
                
                // Vérifier que le rôle demandé correspond au rôle de l'utilisateur
                try {
                    Role requestedRole = Role.valueOf(request.getRole());
                    System.out.println("Comparaison des rôles - Demandé: " + requestedRole + ", Actuel: " + user.getRoles());
                    
                    boolean roleAuthorized = false;
                    
                    // Si le rôle demandé correspond au rôle de l'utilisateur
                    if (user.getRoles().equals(requestedRole)) {
                        roleAuthorized = true;
                        System.out.println("Rôles correspondent directement");
                    } 
                    // Cas spécial: un médecin qui essaie de se connecter en tant que patient
                    else if (requestedRole == Role.PATIENT && user.getRoles() == Role.MEDECIN) {
                        // Vérifier si ce médecin existe aussi comme patient dans la table Patient
                        boolean patientExists = patientRepository.existsByEmail(user.getEmail());
                        
                        if (patientExists) {
                            roleAuthorized = true;
                            System.out.println("Médecin autorisé à se connecter en tant que patient");
                        } else {
                            System.out.println("Cet utilisateur est un médecin mais n'est pas enregistré comme patient");
                        }
                    }
                    
                    if (!roleAuthorized) {
                        System.out.println("Accès refusé: les rôles ne correspondent pas");
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("success", false, "message", "Accès non autorisé pour ce rôle"));
                    }
                    
                    System.out.println("Accès autorisé, génération du token...");
                } catch (IllegalArgumentException e) {
                    System.out.println("Rôle invalide: " + request.getRole());
                    return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "Rôle invalide"));
                }
                
                String token = jwtService.generateToken(user.getEmail(), user.getRoles().name());
                System.out.println("Token généré avec succès");
                return ResponseEntity.ok(new LoginResponse("Connexion réussie", token));
            }
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }
        catch (AuthenticationException e)
        {
            return ResponseEntity.badRequest().body("Échec de l'authentification");
        }
    }

    @Operation(summary = "Point d'accès Admin",
            description = "Endpoint de test pour vérifier l'accès administrateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200", description = "Accès autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - Réservé aux administrateurs")
    })

    @GetMapping("/admin")
    public ResponseEntity<String> adminEndpoint()
    {
        return ResponseEntity.ok("Accès admin autorisé");
    }

    @Operation(summary = "Point d'accès Docteur",
            description = "Endpoint de test pour vérifier l'accès docteur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200", description = "Accès autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - Réservé aux docteurs")
    })

    @GetMapping("/medecin")
    public ResponseEntity<String> docteurEndpoint()
    {
        return ResponseEntity.ok("Accès medecin autorisé");
    }

    @Operation(summary = "Point d'accès Chercheur",
            description = "Endpoint de test pour vérifier l'accès chercheur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200", description = "Accès autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - Réservé aux chercheurs")
    })
    
    @GetMapping("/chercheur")
    public ResponseEntity<String> chercheurEndpoint()
    {
        return ResponseEntity.ok("Accès chercheur autorisé");
    }

    @Operation(summary = "Point d'accès Patient",
            description = "Endpoint de test pour vérifier l'accès patient")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200", description = "Accès autorisé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - Réservé aux chercheurs")
    })
    
    @GetMapping("/check-role/patient")
    public ResponseEntity<String> patientEndpoint()
    {
        return ResponseEntity.ok("Accès patient autorisé");
    }
    
    /**
     * Endpoint pour vérifier si un email correspond à un patient existant
     * Cet endpoint est utilisé lors de la connexion pour vérifier si un patient existe
     * même s'il n'a pas d'entrée dans la table User
     */
    @Operation(summary = "Vérifier si un email correspond à un patient",
            description = "Permet de vérifier si un email appartient à un patient enregistré")
    @GetMapping("/patient/check-email")
    public ResponseEntity<?> checkPatientEmail(@RequestParam String email) {
        boolean patientExists = patientRepository.existsByEmail(email);
        
        if (patientExists) {
            return ResponseEntity.ok(Map.of(
                "exists", true,
                "message", "Un patient est enregistré avec cet email",
                "email", email
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "exists", false,
                        "message", "Aucun patient trouvé avec cet email",
                        "email", email
                    ));
        }
    }

    @Operation(summary = "Déconnexion",
            description = "Permet à un utilisateur de se déconnecter")
    @ApiResponses(value =
    {
            @ApiResponse(responseCode = "200",
                    description = "Déconnexion réussie"),
            @ApiResponse(responseCode = "401",
                    description = "Non autorisé")
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader)
    {
        try
        {
            if (authHeader != null && authHeader.startsWith("Bearer "))
            {
                SecurityContextHolder.clearContext();
                return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token non fourni"));
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur lors de la déconnexion"));
        }
    }

    @Schema(description = "Requête de connexion")
    @lombok.Data
    public static class LoginRequest
    {
        @Schema(description = "Email de l'utilisateur", example = "user@hopital.sn", required = true)
        private String email;

        @Schema(description = "Mot de passe de l'utilisateur", example = "password123", required = true)
        private String password;

        @Schema(description = "Rôle de l'utilisateur", example = "ADMIN", required = true)
        private String role;

        // Getters et setters
        public String getEmail()
        {
            return email;
        }

        public void setEmail(String email) 
        { 
            this.email = email; 
        }
    
        public String getPassword() 
        { 
            return password; 
        }

        public void setPassword(String password) 
        { 
            this.password = password; 
        }

        public String getRole() 
        { 
            return role;
        }
    
        public void setRole(String role) 
        { 
            this.role = role;
        }
    }

    @Schema(description = "Réponse de connexion")
    @lombok.Data
    private static class LoginResponse
    {
        @Schema(description = "Message de confirmation", example = "Authentification réussie")
        private String message;

        @Schema(description = "Token JWT")
        private String token;

        public LoginResponse(String message, String token)
        {
            this.message = message;
            this.token = token;
        }
    }
}
