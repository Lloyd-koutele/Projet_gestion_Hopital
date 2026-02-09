package sn.gestion_hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.UUID;

import sn.gestion_hospital.entite.Consultation;
import sn.gestion_hospital.repository.*;


@Service
public class ConsultationService 
{

    @Autowired
    private ConsultationRepository consultationRepo;
    
    @Transactional
    public Consultation saveConsultation(Consultation consultation) 
    {
        return consultationRepo.save(consultation);
    }

    public java.util.Optional<Consultation> findById(UUID consultationId) 
    {
        return consultationRepo.findById(consultationId);
    }
    
}

