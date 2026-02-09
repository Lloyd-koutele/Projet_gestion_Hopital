package sn.gestion_hospital.service;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sn.gestion_hospital.entite.ImageMedicale;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class ImageMedicaleService {

    public boolean isValidDicomFile(MultipartFile file) {
        return false;
    }

    public boolean isRealDicomFile(String lienFichier) {
        return false;
    }

    public ImageMedicale storeImage(
            MultipartFile file,
            int patientId,
            String typeImage,
            String description) throws IOException {
        return null;
    }

    public ImageMedicale storeImageForConsultation(
            MultipartFile file,
            UUID antecedentId,
            String typeImage,
            String description) throws IOException {
        return null;
    }

    public ImageMedicale addImageToConsultaton(
            int patientId,
            UUID antecedentId,
            MultipartFile file,
            String typeImage,
            String description) throws IOException {
        return null;
    }

    public List<ImageMedicale> getImagesForPatient(int patientId) {
        return List.of();
    }

    public void deleteImage(int patientId, UUID imageId) {
    }

    public Resource getImageContent(int patientId, UUID imageId) throws IOException {
        return null;
    }

    public Resource getImageContent(ImageMedicale image) throws IOException {
        return null;
    }

    public boolean fileExists(ImageMedicale image) {
        return false;
    }

    public String determineContentType(String lienFichier, String typeImage) {
        return "application/octet-stream";
    }

    public byte[] getDicomPreview(int patientId, UUID imageId) throws IOException {
        return new byte[0];
    }

    public boolean instanceExists(String orthancId) {
        return false;
    }

    public byte[] getDicomFile(String orthancId) {
        return new byte[0];
    }

    public String extractOrthancId(String lienFichier) {
        return null;
    }
}
