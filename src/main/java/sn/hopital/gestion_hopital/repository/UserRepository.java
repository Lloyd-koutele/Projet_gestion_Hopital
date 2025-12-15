package sn.hopital.gestion_hopital.repository;

import java.util.List;
import java.util.Optional;

import sn.hopital.gestion_hopital.entite.Role;
import sn.hopital.gestion_hopital.entite.User;

import org.springframework.data.jpa.repository.JpaRepository;

// import org.springframework.data.rest.core.annotation.RepositoryRestResource;

 // @RepositoryRestResource(exported = false)
public interface UserRepository extends JpaRepository<User, Long>
{
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndRoles (String email, Role roles);
    boolean existsByEmail(String email);

    List<User> findByRoles(Role roles);

    List<User> findByActif(boolean actif);

    Optional<User> findById(Long userId);
}