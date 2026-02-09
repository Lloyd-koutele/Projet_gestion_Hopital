package sn.gestion_hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import sn.gestion_hospital.entite.Analyses;

@Repository
public interface AnalyseRepository extends JpaRepository<Analyses, UUID> 
{}