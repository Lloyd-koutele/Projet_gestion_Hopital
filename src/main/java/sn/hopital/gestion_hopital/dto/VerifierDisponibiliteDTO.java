package sn.hopital.gestion_hopital.dto;

import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * DTO pour vérifier la disponibilité d'un créneau de rendez-vous
 */
public class VerifierDisponibiliteDTO {
    
    private Long medecinId;
    private Long patientId;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime dateHeure;
    
    private int duree = 30;
    
    // Constructeurs
    public VerifierDisponibiliteDTO() {}
    
    public VerifierDisponibiliteDTO(Long medecinId, Long patientId, LocalDateTime dateHeure, int duree) {
        this.medecinId = medecinId;
        this.patientId = patientId;
        this.dateHeure = dateHeure;
        this.duree = duree;
    }
    
    // Getters et setters
    public Long getMedecinId() {
        return medecinId;
    }
    
    public void setMedecinId(Long medecinId) {
        this.medecinId = medecinId;
    }
    
    public Long getPatientId() {
        return patientId;
    }
    
    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
    
    public LocalDateTime getDateHeure() {
        return dateHeure;
    }
    
    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }
    
    public int getDuree() {
        return duree;
    }
    
    public void setDuree(int duree) {
        this.duree = duree;
    }
}
