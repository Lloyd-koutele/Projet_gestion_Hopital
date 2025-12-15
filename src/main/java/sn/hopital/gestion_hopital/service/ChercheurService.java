package sn.hopital.gestion_hopital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.hopital.gestion_hopital.dto.ChercheurCreationDTO;
import sn.hopital.gestion_hopital.entite.ChercheurEntite;
import sn.hopital.gestion_hopital.entite.Role;
import sn.hopital.gestion_hopital.exception.BusinessException;
import sn.hopital.gestion_hopital.repository.ChercheurRepository;
import sn.hopital.gestion_hopital.repository.UserRepository;

@Service
public class ChercheurService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ChercheurRepository chercheurRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Transactional
    public ChercheurEntite createChercheur(ChercheurCreationDTO dto) {
        validateChercheurData(dto);
        
        // Vérifier si l'utilisateur existe déjà
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Cet email est déjà utilisé");
        }
        
        // Créer et sauvegarder le chercheur
        ChercheurEntite chercheur = new ChercheurEntite(
            dto.getNom(),
            dto.getPrenom(),
            dto.getEmail(),
            passwordEncoder.encode(dto.getPassword()),
            dto.getTelephone(),
            dto.getSpecialiteRecherche()
        );
        
        return chercheurRepository.save(chercheur);
    }
    
    private void validateChercheurData(ChercheurCreationDTO dto) {
        if (!StringUtils.hasText(dto.getNom())) {
            throw new BusinessException("Le nom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPrenom())) {
            throw new BusinessException("Le prénom est obligatoire");
        }
        if (!StringUtils.hasText(dto.getEmail())) {
            throw new BusinessException("L'email est obligatoire");
        }
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BusinessException("Le mot de passe est obligatoire");
        }
        if (!StringUtils.hasText(dto.getTelephone())) {
            throw new BusinessException("Le téléphone est obligatoire");
        }
        if (!StringUtils.hasText(dto.getSpecialiteRecherche())) {
            throw new BusinessException("La spécialité de recherche est obligatoire");
        }
    }
}
