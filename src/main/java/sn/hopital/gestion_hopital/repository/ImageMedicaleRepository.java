package sn.hopital.gestion_hopital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.hopital.gestion_hopital.entite.ImageMedicale;
import sn.hopital.gestion_hopital.entite.Consultation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository pour la gestion des images médicales
 * Permet d'accéder directement aux données des images médicales dans la base de données
 */
@Repository
public interface ImageMedicaleRepository extends JpaRepository<ImageMedicale, UUID> 
{
    
    // Recherche par consultation médical
    List<ImageMedicale> findByConsultation(Consultation consultation);
    
    // Recherche par type d'image
    List<ImageMedicale> findByTypeImage(String typeImage);
    
    
    // Recherche par consultation et type d'image
    List<ImageMedicale> findByConsultationAndTypeImage(Consultation consultation, String typeImage);
    
    // Recherche par période
    List<ImageMedicale> findByDateBetween(LocalDateTime debut, LocalDateTime fin);
    
    // Recherche par description (contenant une chaîne)
    List<ImageMedicale> findByDescriptionContaining(String keyword);
    
    
    // Recherche par consultation du patient
    List<ImageMedicale> findByConsultation_DossierMedical_Patient_Id(Integer patientId);

    List<ImageMedicale> findByConsultation_Id(UUID consultationId);
}
