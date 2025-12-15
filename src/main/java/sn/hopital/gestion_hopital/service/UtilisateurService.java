package sn.hopital.gestion_hopital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.hopital.gestion_hopital.dto.UserStatusUpdateDTO;
import sn.hopital.gestion_hopital.entite.User;
import sn.hopital.gestion_hopital.entite.Role;
import sn.hopital.gestion_hopital.entite.AdminEntite;
import sn.hopital.gestion_hopital.entite.ChercheurEntite;
import sn.hopital.gestion_hopital.exception.BusinessException;
import sn.hopital.gestion_hopital.repository.UserRepository;
import sn.hopital.gestion_hopital.repository.AdminRepository;
import sn.hopital.gestion_hopital.repository.ChercheurRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service responsable de la gestion des utilisateurs
 */
@Service
public class UtilisateurService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private ChercheurRepository chercheurRepository;
    
    /**
     * Récupère tous les utilisateurs
     * @return la liste de tous les utilisateurs
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Récupère les utilisateurs par rôle
     * @param role le rôle recherché
     * @return la liste des utilisateurs ayant ce rôle
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        if (role == null) {
            throw new BusinessException("Le rôle est obligatoire");
        }
        return userRepository.findByRoles(role);
    }
    
    /**
     * Récupère les utilisateurs par statut
     * @param actif le statut recherché
     * @return la liste des utilisateurs avec ce statut
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(boolean actif) {
        return userRepository.findByActif(actif);
    }
    
    /**
     * Récupère un utilisateur par son ID
     * @param id l'ID de l'utilisateur
     * @return l'utilisateur ou vide si non trouvé
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        if (id == null) {
            throw new BusinessException("L'ID est obligatoire");
        }
        return userRepository.findById(id);
    }
    
    /**
     * Récupère un utilisateur par son email
     * @param email l'email de l'utilisateur
     * @return l'utilisateur ou vide si non trouvé
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new BusinessException("L'email est obligatoire");
        }
        return userRepository.findByEmail(email);
    }

    /**
     * Met à jour le statut d'un utilisateur
     * @param dto les données de mise à jour
     * @return l'utilisateur mis à jour
     * @throws BusinessException si l'utilisateur n'est pas trouvé
     */
    @Transactional
    public User updateUserStatus(UserStatusUpdateDTO dto) {
        if (dto == null || dto.getUserId() == null) {
            throw new BusinessException("Les données de mise à jour sont invalides");
        }
        
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        User user = userOpt.orElseThrow(() -> 
            new BusinessException("Utilisateur non trouvé avec l'ID: " + dto.getUserId()));
            
        user.setActif(dto.isActif());
        return userRepository.save(user);
    }

    /**
     * Vérifie si un utilisateur est actif
     * @param userId l'ID de l'utilisateur
     * @return true si l'utilisateur est actif, false sinon
     */
    @Transactional(readOnly = true)
    public boolean isUserActive(Long userId) {
        if (userId == null) {
            throw new BusinessException("L'ID est obligatoire");
        }
        return userRepository.findById(userId)
            .map(User::isActif)
            .orElseThrow(() -> new BusinessException("Utilisateur non trouvé avec l'ID: " + userId));
    }

    /**
     * Récupère un administrateur par son ID
     * @param id l'ID de l'administrateur
     * @return l'administrateur ou vide si non trouvé
     */
    @Transactional(readOnly = true)
    public Optional<AdminEntite> getAdminById(Long id) {
        if (id == null) {
            throw new BusinessException("L'ID est obligatoire");
        }
        return adminRepository.findById(id);
    }

    /**
     * Récupère un chercheur par son ID
     * @param id l'ID du chercheur
     * @return le chercheur ou vide si non trouvé
     */
    @Transactional(readOnly = true)
    public Optional<ChercheurEntite> getChercheurById(Long id) {
        if (id == null) {
            throw new BusinessException("L'ID est obligatoire");
        }
        return chercheurRepository.findById(id);
    }
}
