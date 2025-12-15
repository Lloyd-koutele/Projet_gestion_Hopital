package sn.hopital.gestion_hopital.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import sn.hopital.gestion_hopital.StorageProperties;
import sn.hopital.gestion_hopital.service.DicomStorageService;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

/**
 * Implémentation du service de stockage DICOM
 * Gère l'interaction avec Orthanc pour les images DICOM
 */
@Service
public class DicomStorageServiceImpl implements DicomStorageService {

    private final RestTemplate restTemplate;
    private final StorageProperties storageProperties;

    @Autowired
    public DicomStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public boolean isValidDicomFile(MultipartFile file) {
        // Simple check based on file extension
        String filename = file.getOriginalFilename();
        if (filename != null) {
            return filename.toLowerCase().endsWith(".dcm");
        }
        return false;
    }

    @Override
    public boolean isRealDicomFile(String lienFichier) {
        if (lienFichier == null) {
            return false;
        }
        
        // SEUL CRITÈRE: l'extension du fichier doit être .dcm
        // Peu importe où l'image est stockée (Orthanc ou système de fichiers local)
        boolean isDcmExtension = lienFichier.toLowerCase().endsWith(".dcm");
        
        if (isDcmExtension) {
            System.out.println("Détection DICOM pour " + lienFichier + ": true (extension .dcm)");
        } else {
            System.out.println("Détection DICOM pour " + lienFichier + ": false (pas d'extension .dcm)");
        }
        
        return isDcmExtension;
    }

