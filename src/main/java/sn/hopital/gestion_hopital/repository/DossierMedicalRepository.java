package sn.hopital.gestion_hopital.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import sn.hopital.gestion_hopital.entite.DossierMedical;

public interface DossierMedicalRepository extends JpaRepository<DossierMedical, UUID> 
{}
