package sn.hopital.gestion_hopital.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import sn.hopital.gestion_hopital.entite.ImageMedicale;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Service principal pour la gestion des images médicales
 * Coordonne les opérations entre les services spécialisés
 */
public interface ImageMedicaleService {
    
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
     * Stocke une image médicale pour un patient
     * @param file Le fichier image
     * @param patientId L'identifiant du patient
     * @param typeImage Le type d'image (ex: "scanner", "radiographie")
     * @param description La description de l'image
     * @return L'entité ImageMedicale créée
     * @throws IOException En cas d'erreur lors du stockage
     */
    ImageMedicale storeImage(MultipartFile file, int patientId, String typeImage, String description) throws IOException;
    
    /**
     * Stocke une image médicale pour un antécédent spécifique
     * @param file Le fichier image
     * @param antecedentId L'identifiant de l'antécédent
     * @param typeImage Le type d'image (ex: "scanner", "radiographie")
     * @param description La description de l'image
     * @return L'entité ImageMedicale créée
     * @throws IOException En cas d'erreur lors du stockage
     */
    ImageMedicale storeImageForConsultation(MultipartFile file, UUID antecedentId, String typeImage, String description) throws IOException;
    

    /**
     * Ajoute une image à un antécédent médical d'un patient
     * @param patientId L'identifiant du patient
     * @param antecedentId L'identifiant de l'antécédent
     * @param file Le fichier image
     * @param typeImage Le type d'image
     * @param description La description de l'image
     * @return L'entité ImageMedicale créée
     * @throws IOException En cas d'erreur lors du stockage
     */
    ImageMedicale addImageToConsultaton(int patientId, UUID antecedentId, MultipartFile file, String typeImage, String description) throws IOException;
    
    /**
     * Récupère toutes les images d'un patient
     * @param patientId L'identifiant du patient
     * @return La liste des images du patient
     */
    List<ImageMedicale> getImagesForPatient(int patientId);
    
    /**
     * Supprime une image d'un patient
     * @param patientId L'identifiant du patient
     * @param imageId L'identifiant de l'image
     */
    void deleteImage(int patientId, UUID imageId);
    
    /**
     * Récupère le contenu d'une image
     * @param patientId L'identifiant du patient
     * @param imageId L'identifiant de l'image
     * @return La ressource contenant l'image
     * @throws IOException En cas d'erreur lors de la récupération
     */
    Resource getImageContent(int patientId, UUID imageId) throws IOException;
    
    /**
     * Récupère le contenu d'une image
     * @param image L'entité ImageMedicale
     * @return La ressource contenant l'image
     * @throws IOException En cas d'erreur lors de la récupération
     */
    Resource getImageContent(ImageMedicale image) throws IOException;
    
    /**
     * Vérifie si le fichier image existe physiquement
     * @param image L'entité ImageMedicale à vérifier
     * @return true si le fichier existe, false sinon
     */
    boolean fileExists(ImageMedicale image);
    
    /**
     * Détermine le type de contenu en fonction du lien du fichier et du type d'image
     * @param lienFichier Le chemin ou l'URL du fichier image
     * @param typeImage Le type d'image médicale (scanner, radiographie, etc.)
     * @return Le type MIME approprié pour l'image
     */
    String determineContentType(String lienFichier, String typeImage);
    
    /**
     * Récupère un aperçu d'une image DICOM
     * @param patientId L'identifiant du patient
     * @param imageId L'identifiant de l'image
     * @return Le contenu binaire de l'aperçu
     * @throws IOException En cas d'erreur lors de la récupération
     */
    byte[] getDicomPreview(int patientId, UUID imageId) throws IOException;
    
    /**
     * Vérifie si une instance DICOM existe dans Orthanc
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return true si l'instance existe, false sinon
     */
    boolean instanceExists(String orthancId);
    
    /**
     * Récupère le contenu binaire d'un fichier DICOM depuis Orthanc
     * @param orthancId L'identifiant Orthanc de l'instance
     * @return Le contenu binaire du fichier DICOM
     */
    byte[] getDicomFile(String orthancId);
    
    /**
     * Extrait l'ID Orthanc à partir d'un lien de fichier
     * @param lienFichier Le lien du fichier (format: "orthanc://ID.dcm")
     * @return L'ID Orthanc extrait du lien
     */
    String extractOrthancId(String lienFichier);
}
