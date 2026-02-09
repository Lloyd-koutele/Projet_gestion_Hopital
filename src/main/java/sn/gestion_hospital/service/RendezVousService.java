package sn.gestion_hospital.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.gestion_hospital.entite.RendezVous;
import sn.gestion_hospital.repository.RendezVousRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RendezVousService 
{

    private final RendezVousRepository rendezVousRepository;

    public RendezVous annuler(UUID id) 
    {
        RendezVous rdv = getRendezVous(id);
        rdv.annuler();
        return rendezVousRepository.save(rdv);
    }

    public RendezVous confirmer(UUID id) 
    {
        RendezVous rdv = getRendezVous(id);
        rdv.confirmer();
        return rendezVousRepository.save(rdv);
    }

    public RendezVous reporter(UUID id, LocalDateTime nouvelleDateHeure) 
    {
        RendezVous rdv = getRendezVous(id);
        rdv.reporter(nouvelleDateHeure);
        return rendezVousRepository.save(rdv);
    }

    public RendezVous marquerAbsence(UUID id) 
    {
        RendezVous rdv = getRendezVous(id);
        rdv.marquerAbsence();
        return rendezVousRepository.save(rdv);
    }

    public boolean mettreAJourStatutSiPasse(UUID id) 
    {
        RendezVous rdv = getRendezVous(id);
        boolean modifie = rdv.mettreAJourStatusSiPasse();
        if (modifie) 
        {
            rendezVousRepository.save(rdv);
        }
        return modifie;
    }

    private RendezVous getRendezVous(UUID id) 
    {
        return rendezVousRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rendez-vous introuvable"));
    }
}