    @Override
    public String uploadDicomToOrthanc(MultipartFile file) throws IOException {
        // Préparer l'URL pour l'upload vers Orthanc
        String orthancUrl = storageProperties.getOrthancUrl() + "/instances";
        
        // Créer les en-têtes HTTP avec authentification
        HttpHeaders headers = createOrthancAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        
        // Créer l'entité HTTP avec le contenu du fichier DICOM
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
        
        // Envoyer la requête POST à Orthanc
        ResponseEntity<Map> response = restTemplate.exchange(
            orthancUrl,
            HttpMethod.POST,
            requestEntity,
            Map.class
        );
        
        // Vérifier si l'upload a réussi
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            // Récupérer l'ID de l'instance DICOM
            String instanceId = (String) response.getBody().get("ID");
            System.out.println("Image DICOM téléchargée avec succès. ID Orthanc: " + instanceId);
            return instanceId;
        } else {
            throw new IOException("Échec du téléchargement de l'image DICOM vers Orthanc");
        }
    }

    @Override
    public byte[] getDicomFile(String orthancId) {
        // Construire l'URL pour récupérer le fichier DICOM
        String orthancUrl = storageProperties.getOrthancUrl() + "/instances/" + orthancId + "/file";
        
        // Créer les en-têtes HTTP avec authentification
        HttpHeaders headers = createOrthancAuthHeaders();
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        
        // Envoyer la requête GET à Orthanc
        ResponseEntity<byte[]> response = restTemplate.exchange(
            orthancUrl,
            HttpMethod.GET,
            requestEntity,
            byte[].class
        );
        
        // Vérifier si la récupération a réussi
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        } else {
            System.err.println("Échec de la récupération du fichier DICOM depuis Orthanc");
            return new byte[0];
        }
    }

    @Override
    public boolean deleteDicomInstance(String orthancId) {
        try {
            // Construire l'URL pour supprimer l'instance DICOM
            String orthancUrl = storageProperties.getOrthancUrl() + "/instances/" + orthancId;
            
            // Créer les en-têtes HTTP avec authentification
            HttpHeaders headers = createOrthancAuthHeaders();
            HttpEntity<String> requestEntity = new HttpEntity<>(headers);
            
            // Envoyer la requête DELETE à Orthanc
            ResponseEntity<Void> response = restTemplate.exchange(
                orthancUrl,
                HttpMethod.DELETE,
                requestEntity,
                Void.class
            );
            
            // Vérifier si la suppression a réussi
            boolean success = response.getStatusCode() == HttpStatus.OK;
            if (success) {
                System.out.println("Instance DICOM supprimée avec succès: " + orthancId);
            } else {
                System.err.println("Échec de la suppression de l'instance DICOM: " + orthancId);
            }
            return success;
        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression de l'instance DICOM: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean instanceExists(String orthancId) {
        try {
            // Construire l'URL pour vérifier l'existence de l'instance DICOM
            String orthancUrl = storageProperties.getOrthancUrl() + "/instances/" + orthancId;
            
            System.out.println("Vérification de l'existence de l'instance DICOM sur Orthanc: " + orthancUrl);
            System.out.println("Configuration Orthanc - URL: " + storageProperties.getOrthancUrl());
            System.out.println("Configuration Orthanc - Username: " + storageProperties.getOrthancUsername());
            
            // Créer les en-têtes HTTP avec authentification
            HttpHeaders headers = createOrthancAuthHeaders();
            HttpEntity<String> requestEntity = new HttpEntity<>(headers);
            
            // Envoyer la requête GET à Orthanc
            System.out.println("Envoi de la requête GET à Orthanc pour vérifier l'existence de l'instance...");
            ResponseEntity<Map> response = restTemplate.exchange(
                orthancUrl,
                HttpMethod.GET,
                requestEntity,
                Map.class
            );
            
            // Si la requête réussit, l'instance existe
            boolean exists = response.getStatusCode() == HttpStatus.OK;
            System.out.println("Réponse d'Orthanc - Status: " + response.getStatusCode() + ", Instance existe: " + exists);
            return exists;
        } catch (Exception e) {
            // En cas d'erreur, considérer que l'instance n'existe pas
            System.err.println("Erreur lors de la vérification de l'existence de l'instance DICOM: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public byte[] getDicomPreview(String orthancId) {
        try {
            // Construire l'URL pour récupérer l'aperçu de l'instance DICOM
            String orthancUrl = storageProperties.getOrthancUrl() + "/instances/" + orthancId + "/preview";
            
            // Créer les en-têtes HTTP avec authentification
            HttpHeaders headers = createOrthancAuthHeaders();
            HttpEntity<String> requestEntity = new HttpEntity<>(headers);
            
            // Envoyer la requête GET à Orthanc
            ResponseEntity<byte[]> response = restTemplate.exchange(
                orthancUrl,
                HttpMethod.GET,
                requestEntity,
                byte[].class
            );
            
            // Vérifier si la récupération a réussi
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                System.err.println("Échec de la récupération de l'aperçu DICOM depuis Orthanc");
                return new byte[0];
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération de l'aperçu DICOM: " + e.getMessage());
            return new byte[0];
        }
    }

    @Override
    public String extractOrthancId(String lienFichier) {
        if (lienFichier == null || !lienFichier.startsWith("orthanc://")) {
            return null;
        }
        
        // Extraire l'ID Orthanc (format: "orthanc://ID.dcm")
        String orthancIdWithExt = lienFichier.substring(10); // Remove "orthanc://" prefix
        
        // Supprimer l'extension .dcm si elle existe
        if (orthancIdWithExt.toLowerCase().endsWith(".dcm")) {
            return orthancIdWithExt.substring(0, orthancIdWithExt.length() - 4);
        }
        
        return orthancIdWithExt;
    }

    /**
     * Crée les en-têtes d'authentification pour Orthanc
     * @return Les en-têtes HTTP avec l'authentification Basic
     */
    private HttpHeaders createOrthancAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        
        // Récupérer les informations d'authentification depuis les propriétés
        String username = storageProperties.getOrthancUsername();
        String password = storageProperties.getOrthancPassword();
        
        // Encoder les informations d'authentification en Base64
        String auth = username + ":" + password;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        
        // Ajouter l'en-tête d'authentification
        headers.add("Authorization", "Basic " + encodedAuth);
        
        return headers;
    }
}
