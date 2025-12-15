package sn.hopital.gestion_hopital.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class UserStatusUpdateDTO {
    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long userId;
    
    @NotNull(message = "Le statut actif est obligatoire")
    private boolean actif;
}
