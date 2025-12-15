package sn.hopital.gestion_hopital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.hopital.gestion_hopital.entite.MedecinEntite;
import sn.hopital.gestion_hopital.entite.Role;

/**
 * Repository pour la gestion des médecins
 */
@Repository
public interface MedecinRepository extends JpaRepository<MedecinEntite, Long> {
    
    /**
     * Trouve un médecin par son email
     */
    Optional<MedecinEntite> findByEmail(String email);
    
    /**
     * Trouve un médecin par son numéro d'ordre
     */
    Optional<MedecinEntite> findByNumeroOrdre(String numeroOrdre);
    
    /**
     * Trouve un médecin par son ID utilisateur et son rôle
     */
    @Query("SELECT m FROM MedecinEntite m WHERE m.id = :userId AND m.roles = :role")
    Optional<MedecinEntite> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") Role roles);

    /**
     * Récupère tous les médecins actifs
     */
    List<MedecinEntite> findByActifTrue();
    
    /**
     * Récupère tous les médecins par spécialité
     */
    List<MedecinEntite> findBySpecialite(String specialite);

}
