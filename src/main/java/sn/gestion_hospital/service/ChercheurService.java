package sn.gestion_hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import sn.gestion_hospital.dto.ChercheurCreationDTO;
import sn.gestion_hospital.entite.Chercheur;
import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.ChercheurRepository;
import sn.gestion_hospital.repository.UserRepository;

@Service
public class ChercheurService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChercheurRepository chercheurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Chercheur createChercheur(ChercheurCreationDTO dto) {
        validateChercheurData(dto);

        // Vérifier si l'utilisateur existe déjà
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Cet email est déjà utilisé");
        }

        // Créer et sauvegarder le chercheur
        Chercheur chercheur = new Chercheur(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getTelephone(),
                dto.getSpecialiteRecherche());

        return chercheurRepository.save(chercheur);
    }

    @Transactional
    public Chercheur updateChercheur(Long id, ChercheurCreationDTO dto) 
    {
        Chercheur chercheur = chercheurRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Chercheur introuvable"));

        if (!chercheur.getEmail().equals(dto.getEmail())) 
        {
            userRepository.findByEmail(dto.getEmail()).ifPresent(u -> 
            {
                throw new BusinessException("Cet email est déjà utilisé");
            });
            chercheur.setEmail(dto.getEmail());
        }
        chercheur.setPrenom(dto.getPrenom());
        chercheur.setNom(dto.getNom());
        chercheur.setTelephone(dto.getTelephone());
        chercheur.setSpecialiteRecherche(dto.getSpecialiteRecherche());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) 
        {
            chercheur.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return chercheurRepository.save(chercheur);
    }

    private void validateChercheurData(ChercheurCreationDTO dto) 
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
        if (!StringUtils.hasText(dto.getTelephone())) 
        {
            throw new BusinessException("Le téléphone est obligatoire");
        }
        if (!StringUtils.hasText(dto.getSpecialiteRecherche())) 
        {
            throw new BusinessException("La spécialité de recherche est obligatoire");
        }
    }
}
