package sn.hopital.gestion_hopital.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.hopital.gestion_hopital.entite.AdminEntite;
import sn.hopital.gestion_hopital.entite.Role;

/**
 * Repository pour la gestion des administrateurs
 */
@Repository
public interface AdminRepository extends JpaRepository<AdminEntite, Long> {
    
    /**
     * Trouve un administrateur par son email
     */
    Optional<AdminEntite> findByEmail(String email);
    
    /**
     * Trouve un administrateur par son ID et vérifie son rôle
     */
    @Query("SELECT a FROM AdminEntite a WHERE a.id = :id AND a.roles = :role")
    Optional<AdminEntite> findByIdAndRole(@Param("id") Long id, @Param("role") Role role);
    
    /**
     * Trouve tous les administrateurs actifs
     */
    @Query("SELECT a FROM AdminEntite a WHERE a.actif = true")
    List<AdminEntite> findAllActifs();
    
    /**
     * Trouve tous les administrateurs par département
     */
    List<AdminEntite> findByDepartement(String departement);
}
