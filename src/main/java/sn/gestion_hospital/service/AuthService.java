package sn.gestion_hospital.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.gestion_hospital.entite.Role;
import sn.gestion_hospital.entite.User;
import sn.gestion_hospital.repository.UserRepository;
import sn.gestion_hospital.security.JwtService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService 
{

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse authenticate(LoginRequest request) 
    {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) 
        {
            return AuthResponse.failed("Email ou mot de passe incorrect");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) 
        {
            return AuthResponse.failed("Email ou mot de passe incorrect");
        }

        Role requestedRole;
        try 
        {
            requestedRole = Role.valueOf(request.getRole());
        } 
        catch (IllegalArgumentException e) 
        {
            return AuthResponse.failed("Rôle invalide");
        }

        if (!user.getRoles().equals(requestedRole)) 
        {
            return AuthResponse.failed("Accès non autorisé pour ce rôle");
        }

        if(!user.isActif())
        {
            return AuthResponse.failed("Accès non autorisé pour ce compte, veuillez contacter l'administrateur");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.success(token, user.getId());
    }

    public AuthResponse logout() 
    {
        return AuthResponse.success("Déconnexion réussie");
    }

    @Data
    public static class LoginRequest 
    {
        private String email;
        private String password;
        private String role;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse 
    {
        private boolean success;
        private String message;
        private String token;
        private Long userId;

        public static AuthResponse success(String token, Long userId) 
        {
            return new AuthResponse(true, "Authentification réussie", token, userId);
        }

        public static AuthResponse success(String message) 
        {
            return new AuthResponse(true, message, null, null);
        }

        public static AuthResponse failed(String message) 
        {
            return new AuthResponse(false, message, null, null);
        }
    }
}
