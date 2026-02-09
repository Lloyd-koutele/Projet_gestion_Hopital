package sn.gestion_hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.gestion_hospital.entite.Chercheur;


@Repository
public interface ChercheurRepository extends JpaRepository<Chercheur, Long> {}
