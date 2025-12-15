package sn.hopital.gestion_hopital.repository;

import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import sn.hopital.gestion_hopital.entite.Patient;

/**
 * Repository pour la gestion des patients
 * Fournit les opérations CRUD de base et des méthodes de recherche personnalisées
 */
@Repository
public interface PatientRepository extends CrudRepository<Patient, Integer>
{

    /**
     * Recherche un patient par son email
     * @param email l'email du patient
     * @return le patient s'il existe
     */
    Optional<Patient> findByEmail(String email);

    /**
     * Recherche un patient par son ID
     * @param id l'identifiant du patient
     * @return le patient s'il existe
     */
    Optional<Patient> findById(int id);

    /**
     * Vérifie si un patient existe avec l'email donné
     * @param email l'email à vérifier
     * @return true si un patient existe avec cet email
     */
    boolean existsByEmail(String email);
}