package sn.hopital.gestion_hopital.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.hopital.gestion_hopital.entite.Consultation;
import sn.hopital.gestion_hopital.entite.DossierMedical;
import sn.hopital.gestion_hopital.entite.ImageMedicale;
import sn.hopital.gestion_hopital.entite.Patient;
import sn.hopital.gestion_hopital.repository.ConsultationRepository;
import sn.hopital.gestion_hopital.repository.ImageMedicaleRepository;
import sn.hopital.gestion_hopital.repository.PatientRepository;
import sn.hopital.gestion_hopital.service.DicomStorageService;
import sn.hopital.gestion_hopital.service.ImageMedicaleService;
import sn.hopital.gestion_hopital.service.StandardImageStorageService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service principal pour la gestion des images médicales
 * Délègue les opérations spécifiques aux services spécialisés
 */
@Service
public class ImageMedicaleServiceImpl implements ImageMedicaleService {

    private final PatientRepository patientRepository;
    private final ImageMedicaleRepository imageMedicaleRepository;
    private final ConsultationRepository consultationRepository;
    private final DicomStorageService dicomStorageService;
    private final StandardImageStorageService standardImageStorageService;

    @Autowired
    public ImageMedicaleServiceImpl(
            PatientRepository patientRepository,
            ImageMedicaleRepository imageMedicaleRepository,
            ConsultationRepository consultationRepository,
            DicomStorageService dicomStorageService,
            StandardImageStorageService standardImageStorageService) {
        this.patientRepository = patientRepository;
        this.imageMedicaleRepository = imageMedicaleRepository;
        this.consultationRepository = consultationRepository;
        this.dicomStorageService = dicomStorageService;
        this.standardImageStorageService = standardImageStorageService;
    }

    @Override
    public boolean isValidDicomFile(MultipartFile file) {
        return dicomStorageService.isValidDicomFile(file);
    }

    @Override
    public boolean isRealDicomFile(String lienFichier) {
        return dicomStorageService.isRealDicomFile(lienFichier);
    }
    
    /**
     * Méthode privée pour stocker une image et créer l'entité ImageMedicale
     */
    private ImageMedicale storeImageAndCreateEntity(MultipartFile file, int patientId, Consultation consultation, 
                                                  String typeImage, String description) throws IOException {
        // Vérifier si le fichier est au format DICOM
        boolean isDicom = isValidDicomFile(file);
        String filePath;

        if (isDicom) {
            // Déléguer le stockage DICOM au service spécialisé
            String orthancId = dicomStorageService.uploadDicomToOrthanc(file);
            filePath = "orthanc://" + orthancId + ".dcm";
            System.out.println("Stockage d'une image DICOM dans Orthanc avec lien: " + filePath);
        } else {
            // Déléguer le stockage standard au service spécialisé
            filePath = standardImageStorageService.storeFile(file, typeImage, patientId, description);
            System.out.println("Stockage d'une image standard dans le système de fichiers avec lien: " + filePath);
        }

        // Créer l'enregistrement de l'image
        ImageMedicale image = new ImageMedicale();
        image.setTypeImage(typeImage);
        image.setDescription(description);
        image.setLienFichier(filePath);
        image.setDate(LocalDateTime.now());
        image.setConsultation(consultation);

        // Ajouter l'image à la consultation
        if (consultation.getImages() == null) {
            consultation.setImages(new ArrayList<>());
        }
        consultation.getImages().add(image);

        // Sauvegarder l'image dans la base de données
        return imageMedicaleRepository.save(image);
    }
    
    @Override
    public ImageMedicale storeImage(MultipartFile file, int patientId, String typeImage, String description) throws IOException {
        // Vérifier si le patient existe
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new IllegalArgumentException("Patient introuvable avec l'ID: " + patientId);
        }
        
        Patient patient = patientOpt.get();
        DossierMedical dossierMedical = patient.getDossierMedical();
        
        if (dossierMedical == null || dossierMedical.getConsultation() == null || dossierMedical.getConsultation().isEmpty()) {
            throw new IllegalArgumentException("Le patient n'a aucune consultation pour stocker l'image");
        }
        
        // Utiliser la consultation la plus récente pour stocker l'image
        Consultation consultation = dossierMedical.getConsultation().get(dossierMedical.getConsultation().size() - 1);
        
