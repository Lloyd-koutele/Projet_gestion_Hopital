package sn.hopital.gestion_hopital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.UUID;

import sn.hopital.gestion_hopital.entite.Consultation;


import sn.hopital.gestion_hopital.repository.*;


@Service
public class ConsultationService 
{

    @Autowired
    private ConsultationRepository consultationRepo;

    /**
     * Sauvegarde une consultation médicale.
     *
     * @param consultation La consultation à sauvegarder
     * @return La consultation sauvegardée avec son ID généré
     */
    @Transactional
    public Consultation saveConsultation(Consultation consultation) 
    {
        return consultationRepo.save(consultation);
    }

    /**
     * Récupère une consultation médicale par son ID.
     * 
     * @param consultationId L'ID de la  consultation à récupérer
     * @return Un Optional contenant la consultation si elle existe
     */
    public java.util.Optional<Consultation> findById(UUID consultationId) 
    {
        return consultationRepo.findById(consultationId);
    }
    
}

