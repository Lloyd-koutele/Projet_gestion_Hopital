package sn.hopital.gestion_hopital.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * Service responsable de la gestion des images DICOM
 * Gère l'interaction avec le serveur Orthanc pour le stockage et la récupération des images DICOM
 */
public interface DicomStorageService {
    
    /**
     * Vérifie si un fichier est au format DICOM en vérifiant son extension
     * @param file Le fichier à vérifier
     * @return true si le fichier a l'extension .dcm
     */
    boolean isValidDicomFile(MultipartFile file);
    
    /**
     * Vérifie si un lien de fichier correspond à une image DICOM
     * @param lienFichier Le lien du fichier à vérifier
     * @return true si le fichier a l'extension .dcm
     */
    boolean isRealDicomFile(String lienFichier);
    
    /**
     * Télécharge un fichier DICOM vers Orthanc
     * @param file Le fichier DICOM à télécharger
     * @return L'identifiant Orthanc de l'instance téléchargée
     * @throws IOException En cas d'erreur lors du téléchargement
     */
    String uploadDicomToOrthanc(MultipartFile file) throws IOException;
    
    /**
     * Récupère le contenu binaire d'un fichier DICOM depuis Orthanc
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return Le contenu binaire du fichier DICOM
     */
    byte[] getDicomFile(String orthancId);
    
    /**
     * Supprime une instance DICOM d'Orthanc
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return true si la suppression a réussi, false sinon
     */
    boolean deleteDicomInstance(String orthancId);
    
    /**
     * Vérifie si une instance DICOM existe dans Orthanc
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return true si l'instance existe, false sinon
     */
    boolean instanceExists(String orthancId);
    
    /**
     * Récupère un aperçu d'une image DICOM au format PNG
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return Le contenu binaire de l'aperçu au format PNG
     */
    byte[] getDicomPreview(String orthancId);
    
    /**
     * Extrait l'ID Orthanc à partir d'un lien de fichier
     * @param lienFichier Le lien du fichier (format: "orthanc://ID.dcm")
     * @return L'ID Orthanc extrait du lien
     */
    String extractOrthancId(String lienFichier);
}
