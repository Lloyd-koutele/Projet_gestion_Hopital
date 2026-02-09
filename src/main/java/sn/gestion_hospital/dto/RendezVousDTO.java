package sn.gestion_hospital.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import sn.gestion_hospital.entite.RendezVous.StatutRendezVous;

/**
 * DTO pour les rendez-vous
 */
public class RendezVousDTO 
{
    private UUID id;
    private int patientId;
    private String patientNom;
    private String patientPrenom;
    private UUID medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private LocalDateTime dateHeure;
    private int duree;
    private String motif;
    private String notes;
    private StatutRendezVous statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDerniereModification;
    
    // Getters et Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public int getPatientId() {
        return patientId;
    }
    
    public void setPatientId(int patientId) {
        this.patientId = patientId;
    }
    
    public String getPatientNom() {
        return patientNom;
    }
    
    public void setPatientNom(String patientNom) {
        this.patientNom = patientNom;
    }
    
    public String getPatientPrenom() {
        return patientPrenom;
    }
    
    public void setPatientPrenom(String patientPrenom) {
        this.patientPrenom = patientPrenom;
    }
    
    public UUID getMedecinId() {
        return medecinId;
    }
    
    public void setMedecinId(UUID medecinId) {
        this.medecinId = medecinId;
    }
    
    public String getMedecinNom() {
        return medecinNom;
    }
    
    public void setMedecinNom(String medecinNom) {
        this.medecinNom = medecinNom;
    }
    
    public String getMedecinPrenom() {
        return medecinPrenom;
    }
    
    public void setMedecinPrenom(String medecinPrenom) {
        this.medecinPrenom = medecinPrenom;
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
    
    public String getMotif() {
        return motif;
    }
    
    public void setMotif(String motif) {
        this.motif = motif;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public StatutRendezVous getStatut() {
        return statut;
    }
    
    public void setStatut(StatutRendezVous statut) {
        this.statut = statut;
    }
    
    public LocalDateTime getDateCreation() {
        return dateCreation;
    }
    
    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
    
    public LocalDateTime getDateDerniereModification() {
        return dateDerniereModification;
    }
    
    public void setDateDerniereModification(LocalDateTime dateDerniereModification) {
        this.dateDerniereModification = dateDerniereModification;
    }
}
