package sn.hopital.gestion_hopital.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import sn.hopital.gestion_hopital.StorageProperties;
import sn.hopital.gestion_hopital.service.StandardImageStorageService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Implémentation du service de stockage des images standards (non-DICOM)
 * Gère le stockage, la récupération et la suppression des images dans le système de fichiers
 */
@Service
public class StandardImageStorageServiceImpl implements StandardImageStorageService {

    private final Path fileStorageLocation;
    private final StorageProperties storageProperties;

    @Autowired
    public StandardImageStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        
        // Utiliser le chemin absolu à partir du répertoire courant de l'application
        String currentDir = System.getProperty("user.dir");
        Path currentPath = Paths.get(currentDir);
        
        // Résoudre le chemin relatif par rapport au répertoire courant
        this.fileStorageLocation = currentPath.resolve(storageProperties.getBasePath())
                .toAbsolutePath().normalize();
        
        try {
            System.out.println("Initialisation du stockage d'images dans: " + this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage des fichiers: " + this.fileStorageLocation, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String typeImage, int patientId, String description) throws IOException {
        // Normaliser le nom du fichier
        String fileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");
        
        // Vérifier si le nom du fichier contient des caractères invalides
        if (fileName.contains("..")) {
            throw new IOException("Désolé! Le nom du fichier contient un chemin invalide " + fileName);
        }
        
        // Normaliser le type d'image pour le dossier (en minuscules)
        String typeDossier = typeImage.toLowerCase();
        
        // Générer un nom de fichier unique pour éviter les collisions
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        
        // Créer le chemin du répertoire pour le type d'image
        Path typeDir = this.fileStorageLocation.resolve(typeDossier);
        Files.createDirectories(typeDir);
        
        // Créer le chemin du répertoire pour le patient dans le dossier du type d'image
        Path patientDir = typeDir.resolve(String.valueOf(patientId));
        Files.createDirectories(patientDir);
        
        // Créer le chemin complet du fichier
        Path targetLocation = patientDir.resolve(uniqueFileName);
        
        System.out.println("Enregistrement de l'image: " + targetLocation.toString());
        
        // Copier le fichier vers l'emplacement cible
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // Retourner le chemin relatif du fichier (type/patientId/fileName)
        return typeDossier + "/" + patientId + "/" + uniqueFileName;
    }

    @Override
    public Resource loadFileAsResource(String filePath) throws IOException {
        try {
            // Vérifier si le chemin est un chemin absolu ou relatif
            Path file;
            Path pathToCheck = Paths.get(filePath);
            
            if (pathToCheck.isAbsolute()) {
                // Si c'est un chemin absolu, l'utiliser directement
                file = pathToCheck;
            } else {
                // Si c'est un chemin relatif, le résoudre par rapport au répertoire de stockage
                file = this.fileStorageLocation.resolve(filePath).normalize();
            }
            
            System.out.println("Chargement du fichier: " + file.toString());
            
            // Vérifier si le fichier existe
            if (!Files.exists(file)) {
                System.out.println("ERREUR: Fichier non trouvé: " + file.toString());
                throw new IOException("Fichier non trouvé : " + filePath);
            }
            
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists()) {
                System.out.println("Fichier chargé avec succès: " + filePath);
                return resource;
            } else {
                System.out.println("ERREUR: Ressource inexistante après création: " + filePath);
                throw new IOException("Fichier non trouvé : " + filePath);
            }
        } catch (MalformedURLException ex) {
            System.out.println("ERREUR: URL malformée pour: " + filePath + " - " + ex.getMessage());
            throw new IOException("Fichier non trouvé : " + filePath, ex);
        } catch (Exception ex) {
            System.out.println("ERREUR: Exception lors du chargement du fichier: " + filePath + " - " + ex.getMessage());
            throw new IOException("Erreur lors du chargement du fichier : " + filePath, ex);
        }
    }

    @Override
    public boolean deleteFile(String filePath) throws IOException {
        Path file = this.fileStorageLocation.resolve(filePath).normalize();
        return Files.deleteIfExists(file);
    }

    @Override
    public boolean fileExists(String filePath) {
        try {
            // Vérifier si le chemin est un chemin absolu ou relatif
            Path file;
            Path pathToCheck = Paths.get(filePath);
            
            if (pathToCheck.isAbsolute()) {
                // Si c'est un chemin absolu, l'utiliser directement
                file = pathToCheck;
            } else {
                // Si c'est un chemin relatif, le résoudre par rapport au répertoire de stockage
                file = this.fileStorageLocation.resolve(filePath).normalize();
            }
            
            boolean exists = Files.exists(file);
            if (!exists) {
                System.out.println("Vérification d'existence: Fichier non trouvé: " + file.toString());
            }
            return exists;
        } catch (Exception e) {
            System.out.println("ERREUR lors de la vérification d'existence du fichier: " + filePath + " - " + e.getMessage());
            return false;
        }
    }

    @Override
    public Path getFilePath(String filePath) {
        try {
            // Vérifier si le chemin est un chemin absolu ou relatif
            Path pathToCheck = Paths.get(filePath);
            
            if (pathToCheck.isAbsolute()) {
                // Si c'est un chemin absolu, l'utiliser directement
                return pathToCheck;
            } else {
                // Si c'est un chemin relatif, le résoudre par rapport au répertoire de stockage
                Path resolvedPath = this.fileStorageLocation.resolve(filePath).normalize();
                System.out.println("Résolution du chemin: " + filePath + " -> " + resolvedPath);
                return resolvedPath;
            }
        } catch (Exception e) {
            System.out.println("ERREUR lors de la résolution du chemin: " + filePath + " - " + e.getMessage());
            // En cas d'erreur, retourner le chemin par défaut
            return this.fileStorageLocation.resolve(filePath).normalize();
        }
    }

    @Override
    public String determineContentType(String filePath) {
        // Déterminer le type MIME en fonction de l'extension du fichier
        String fileName = filePath.toLowerCase();
        
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".bmp")) {
            return "image/bmp";
        } else if (fileName.endsWith(".tiff") || fileName.endsWith(".tif")) {
            return "image/tiff";
        } else if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else {
            // Type MIME par défaut pour les fichiers inconnus
            return "application/octet-stream";
        }
    }
}
