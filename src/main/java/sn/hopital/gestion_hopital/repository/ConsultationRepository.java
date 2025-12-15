package sn.hopital.gestion_hopital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

import sn.hopital.gestion_hopital.entite.Consultation;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {}
