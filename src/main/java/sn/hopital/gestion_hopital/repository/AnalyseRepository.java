package sn.hopital.gestion_hopital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import sn.hopital.gestion_hopital.entite.Analyses;

@Repository
public interface AnalyseRepository extends JpaRepository<Analyses, UUID> 
{}