package sn.gestion_hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

import sn.gestion_hospital.entite.Consultation;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {}
