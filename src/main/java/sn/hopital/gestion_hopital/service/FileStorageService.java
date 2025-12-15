package sn.hopital.gestion_hopital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.hopital.gestion_hopital.StorageProperties;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Service
public class FileStorageService 
{

    private final StorageProperties storageProperties;
    
    @Autowired
    public FileStorageService(StorageProperties storageProperties) 
    {
        this.storageProperties = storageProperties;
        initializeStorageDirectories();
    }
    
    /**
     * Initialize all storage directories
     */
    private void initializeStorageDirectories() 
    {
        try {
            System.out.println("Initialisation des répertoires de stockage des images...");
            System.out.println("Répertoire de base: " + storageProperties.getBasePath());
            
            // Créer le répertoire de base avec un chemin absolu
            Path basePath = Paths.get(storageProperties.getBasePath()).toAbsolutePath();
            System.out.println("Chemin absolu du répertoire de base: " + basePath);
            createDirectoryIfNotExists(basePath.toString());
            
            // Créer les sous-répertoires pour chaque type d'image
            createDirectoryIfNotExists(storageProperties.getScannerPath());
            System.out.println("Répertoire pour les scanners créé: " + storageProperties.getScannerPath());
            
            createDirectoryIfNotExists(storageProperties.getRadiographyPath());
            System.out.println("Répertoire pour les radiographies créé: " + storageProperties.getRadiographyPath());
            
            createDirectoryIfNotExists(storageProperties.getMriPath());
            System.out.println("Répertoire pour les IRM créé: " + storageProperties.getMriPath());
            
            createDirectoryIfNotExists(storageProperties.getUltrasoundPath());
            System.out.println("Répertoire pour les échographies créé: " + storageProperties.getUltrasoundPath());
            
            createDirectoryIfNotExists(storageProperties.getOtherPath());
            System.out.println("Répertoire pour les autres images créé: " + storageProperties.getOtherPath());
            
            System.out.println("Initialisation des répertoires de stockage terminée avec succès.");
        } 
        catch (IOException e) 
        {
            System.err.println("ERREUR lors de l'initialisation des répertoires de stockage: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Could not initialize storage directories", e);
        }
    }
    
    /**
     * Create directory if it doesn't exist
     */
    private void createDirectoryIfNotExists(String directoryPath) throws IOException 
    {
        if (directoryPath == null || directoryPath.isEmpty()) {
            throw new IllegalArgumentException("Le chemin du répertoire ne peut pas être null ou vide");
        }
        
        Path path = Paths.get(directoryPath);
        System.out.println("Vérification du répertoire: " + path.toAbsolutePath());
        
        if (!Files.exists(path)) 
        {
            System.out.println("Le répertoire n'existe pas, création: " + path.toAbsolutePath());
            try {
                Files.createDirectories(path);
                System.out.println("Répertoire créé avec succès: " + path.toAbsolutePath());
                
                // Vérifier que le répertoire est accessible en lecture/écriture
                if (!Files.isWritable(path)) {
                    System.err.println("ATTENTION: Le répertoire n'est pas accessible en écriture: " + path.toAbsolutePath());
                }
            } catch (IOException e) {
                System.err.println("ERREUR lors de la création du répertoire: " + path.toAbsolutePath());
                System.err.println("Message d'erreur: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } else {
            System.out.println("Le répertoire existe déjà: " + path.toAbsolutePath());
            
            // Vérifier que le répertoire est accessible en lecture/écriture
            if (!Files.isWritable(path)) {
                System.err.println("ATTENTION: Le répertoire n'est pas accessible en écriture: " + path.toAbsolutePath());
            }
        }
    }
    
    /**
     * Store a file in the appropriate directory based on exam type
     * @return The absolute path to the stored file
     */
    public String storeFile(MultipartFile file, String examType, int patientId, String description) throws IOException {
        if (file.isEmpty()) 
        {
            throw new IllegalArgumentException("Failed to store empty file");
        }
        
        // Get the appropriate path for this exam type and patient
        String targetDirectory = storageProperties.getPathForExamType(examType, patientId);
        createDirectoryIfNotExists(targetDirectory);
        
        // Generate a unique filename with timestamp and description
        String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) 
        {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Clean description for use in filename (remove special characters)
        String cleanDescription = description.replaceAll("[^a-zA-Z0-9]", "_");
        
        // Create filename: timestamp-description-uuid.extension
        String filename = timestamp + "-" + cleanDescription + "-" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        
        // Full path to save the file
        Path targetPath = Paths.get(targetDirectory + filename);
        
        // Copy the file to the target location
        try (InputStream inputStream = file.getInputStream()) 
        {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }
        
        // Log the absolute path for debugging
        String absolutePath = targetPath.toAbsolutePath().toString();
        System.out.println("Image stockée avec succès à l'emplacement: " + absolutePath);
        
        // Return the absolute path that will be stored in the database
        return absolutePath;
    }
    
    /**
     * Get the Path object from a file path string
     * Works with both absolute and relative paths
     */
    public Path getFilePath(String filePath) 
    {
        if (filePath == null || filePath.isEmpty()) {
            System.out.println("ERREUR: Chemin de fichier null ou vide");
            throw new IllegalArgumentException("Le chemin de fichier ne peut pas être null ou vide");
        }
        
        // Normaliser le chemin pour éviter les problèmes de séparateurs de fichiers
        String normalizedPath = filePath.replace("\\", "/");
        
        Path path;
        
        // Vérifier si c'est déjà un chemin absolu
        if (Paths.get(normalizedPath).isAbsolute()) {
            // C'est déjà un chemin absolu
            System.out.println("Utilisation du chemin absolu fourni: " + normalizedPath);
            path = Paths.get(normalizedPath);
        } else {
            // C'est un chemin relatif, construire le chemin absolu
            // Supprimer les éventuels séparateurs au début du chemin relatif
            if (normalizedPath.startsWith("/")) {
                normalizedPath = normalizedPath.substring(1);
            }
            
            // Construire le chemin absolu
            String basePath = storageProperties.getBasePath();
            String fullPath = basePath + "/" + normalizedPath;
            
            System.out.println("Chemin de base: " + basePath);
            System.out.println("Chemin relatif normalisé: " + normalizedPath);
            System.out.println("Chemin complet construit: " + fullPath);
            
            path = Paths.get(fullPath);
        }
        
        System.out.println("Chemin absolu final: " + path.toAbsolutePath().toString());
        
        // Vérifier si le fichier existe
        if (!Files.exists(path)) {
            System.out.println("ATTENTION: Le fichier n'existe pas à l'emplacement: " + path.toAbsolutePath());
        } else {
            System.out.println("Fichier trouvé à l'emplacement: " + path.toAbsolutePath());
            
            // Vérifier les droits d'accès
            if (!Files.isReadable(path)) {
                System.out.println("ATTENTION: Le fichier n'est pas accessible en lecture: " + path.toAbsolutePath());
            }
        }
        
        return path;
    }
    
    /**
     * Delete a file by its relative path
     */
    public void deleteFile(String relativePath) throws IOException 
    {
        Path filePath = getFilePath(relativePath);
        Files.deleteIfExists(filePath);
    }
    
    /**
     * Check if a file exists
     */
    public boolean fileExists(String relativePath) 
    {
        Path filePath = getFilePath(relativePath);
        return Files.exists(filePath);
    }
}
