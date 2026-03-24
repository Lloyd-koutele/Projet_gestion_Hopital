package sn.gestion_hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.gestion_hospital.dto.AdminCreationDTO;
import sn.gestion_hospital.entite.Admin;
import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.AdminRepository;
import sn.gestion_hospital.repository.UserRepository;
import sn.gestion_hospital.entite.Role;

/**
 * Service responsable de la gestion des administrateurs
 */
@Service
public class AdminService 
{
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    

    @Transactional
    public Admin createAdmin(AdminCreationDTO dto) 
    {
        validateAdminData(dto);
        
        // Vérifier si l'utilisateur existe déjà
        if (adminRepository.findByEmail(dto.getEmail()).isPresent()) 
        {
            throw new BusinessException("Cet email est déjà utilisé");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) 
        {
            throw new BusinessException("Le mot de passe est obligatoire");
        }
        
        // Créer et sauvegarder l'administrateur
        Admin admin = new Admin();
        admin.setNom(dto.getNom());
        admin.setPrenom(dto.getPrenom());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setTelephone(dto.getTelephone());
        admin.setDepartement(dto.getDepartement());
        admin.setRoles(Role.ADMIN);
        
        return adminRepository.save(admin);
    }

    @Transactional
    public Admin updateAdmin(Long id, AdminCreationDTO dto)
    {
        Admin admin = adminRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Admin introuvable"));
        if (!admin.getEmail().equals(dto.getEmail())) 
        {
            userRepository.findByEmail(dto.getEmail()).
            ifPresent(u -> 
            {
                throw new BusinessException("Cet email est déjà utilisé");
            });

            admin.setEmail(dto.getEmail());
        }
        admin.setPrenom(dto.getPrenom());
        admin.setNom(dto.getNom());
        admin.setTelephone(dto.getTelephone());
        admin.setDepartement(dto.getDepartement());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) 
        {
            admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
            return adminRepository.save(admin);
    }
    
    private void validateAdminData(AdminCreationDTO dto) 
    {
        if (!StringUtils.hasText(dto.getNom())) 
        {
            throw new BusinessException("Le nom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPrenom())) 
        {
            throw new BusinessException("Le prénom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getEmail())) 
        {
            throw new BusinessException("L'email est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPassword())) 
        {
            throw new BusinessException("Le mot de passe est obligatoire");
        }
        if (dto.getPassword().length() < 5) 
        {
            throw new BusinessException("Le mot de passe doit contenir au moins 5 caractères");
        }
        if (!StringUtils.hasText(dto.getTelephone())) 
        {
            throw new BusinessException("Le téléphone est obligatoire");
        }
        if (!StringUtils.hasText(dto.getDepartement())) 
        {
            throw new BusinessException("Le département est obligatoire");
        }
    }
}
