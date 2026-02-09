package sn.gestion_hospital.repository;

import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import sn.gestion_hospital.entite.Patient;

@Repository
public interface PatientRepository extends CrudRepository<Patient, Long> 
{
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findById(Long id);

    boolean existsByEmail(String email);

    boolean existsByMedecinReferentId(Long medecinId);
}