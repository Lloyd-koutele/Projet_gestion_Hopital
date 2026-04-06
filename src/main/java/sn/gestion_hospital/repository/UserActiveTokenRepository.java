package sn.gestion_hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;
import sn.gestion_hospital.entite.User;
import jakarta.persistence.LockModeType;
import sn.gestion_hospital.entite.UserActiveToken;

public interface UserActiveTokenRepository extends JpaRepository<UserActiveToken, Long>
{
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserActiveToken> findByUser(User user);
}