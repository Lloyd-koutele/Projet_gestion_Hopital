package sn.gestion_hospital.dto;

/**
 * Réponse pour indiquer la disponibilité d'un créneau de rendez-vous
 */
public class DisponibiliteResponse {
    
    private boolean disponible;
    private String message;
    
    // Constructeurs
    public DisponibiliteResponse() {}
    
    public DisponibiliteResponse(boolean disponible, String message) {
        this.disponible = disponible;
        this.message = message;
    }
    
    // Méthodes statiques pour créer des réponses communes
    public static DisponibiliteResponse creneauDisponible() {
        return new DisponibiliteResponse(true, "Le créneau est disponible");
    }
    
    public static DisponibiliteResponse creneauIndisponible(String raison) {
        return new DisponibiliteResponse(false, raison);
    }
    
    // Getters et setters
    public boolean isDisponible() {
        return disponible;
    }
    
    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
