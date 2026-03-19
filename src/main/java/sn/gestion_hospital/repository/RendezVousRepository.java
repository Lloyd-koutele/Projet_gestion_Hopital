package sn.gestion_hospital.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import sn.gestion_hospital.entite.RendezVous;


@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> 
{
List<RendezVous> findRendezVousByPatientId(Long patientId);

    List<RendezVous> findRendezVousByMedecinId(Long medecinId);

    List<RendezVous> findRendezVousByDateHeureBetween(
            LocalDateTime debut,
            LocalDateTime fin
    );

    List<RendezVous> findRendezVousByStatut(RendezVous.StatutRendezVous statut);

    boolean existsByMedecinIdAndDateHeureBetween(
            Long medecinId,
            LocalDateTime debut,
            LocalDateTime fin
    ); 
}
