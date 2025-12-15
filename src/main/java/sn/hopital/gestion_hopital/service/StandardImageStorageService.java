package sn.hopital.gestion_hopital.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Service responsable de la gestion des images médicales standards (non-DICOM)
 * Gère le stockage, la récupération et la suppression des images dans le système de fichiers
 */
public interface StandardImageStorageService {
    
    /**
     * Stocke un fichier image dans le système de fichiers
     * @param file Le fichier à stocker
     * @param typeImage Le type d'image (ex: "scanner", "radiographie")
     * @param patientId L'identifiant du patient
     * @param description La description de l'image
     * @return Le chemin relatif du fichier stocké
     * @throws IOException En cas d'erreur lors du stockage
     */
    String storeFile(MultipartFile file, String typeImage, int patientId, String description) throws IOException;
    
    /**
     * Récupère un fichier image à partir de son chemin
     * @param filePath Le chemin du fichier
     * @return La ressource correspondant au fichier
     * @throws IOException En cas d'erreur lors de la récupération
     */
    Resource loadFileAsResource(String filePath) throws IOException;
    
    /**
     * Supprime un fichier image du système de fichiers
     * @param filePath Le chemin du fichier à supprimer
     * @return true si la suppression a réussi, false sinon
     * @throws IOException En cas d'erreur lors de la suppression
     */
    boolean deleteFile(String filePath) throws IOException;
    
    /**
     * Vérifie si un fichier existe dans le système de fichiers
     * @param filePath Le chemin du fichier à vérifier
     * @return true si le fichier existe, false sinon
     */
    boolean fileExists(String filePath);
    
    /**
     * Obtient le chemin complet d'un fichier à partir de son chemin relatif
     * @param filePath Le chemin relatif du fichier
     * @return Le chemin complet du fichier
     */
    Path getFilePath(String filePath);
    
    /**
     * Détermine le type de contenu MIME en fonction du chemin du fichier
     * @param filePath Le chemin du fichier
     * @return Le type MIME du fichier
     */
    String determineContentType(String filePath);
}
