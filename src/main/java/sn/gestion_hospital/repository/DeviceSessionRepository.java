package sn.gestion_hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;
import sn.gestion_hospital.entite.User;
import jakarta.persistence.LockModeType;
import sn.gestion_hospital.entite.DeviceSession;
import java.util.List;


public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> 
{
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DeviceSession> findByRefreshTokenAndRevokedFalse(String refreshToken);

    List<DeviceSession> findAllByUserAndRevokedFalse(User user);
}
