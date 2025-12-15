package sn.hopital.gestion_hopital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.hopital.gestion_hopital.entite.ChercheurEntite;
import sn.hopital.gestion_hopital.entite.Role;

@Repository
public interface ChercheurRepository extends JpaRepository<ChercheurEntite, Long> {
    
    /**
     * Trouve un chercheur par son ID avec les données de base
     */
    @Query("SELECT c FROM ChercheurEntite c WHERE c.id = :id")
    Optional<ChercheurEntite> findById(@Param("id") Long id);

    /**
     * Trouve un chercheur par son email
     */
    @Query("SELECT c FROM ChercheurEntite c WHERE c.email = :email")
    Optional<ChercheurEntite> findByEmail(@Param("email") String email);

    /**
     * Trouve tous les chercheurs par spécialité de recherche
     */
    @Query("SELECT c FROM ChercheurEntite c WHERE c.specialiteRecherche = :specialite")
    List<ChercheurEntite> findBySpecialite(@Param("specialite") String specialite);

    /**
     * Trouve un chercheur par son ID utilisateur et son rôle, optimisé
     */
    @Query("SELECT c FROM ChercheurEntite c WHERE c.id = :userId AND c.roles = :role")
    Optional<ChercheurEntite> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") Role roles);
}
