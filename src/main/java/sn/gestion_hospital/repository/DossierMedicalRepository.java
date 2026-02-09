package sn.gestion_hospital.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import sn.gestion_hospital.entite.DossierMedical;

public interface DossierMedicalRepository extends JpaRepository<DossierMedical, UUID> 
{}
