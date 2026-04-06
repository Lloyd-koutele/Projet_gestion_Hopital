package sn.gestion_hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.gestion_hospital.entite.User;
import sn.gestion_hospital.entite.Role;
import sn.gestion_hospital.dto.UserStatusUpdateDTO;
import sn.gestion_hospital.entite.Admin;
import sn.gestion_hospital.entite.Chercheur;
import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.UserRepository;
import sn.gestion_hospital.repository.AdminRepository;
import sn.gestion_hospital.repository.ChercheurRepository;
import sn.gestion_hospital.repository.MedecinRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService 
{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MedecinRepository medecinRepository;
    
    @Autowired
    private ChercheurRepository chercheurRepository;

    @Autowired
    private MedecinService medecinService;
    
    @Transactional(readOnly = true)
    public List<User> getAllUsers() 
    {
    return userRepository.findAll();
}
    
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) 
    {
        if (role == null) 
        {
            throw new BusinessException("Le rôle est obligatoire");
        }
        return userRepository.findByRoles(role);
    }
    
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(boolean actif) 
    {
        return userRepository.findByActif(actif);
    }
    
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) 
    {
        if (id == null) 
        {
            throw new BusinessException("L'ID est obligatoire");
        }
        return userRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) 
    {
        if (!StringUtils.hasText(email)) 
        {
            throw new BusinessException("L'email est obligatoire");
        }
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User updateUserStatus(UserStatusUpdateDTO dto) 
    {
        if (dto == null || dto.getUserId() == null) 
        {
            throw new BusinessException("Les données de mise à jour sont invalides");
        }
        
        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        User user = userOpt.orElseThrow(() -> 
            new BusinessException("Utilisateur non trouvé avec l'ID: " + dto.getUserId()));
            
        user.setActif(dto.isActif());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean isUserActive(Long userId) 
    {
        if (userId == null) 
        {
            throw new BusinessException("L'ID est obligatoire");
        }
        return userRepository.findById(userId)
            .map(User::isActif)
            .orElseThrow(() -> new BusinessException("Utilisateur non trouvé avec l'ID: " + userId));
    }

    @Transactional(readOnly = true)
    public Optional<Admin> getAdminById(Long id) 
    {
        if (id == null) 
        {
            throw new BusinessException("L'ID est obligatoire");
        }
        return adminRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Chercheur> getChercheurById(Long id) 
    {
        if (id == null) 
        {
            throw new BusinessException("L'ID est obligatoire");
        }
        return chercheurRepository.findById(id);
    }

    @Transactional
    public void deleteUser(Long id) 
    {
        if (id == null) 
        {
            throw new BusinessException("L'ID est obligatoire");
        }

        boolean isMedecin = medecinRepository.existsById(id);
            if (isMedecin && !medecinService.isDeletableMedecin(id)) {
        throw new BusinessException("Ce médecin ne peut pas être supprimé car il a des patients référents");
    }
        userRepository.deleteById(id);
    }
}
