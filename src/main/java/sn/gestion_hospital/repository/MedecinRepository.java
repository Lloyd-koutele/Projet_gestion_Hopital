package sn.gestion_hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.entite.Role;

/**
 * Repository pour la gestion des médecins
 */
@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long>
{

    Optional<Medecin> findByEmail(String email);

    Optional<Medecin> findByNumeroOrdre(String numeroOrdre);

    @Query("SELECT m FROM Medecin m WHERE m.id = :userId AND m.roles = :role")
    Optional<Medecin> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") Role roles);

    List<Medecin> findByActifTrue();
    
    List<Medecin> findBySpecialite(String specialite);

}
