package sn.gestion_hospital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import sn.gestion_hospital.dto.ChercheurCreationDTO;
import sn.gestion_hospital.dto.MedecinCreationDTO;
import sn.gestion_hospital.dto.UserStatusUpdateDTO;
import sn.gestion_hospital.dto.AdminCreationDTO;
import sn.gestion_hospital.service.AdminService;
import sn.gestion_hospital.service.ChercheurService;
import sn.gestion_hospital.service.MedecinService;
import sn.gestion_hospital.service.UserService;
import sn.gestion_hospital.entite.User;
import sn.gestion_hospital.entite.Role;
import sn.gestion_hospital.entite.Medecin;

import org.springframework.security.access.annotation.Secured;

@RequestMapping("/api/admin")
@RestController
public class AdminController 
{
    
    private final MedecinService medecinService;
    private final ChercheurService chercheurService;
    private final AdminService adminService;
    private final UserService userService;

    public AdminController(MedecinService medecinService, ChercheurService chercheurService, AdminService adminService, UserService userService) 
    {
        this.medecinService = medecinService;
        this.chercheurService = chercheurService;
        this.adminService = adminService;
        this.userService = userService;
    }



    @Secured("ROLE_ADMIN")
    @PostMapping("/create-medecins")
    public ResponseEntity<?> createMedecin(@Valid @RequestBody MedecinCreationDTO dto) 
    {
        return ResponseEntity.ok(medecinService.createMedecin(dto));
    }

    @Secured("ROLE_ADMIN")
    @PutMapping("/update-medecins/{id}")
    public ResponseEntity<?> updateMedecin(@Valid @PathVariable Long id, @RequestBody MedecinCreationDTO dto) 
    {
        return ResponseEntity.ok(medecinService.updateMedecin(id, dto));
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/medecins")
    public ResponseEntity<?> getAllMedecins() 
    {
        try 
        {
            List<Medecin> medecins = medecinService.getAllMedecinsActifs();
            return ResponseEntity.ok(medecins);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des médecins: " + e.getMessage());
        }
    }


    @Secured("ROLE_ADMIN")
    @PostMapping("/create-chercheurs")
    public ResponseEntity<?> createChercheur(@Valid @RequestBody ChercheurCreationDTO dto) 
    {
        return ResponseEntity.ok(chercheurService.createChercheur(dto));
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/chercheurs")
    public ResponseEntity<?> getAllChercheurs() 
    {
        try 
        {
            List<User> chercheurs = userService.getUsersByRole(Role.CHERCHEUR);
            return ResponseEntity.ok(chercheurs);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des chercheurs: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @PutMapping("/update-chercheurs/{id}")
    public ResponseEntity<?> updateChercheur(@Valid @PathVariable Long id, @RequestBody ChercheurCreationDTO dto) 
    {
        return ResponseEntity.ok(chercheurService.updateChercheur(id, dto));
    }

    @Secured("ROLE_ADMIN")
    @PostMapping("/create-admins")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminCreationDTO dto) 
    {
        return ResponseEntity.ok(adminService.createAdmin(dto));
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins() 
    {
        try 
        {
            List<User> admins = userService.getUsersByRole(Role.ADMIN);
            return ResponseEntity.ok(admins);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des administrateurs: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @PutMapping("update-admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @Valid @RequestBody AdminCreationDTO dto) 
    {
        return ResponseEntity.ok(adminService.updateAdmin(id, dto));
    }
    

    @Secured("ROLE_ADMIN")
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() 
    {
        try 
        {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/users/inactifs")
    public ResponseEntity<?> getUsersInactifs() 
    {
        try 
        {
            List<User> users = userService.getUsersByStatus(false);
            return ResponseEntity.ok(users);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs inactifs: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/users/actifs")
    public ResponseEntity<?> getUsersActifs() 
    {
        try 
        {
            List<User> users = userService.getUsersByStatus(true);
            return ResponseEntity.ok(users);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des utilisateurs actifs: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/users/{userId}/status")
    public ResponseEntity<?> checkUserStatus(@PathVariable Long userId) 
    {
        try 
        {
            boolean isActive = userService.isUserActive(userId);
            return ResponseEntity.ok(isActive);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la vérification du statut: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @PutMapping("/users/status")
    public ResponseEntity<?> updateUserStatus(@Valid @RequestBody UserStatusUpdateDTO dto) 
    {
        try 
        {
            User updatedUser = userService.updateUserStatus(dto);
            return ResponseEntity.ok(updatedUser);
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du statut: " + e.getMessage());
        }
    }

    @Secured("ROLE_ADMIN")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) 
    {
        try 
        {
            userService.deleteUser(userId);
            return ResponseEntity.ok("Utilisateur supprimé avec succès");
        } 
        catch (Exception e) 
        {
            return ResponseEntity.badRequest().body("Erreur lors de la suppression de l'utilisateur: " + e.getMessage());
        }
    }
}
