package sn.gestion_hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.gestion_hospital.dto.MedecinCreationDTO;
import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.entite.Role;
import sn.gestion_hospital.entite.User;
import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.MedecinRepository;
import sn.gestion_hospital.repository.PatientRepository;

@Service
public class MedecinService 
{

    @Autowired
    private MedecinRepository medecinRepository;
    
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    @org.springframework.context.annotation.Lazy
    private PatientService patientService;
    
    public Optional<Medecin> getMedecinConnecte() 
    {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = null;
        
        if (principal instanceof UserDetails) 
        {
            email = ((UserDetails) principal).getUsername();
        } 
        else 
        {
            email = principal.toString();
        }
        
        return medecinRepository.findByEmail(email);
    }

    public Medecin createMedecin(MedecinCreationDTO dto)
    {
        if(medecinRepository.findByEmail(dto.getEmail()).isPresent())
        {
            throw new BusinessException("Cet email est déjà utilisé");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) 
        {
            throw new BusinessException("Le mot de passe est obligatoire");
        }

        Medecin medecin = new Medecin();
        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setEmail(dto.getEmail());
        medecin.setPassword(passwordEncoder.encode(dto.getPassword()));
        medecin.setTelephone(dto.getTelephone());
        medecin.setSpecialite(dto.getSpecialite());
        medecin.setNumeroOrdre(dto.getNumeroOrdre());
        medecin.setRoles(Role.MEDECIN);

        return medecinRepository.save(medecin);
    }

    @Transactional
    public Medecin updateMedecin(Long id, MedecinCreationDTO dto)
    {
        Medecin medecin = medecinRepository.findById(id)
        .orElseThrow(() -> new BusinessException("Medecin introuvable"));

        if (!medecin.getEmail().equalsIgnoreCase(dto.getEmail()) && 
        medecinRepository.findByEmail(dto.getEmail()).isPresent()) 
        {
            throw new BusinessException("L'email " + dto.getEmail() + " est déjà utilisé.");
        }

        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setEmail(dto.getEmail());
        medecin.setTelephone(dto.getTelephone());
        medecin.setSpecialite(dto.getSpecialite());
        medecin.setNumeroOrdre(dto.getNumeroOrdre());
        if(dto.getPassword() != null && !dto.getPassword().isBlank())
        {
            medecin.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return medecinRepository.save(medecin);
    }
    
    public boolean estMedecin(User user) 
    {
        return user != null && Role.MEDECIN.equals(user.getRoles());
    }
    
    public Optional<Medecin> getMedecinById(Long id) 
    {
        return medecinRepository.findById(id);
    }
    
    public Optional<Medecin> getMedecinByEmail(String email) 
    {
        return medecinRepository.findByEmail(email);
    }
    
    public List<Medecin> getAllMedecinsActifs() 
    {
        return medecinRepository.findByActifTrue();
    }
    
    public List<Medecin> getMedecinsBySpecialite(String specialite) 
    {
        return medecinRepository.findBySpecialite(specialite);
    }
    
    @Transactional
    public Medecin saveMedecin(Medecin medecin) 
    {
        return medecinRepository.save(medecin);
    }
    
    public Optional<Medecin> getMedecinFromUser(User user) 
    {
        if (!estMedecin(user)) {
            return Optional.empty();
        }
        
        // Vérifier si le médecin existe déjà
        return medecinRepository.findByEmail(user.getEmail());
    }

    @SuppressWarnings("unused")
    public boolean isDeletableMedecin(Long medecinId)
    {
        Medecin medecin = medecinRepository.findById(medecinId)
        .orElseThrow(() -> new BusinessException("Medecin introuvable"));

        boolean hasCreate = patientRepository.existsByMedecinReferentId(medecinId);

        return !hasCreate;
    }
    
}
