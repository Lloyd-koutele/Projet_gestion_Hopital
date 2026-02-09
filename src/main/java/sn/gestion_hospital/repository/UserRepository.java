package sn.gestion_hospital.repository;

import java.util.List;
import java.util.Optional;

import sn.gestion_hospital.entite.Role;
import sn.gestion_hospital.entite.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>
{
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndRoles (String email, Role roles);
    boolean existsByEmail(String email);

    List<User> findByRoles(Role roles);

    List<User> findByActif(boolean actif);

    Optional<User> findById(Long userId);
}