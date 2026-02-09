package sn.gestion_hospital.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.gestion_hospital.entite.Admin;
import sn.gestion_hospital.entite.Role;

/**
 * Repository pour la gestion des administrateurs
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> 
{
    Optional<Admin> findByEmail(String email);
    
    @Query("SELECT a FROM Admin a WHERE a.id = :id AND a.roles = :role")
    Optional<Admin> findByIdAndRole(@Param("id") Long id, @Param("role") Role role);
    
    @Query("SELECT a FROM Admin a WHERE a.actif = true")
    List<Admin> findAllActifs();
    
    List<Admin> findByDepartement(String departement);
}
