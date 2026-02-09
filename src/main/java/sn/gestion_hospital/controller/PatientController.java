package sn.gestion_hospital.controller;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sn.gestion_hospital.entite.Analyses;
import sn.gestion_hospital.entite.AutorisationAccesPatient;
import sn.gestion_hospital.entite.Consultation;
import sn.gestion_hospital.entite.DossierMedical;
import sn.gestion_hospital.entite.ImageMedicale;
import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.entite.Ordonnance;
import sn.gestion_hospital.entite.Patient;
import sn.gestion_hospital.repository.AnalyseRepository;
import sn.gestion_hospital.repository.ImageMedicaleRepository;
import sn.gestion_hospital.repository.OrdonnanceRepository;
import sn.gestion_hospital.repository.PatientRepository;
import sn.gestion_hospital.service.AutorisationService;
import sn.gestion_hospital.service.ConsultationService;
import sn.gestion_hospital.service.ImageMedicaleService;
import sn.gestion_hospital.service.PatientService;
import sn.gestion_hospital.service.MedecinService;

@RequestMapping("/api/patient")
@RestController
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private ConsultationService consultationService;

    @Autowired
    private AutorisationService autorisationService;

    @Autowired
    private MedecinService medecinService;

    @Autowired
    private ImageMedicaleRepository imageMedicaleRepository;

    @Autowired
    private OrdonnanceRepository ordonnanceRepository;

    @Autowired
    private AnalyseRepository analyseRepository;

    @Autowired
    private ImageMedicaleService imageMedicaleService;

    private Optional<Patient> getPatientConnecte() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = null;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return patientService.getPatientByEmail(email);
    }

    @Secured("ROLE_PATIENT")
    @GetMapping("/dossier-medical")
    public ResponseEntity<?> getMonDossierMedical() 
    {
        try 
        {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) 
            {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non authentifié");
            }

            Patient patient = patientOpt.get();
            DossierMedical dossierMedical = patient.getDossierMedical();

            if (dossierMedical != null) 
            {
                return ResponseEntity.ok(dossierMedical);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération du dossier médical: " + e.getMessage());
        }
    }

    // @Secured("ROLE_PATIENT")
    // @GetMapping("/mes-consultations")
    // public ResponseEntity<?> getMesConsultations() {
    // try {
    // // Récupérer le patient connecté
    // Optional<Patient> patientOpt = getPatientConnecte();
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non
    // authentifié");
    // }

    // Patient patient = patientOpt.get();
    // List<Consultation> consultations =
    // patient.getDossierMedical().getConsultation();

    // return ResponseEntity.ok(consultations);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().body("Erreur lors de la
    // récupération des consultations: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_PATIENT")
    // @GetMapping("/mes-consultations/{consultationId}")
    // public ResponseEntity<?> getConsultation(@PathVariable UUID consultationId) {
    // try {
    // // Récupérer le patient connecté
    // Optional<Patient> patientOpt = getPatientConnecte();
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non
    // authentifié");
    // }

    // Patient patient = patientOpt.get();

    // // Récupérer la consultation
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient connecté
    // if (consultation.getDossierMedical().getPatient().getId() != patient.getId())
    // {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Cette consultation ne vous appartient pas");
    // }

    // return ResponseEntity.ok(consultation);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().body("Erreur lors de la
    // récupération de la consultation: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_PATIENT")
    // @GetMapping("/mes-acces")
    // public ResponseEntity<?> getMesMedecinsAcces() {
    // try {
    // // Récupérer le patient connecté
    // Optional<Patient> patientOpt = getPatientConnecte();
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non
    // authentifié");
    // }

    // Patient patient = patientOpt.get();

    // // Récupérer les autorisations
    // List<AutorisationAccesPatient> autorisations =
    // autorisationService.getMedecinsAvecAcces(patient);

    // // Convertir en DTO (comme dans
    // AutorisationController.listerMedecinsAvecAcces)
    // List<AutorisationController.AutorisationResponse> responses =
    // autorisations.stream()
    // .map(AutorisationController.AutorisationResponse::new)
    // .collect(Collectors.toList());

    // return ResponseEntity.ok(responses);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().body("Erreur lors de la
    // récupération des médecins: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_PATIENT")
    // @org.springframework.web.bind.annotation.PostMapping("/acces-medecin")
    // public ResponseEntity<?>
    // accorderAccesMedecin(@org.springframework.web.bind.annotation.RequestBody
    // AccorderAccesRequest request) {
    // try {
    // // Récupérer le patient connecté
    // Optional<Patient> patientOpt = getPatientConnecte();
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non
    // authentifié");
    // }

    // Patient patient = patientOpt.get();

    // // Récupérer le médecin
    // Optional<Medecin> medecinOpt =
    // medecinService.getMedecinById(request.getMedecinId());
    // if (!medecinOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Medecin medecin = medecinOpt.get();

    // // Par défaut, accorder un accès en lecture seule (le plus restrictif)
    // NiveauAcces niveauAcces = NiveauAcces.LECTURE_SEULE;

    // // Accorder l'accès
    // AutorisationAccesPatient autorisation =
    // autorisationService.creerAutorisationParPatient(
    // patient, medecin, niveauAcces, request.getDateExpiration());

    // return ResponseEntity.ok(new
    // AutorisationController.AutorisationResponse(autorisation));
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().body("Erreur lors de
    // l'attribution de l'accès: " + e.getMessage());
    // }
    // }

    /**
     * DTO pour la requête d'accord d'accès
     */
    public static class AccorderAccesRequest {
        private Long medecinId;
        private LocalDateTime dateExpiration;

        public Long getMedecinId() {
            return medecinId;
        }

        public void setMedecinId(Long medecinId) {
            this.medecinId = medecinId;
        }

        public LocalDateTime getDateExpiration() {
            return dateExpiration;
        }

        public void setDateExpiration(LocalDateTime dateExpiration) {
            this.dateExpiration = dateExpiration;
        }
    }

    @Secured("ROLE_PATIENT")
    @org.springframework.web.bind.annotation.DeleteMapping("/acces-medecin/{medecinId}")
    public ResponseEntity<?> revoquerAccesMedecin(@PathVariable Long medecinId) {
        try {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non authentifié");
            }

            Patient patient = patientOpt.get();

            // Récupérer le médecin
            Optional<Medecin> medecinOpt = medecinService.getMedecinById(medecinId);
            if (!medecinOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Medecin medecin = medecinOpt.get();

            // Vérifier si une autorisation existe pour ce médecin et ce patient
            Optional<AutorisationAccesPatient> autorisationOpt = autorisationService
                    .getAutorisationByMedecinAndPatient(medecin, patient);

            if (!autorisationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Révoquer l'accès
            autorisationService.revoquerAutorisationParPatient(autorisationOpt.get().getId(), patient);

            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Accès révoqué avec succès",
                    "medecinId", medecinId,
                    "patientId", patient.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la révocation de l'accès: " + e.getMessage());
        }
    }

    @Secured("ROLE_PATIENT")
    @GetMapping("/consultations/{consultationId}/analyses")
    public ResponseEntity<?> getAnalysesConsultation(@PathVariable UUID consultationId) {
        try {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non authentifié");
            }

            Patient patient = patientOpt.get();

            // Récupérer la consultation
            Optional<Consultation> consultationOpt = consultationService.findById(consultationId);
            if (!consultationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Consultation consultation = consultationOpt.get();

            // Vérifier que la consultation appartient bien au patient connecté
            if (consultation.getDossierMedical().getPatient().getId() != patient.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Cette consultation ne vous appartient pas");
            }

            // Récupérer les analyses liées à cette consultation
            List<Analyses> analyses = consultation.getAnalyses();

            return ResponseEntity.ok(analyses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des analyses: " + e.getMessage());
        }
    }

    @Secured("ROLE_PATIENT")
    @GetMapping("/consultations/{consultationId}/ordonnances")
    public ResponseEntity<?> getOrdonnancesConsultation(@PathVariable UUID consultationId) {
        try {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non authentifié");
            }

            Patient patient = patientOpt.get();

            // Récupérer la consultation
            Optional<Consultation> consultationOpt = consultationService.findById(consultationId);
            if (!consultationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Consultation consultation = consultationOpt.get();

            // Vérifier que la consultation appartient bien au patient connecté
            if (consultation.getDossierMedical().getPatient().getId() != patient.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Cette consultation ne vous appartient pas");
            }

            // Récupérer les ordonnances liées à cette consultation
            List<Ordonnance> ordonnances = consultation.getOrdonnances();

            return ResponseEntity.ok(ordonnances);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des ordonnances: " + e.getMessage());
        }
    }

    @Secured("ROLE_PATIENT")
    @GetMapping("/consultations/{consultationId}/images")
    public ResponseEntity<?> getImagesConsultation(@PathVariable UUID consultationId) {
        try {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Patient non authentifié");
            }

            Patient patient = patientOpt.get();

            // Récupérer la consultation
            Optional<Consultation> consultationOpt = consultationService.findById(consultationId);
            if (!consultationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Consultation consultation = consultationOpt.get();

            // Vérifier que la consultation appartient bien au patient connecté
            if (consultation.getDossierMedical().getPatient().getId() != patient.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Cette consultation ne vous appartient pas");
            }

            // Récupérer les images liées à cette consultation
            List<ImageMedicale> images = consultation.getImages();

            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des images: " + e.getMessage());
        }
    }

    @Secured("ROLE_PATIENT")
    @GetMapping("/images/{imageId}/content")
    public ResponseEntity<org.springframework.core.io.Resource> getImageContent(@PathVariable UUID imageId) {
        try {
            // Récupérer le patient connecté
            Optional<Patient> patientOpt = getPatientConnecte();
            if (!patientOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Patient patient = patientOpt.get();

            // Récupérer l'image
            Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
            if (!imageOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            ImageMedicale image = imageOpt.get();

            // Vérifier que l'image appartient bien au patient connecté
            boolean belongsToPatient = false;
            if (image.getConsultation() != null &&
                    image.getConsultation().getDossierMedical() != null &&
                    image.getConsultation().getDossierMedical().getPatient() != null &&
                    image.getConsultation().getDossierMedical().getPatient().getId() == patient.getId()) {
                belongsToPatient = true;
            }

            if (!belongsToPatient) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Réutiliser la logique existante pour récupérer le contenu de l'image
            String lienFichier = image.getLienFichier();
            String typeImage = image.getTypeImage();

            // Même logique de récupération que dans MedecinController.getImageContent
            org.springframework.core.io.Resource imageResource;
            String contentType = "image/jpeg"; // Par défaut

            if (lienFichier.startsWith("orthanc://") && lienFichier.toLowerCase().endsWith(".dcm")) {
                // Pour les images DICOM
                String orthancId = imageMedicaleService.extractOrthancId(lienFichier);

                if (!imageMedicaleService.instanceExists(orthancId)) {
                    return ResponseEntity.notFound().build();
                }

                byte[] dicomContent = imageMedicaleService.getDicomFile(orthancId);
                contentType = "application/dicom";

                imageResource = new org.springframework.core.io.ByteArrayResource(dicomContent);
            } else if (lienFichier.startsWith("http://") || lienFichier.startsWith("https://")) {
                // Pour les images distantes
                try {
                    java.net.URL url = new java.net.URL(lienFichier);
                    imageResource = new org.springframework.core.io.UrlResource(url);
                    contentType = determineContentType(lienFichier, typeImage);
                } catch (java.net.MalformedURLException e) {
                    return ResponseEntity.badRequest().body(null);
                }
            } else {
                // Pour les images locales
                java.nio.file.Path filePath = new java.io.File(lienFichier).toPath();

                if (!java.nio.file.Files.exists(filePath)) {
                    return ResponseEntity.notFound().build();
                }

                imageResource = new org.springframework.core.io.FileSystemResource(filePath);
                contentType = determineContentType(lienFichier, typeImage);
            }

            if (!imageResource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header("Cache-Control", "max-age=86400")
                    .body(imageResource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @Secured("ROLE_PATIENT")
    @GetMapping()
    public ResponseEntity<?> verifyPatientAccess() {
        // Récupérer le patient connecté
        Optional<Patient> patientOpt = getPatientConnecte();
        if (!patientOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Utilisateur non authentifié ou pas un patient");
        }

        Patient patient = patientOpt.get();

        return ResponseEntity.ok(java.util.Map.of(
                "message", "Accès patient vérifié avec succès",
                "patientId", patient.getId(),
                "email", patient.getEmail(),
                "nom", patient.getNom(),
                "prenom", patient.getPrenom(),
                "role", "PATIENT"));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkPatientByEmail(@RequestParam String email) {
        try {
            Optional<Patient> patientOpt = patientService.getPatientByEmail(email);

            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                // Ne retourner que les informations de base pour des raisons de sécurité
                return ResponseEntity.ok(
                        java.util.Map.of(
                                "exists", true,
                                "active", patient.isActif(),
                                "id", patient.getId()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("exists", false, "message", "Aucun patient trouvé avec cet email"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Erreur lors de la vérification: " + e.getMessage()));
        }
    }

    /**
     * Détermine le type de contenu en fonction du lien du fichier et du type
     * d'image
     */
    private String determineContentType(String lienFichier, String typeImage) {
        if (lienFichier == null || lienFichier.isEmpty()) {
            return "image/jpeg";
        }

        String contentType = "image/jpeg";
        String normalizedPath = lienFichier.replace("\\", "/").toLowerCase();

        String extension = "";
        int lastDotIndex = normalizedPath.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < normalizedPath.length() - 1) {
            extension = normalizedPath.substring(lastDotIndex + 1).toLowerCase();
        }

        switch (extension) {
            case "png":
                contentType = "image/png";
                break;
            case "jpg":
            case "jpeg":
                contentType = "image/jpeg";
                break;
            case "gif":
                contentType = "image/gif";
                break;
            case "bmp":
                contentType = "image/bmp";
                break;
            case "dcm":
                contentType = "application/dicom";
                break;
            case "pdf":
                contentType = "application/pdf";
                break;
            case "tiff":
            case "tif":
                contentType = "image/tiff";
                break;
            default:
                if (typeImage != null) {
                    if (typeImage.toLowerCase().contains("dicom") ||
                            normalizedPath.contains("dicom") ||
                            normalizedPath.contains("orthanc")) {
                        contentType = "application/dicom";
                    }
                }
                break;
        }

        if (lienFichier.startsWith("orthanc://")) {
            contentType = "application/dicom";
        }

        return contentType;
    }
}