        return storeImageAndCreateEntity(file, patientId, consultation, typeImage, description);
    }

    @Override
    public ImageMedicale storeImageForConsultation(MultipartFile file, UUID consultationId, String typeImage, String description) throws IOException {
        // Vérifier si la consultation existe
        Optional<Consultation> consultationOptional = consultationRepository.findById(consultationId);
        if (!consultationOptional.isPresent()) {
            throw new IllegalArgumentException("Consultation introuvable avec l'ID: " + consultationId);
        }

        Consultation consultation = consultationOptional.get();
        DossierMedical dossierMedical = consultation.getDossierMedical();
        Patient patient = dossierMedical.getPatient();
        int patientId = patient.getId();
        
        return storeImageAndCreateEntity(file, patientId, consultation, typeImage, description);
    }

    @Override
    public ImageMedicale addImageToConsultaton(int patientId, UUID consultationId, MultipartFile file, String typeImage, String description) throws IOException {
        // Vérifier si le patient existe
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new IllegalArgumentException("Patient introuvable avec l'ID: " + patientId);
        }

        // Vérifier si la consultation existe
        Optional<Consultation> consultationOptional = consultationRepository.findById(consultationId);
        if (!consultationOptional.isPresent()) {
            throw new IllegalArgumentException("Consultation introuvable avec l'ID: " + consultationId);
        }

        Consultation consultation = consultationOptional.get();
        
        // Vérifier si la consultation appartient au patient
        if (consultation.getDossierMedical() == null || 
            consultation.getDossierMedical().getPatient() == null || 
            consultation.getDossierMedical().getPatient().getId() != patientId) {
            throw new IllegalArgumentException("La consultation n'appartient pas au patient spécifié");
        }

        return storeImageAndCreateEntity(file, patientId, consultation, typeImage, description);
    }

    @Override
    public List<ImageMedicale> getImagesForPatient(int patientId) {
        // Vérifier si le patient existe
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (!patientOpt.isPresent()) {
            throw new IllegalArgumentException("Patient introuvable avec l'ID: " + patientId);
        }

        Patient patient = patientOpt.get();
        DossierMedical dossierMedical = patient.getDossierMedical();

        if (dossierMedical == null) {
            return new ArrayList<>();
        }

        List<ImageMedicale> allImages = new ArrayList<>();
        
        // Ajouter les images des consultations
        if (dossierMedical.getConsultation() != null) {
            for (Consultation consultation : dossierMedical.getConsultation()) {
                if (consultation.getImages() != null) {
                    allImages.addAll(consultation.getImages());
                }
            }
        }
        
        return allImages;
    }

    /**
     * Vérifie si une image appartient à un patient donné
     */
    private boolean imageAppartenantAuPatient(ImageMedicale image, int patientId) {
        return image.getConsultation() != null && 
               image.getConsultation().getDossierMedical() != null && 
               image.getConsultation().getDossierMedical().getPatient() != null && 
               image.getConsultation().getDossierMedical().getPatient().getId() == patientId;
    }

    @Override
    public void deleteImage(int patientId, UUID imageId) {
        // Vérifier si l'image existe
        Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
        if (!imageOpt.isPresent()) {
            throw new IllegalArgumentException("Image introuvable avec l'ID: " + imageId);
        }

        ImageMedicale image = imageOpt.get();
        
        // Vérifier si l'image appartient au patient
        if (!imageAppartenantAuPatient(image, patientId)) {
            throw new IllegalArgumentException("L'image n'appartient pas au patient spécifié");
        }
        
        String lienFichier = image.getLienFichier();
        
        // Supprimer l'image du stockage approprié
        if (lienFichier.startsWith("orthanc://")) {
            // Déléguer la suppression DICOM au service spécialisé
            String orthancId = dicomStorageService.extractOrthancId(lienFichier);
            if (orthancId != null) {
                dicomStorageService.deleteDicomInstance(orthancId);
            }
        } else {
            // Déléguer la suppression standard au service spécialisé
            try {
                standardImageStorageService.deleteFile(lienFichier);
            } catch (IOException e) {
                System.err.println("Impossible de supprimer le fichier physique: " + e.getMessage());
                // Continue with the database deletion even if file deletion fails
            }
        }
        
        // Supprimer l'image de la base de données
        imageMedicaleRepository.delete(image);
    }

    @Override
    public Resource getImageContent(int patientId, UUID imageId) throws IOException {
        // Vérifier si l'image existe
        Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
        if (!imageOpt.isPresent()) {
            throw new IllegalArgumentException("Image introuvable avec l'ID: " + imageId);
        }

        ImageMedicale image = imageOpt.get();
        
        // Vérifier si l'image appartient au patient
        if (!imageAppartenantAuPatient(image, patientId)) {
            throw new IllegalArgumentException("L'image n'appartient pas au patient spécifié");
        }
        
        return getImageContent(image);
    }

    @Override
    public Resource getImageContent(ImageMedicale image) throws IOException {
        String lienFichier = image.getLienFichier();
        
        // Utiliser isRealDicomFile pour déterminer si c'est un fichier DICOM
        if (lienFichier.startsWith("orthanc://") && isRealDicomFile(lienFichier)) {
            // Pour les images DICOM stockées dans Orthanc
            String orthancId = dicomStorageService.extractOrthancId(lienFichier);
            if (orthancId == null) {
                throw new IOException("ID Orthanc invalide dans le lien: " + lienFichier);
            }
            
            // Récupérer le contenu DICOM depuis Orthanc
            byte[] dicomContent = dicomStorageService.getDicomFile(orthancId);
            if (dicomContent.length == 0) {
                throw new IOException("Impossible de récupérer le contenu DICOM depuis Orthanc");
            }
            
            // Créer une ressource à partir du contenu binaire
            return new ByteArrayResource(dicomContent);
        } else {
            // Pour les images standards stockées dans le système de fichiers
            return standardImageStorageService.loadFileAsResource(lienFichier);
        }
    }

    @Override
    public boolean fileExists(ImageMedicale image) {
        String lienFichier = image.getLienFichier();
        
        // Utiliser isRealDicomFile pour déterminer si c'est un fichier DICOM
        if (lienFichier.startsWith("orthanc://") && isRealDicomFile(lienFichier)) {
            // Pour les images DICOM stockées dans Orthanc
            String orthancId = dicomStorageService.extractOrthancId(lienFichier);
            return orthancId != null && dicomStorageService.instanceExists(orthancId);
        } else {
            // Pour les images standards stockées dans le système de fichiers
            return standardImageStorageService.fileExists(lienFichier);
        }
    }

    @Override
    public String determineContentType(String lienFichier, String typeImage) {
        // Utiliser la méthode isRealDicomFile pour déterminer si c'est un fichier DICOM
        if (isRealDicomFile(lienFichier)) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        } else {
            return standardImageStorageService.determineContentType(lienFichier);
        }
    }

    @Override
    public byte[] getDicomPreview(int patientId, UUID imageId) throws IOException {
        // Vérifier si l'image existe
        Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
        if (!imageOpt.isPresent()) {
            throw new IllegalArgumentException("Image introuvable avec l'ID: " + imageId);
        }

        ImageMedicale image = imageOpt.get();
        
        // Vérifier si l'image appartient au patient
        if (!imageAppartenantAuPatient(image, patientId)) {
            throw new IllegalArgumentException("L'image n'appartient pas au patient spécifié");
        }
        
        String lienFichier = image.getLienFichier();
        
        // Utiliser isRealDicomFile pour déterminer si c'est un fichier DICOM
        if (isRealDicomFile(lienFichier)) {
            if (lienFichier.startsWith("orthanc://")) {
                String orthancId = dicomStorageService.extractOrthancId(lienFichier);
                if (orthancId == null) {
                    throw new IOException("ID Orthanc invalide dans le lien: " + lienFichier);
                }
                
                // Récupérer l'aperçu DICOM depuis Orthanc
                return dicomStorageService.getDicomPreview(orthancId);
            } else {
                // Pour les images DICOM stockées localement
                System.out.println("L'image DICOM est stockée localement: " + lienFichier);
                Resource resource = getImageContent(image);
                return resource.getInputStream().readAllBytes();
            }
        } else {
            // Pour les images non-DICOM, retourner le contenu de l'image directement
            Resource resource = getImageContent(image);
            return resource.getInputStream().readAllBytes();
        }
    }
    
    @Override
    public boolean instanceExists(String orthancId) {
        // Déléguer l'appel au service DicomStorageService
        return dicomStorageService.instanceExists(orthancId);
    }
    
    @Override
    public byte[] getDicomFile(String orthancId) {
        // Déléguer l'appel au service DicomStorageService
        return dicomStorageService.getDicomFile(orthancId);
    }
    
    @Override
    public String extractOrthancId(String lienFichier) {
        // Déléguer l'appel au service DicomStorageService
        return dicomStorageService.extractOrthancId(lienFichier);
    }
}
