package sn.gestion_hospital.controller;

import java.util.Optional;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
//import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.client.RestTemplate;
import jakarta.validation.Valid;

//import sn.gestion_hospital.exception.BusinessException;
import sn.gestion_hospital.repository.PatientRepository;
import sn.gestion_hospital.repository.ImageMedicaleRepository;
import sn.gestion_hospital.service.ConsultationService;
import sn.gestion_hospital.service.ImageMedicaleService;
import sn.gestion_hospital.entite.Patient;
//import sn.gestion_hospital.entite.DossierMedical;
import sn.gestion_hospital.entite.Consultation;
import sn.gestion_hospital.entite.Ordonnance;
import sn.gestion_hospital.StorageProperties;
import sn.gestion_hospital.entite.Analyses;
import sn.gestion_hospital.entite.ImageMedicale;
import sn.gestion_hospital.entite.Medecin;
import sn.gestion_hospital.service.MedecinService;
import sn.gestion_hospital.service.PatientService;
import sn.gestion_hospital.service.AutorisationService;
import sn.gestion_hospital.dto.PatientCreationDTO;

@RequestMapping("/api/medecin")
@RestController
public class MedecinController 
{
    private final PatientRepository patientRepository;
    private final ConsultationService consultationService;
    private final ImageMedicaleService imageMedicaleService;
    private final ImageMedicaleRepository imageMedicaleRepository;

    @Autowired
    private MedecinService medecinService;

    @Autowired
    private AutorisationService autorisationService;

    @Autowired
    private StorageProperties storageProperties;

    @Autowired
    private PatientService patientService;

    private final RestTemplate restTemplate = new RestTemplate();

    public MedecinController(PatientRepository patientRepository, 
        ConsultationService consultationService, 
        ImageMedicaleService imageMedicaleService, 
        ImageMedicaleRepository imageMedicaleRepository) 
    {
        this.patientRepository = patientRepository;
        this.consultationService = consultationService;
        this.imageMedicaleService = imageMedicaleService;
        this.imageMedicaleRepository = imageMedicaleRepository;
    }

    @Data
    @Schema(description = "Réponse à la création du patient")
    public static class CreatePatientReponse 
    {
        @Schema(description = "Message de confirmation", example = "Patient créé avec succès")
        private String message;

        public CreatePatientReponse(String message) 
        {
            this.message = message;
        }

        public String getMessage() 
        {
            return message;
        }

        public void setMessage(String message) 
        {
            this.message = message;
        }
    }

    @Secured("ROLE_MEDECIN")
    @PostMapping("/create-patient")
    public ResponseEntity<?> createPatient(@Valid @RequestBody PatientCreationDTO patientDTO, @PathVariable Long medecinId) 
    {
        return ResponseEntity.ok(patientService.createPatient(patientDTO, medecinId));
    }

    @Secured("ROLE_MEDECIN")
    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        try {
            // Récupérer le médecin connecté
            Optional<Medecin> medecinConnecteOpt = medecinService.getMedecinConnecte();
            if (!medecinConnecteOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non authentifié");
            }

            Medecin medecinConnecte = medecinConnecteOpt.get();

            // Récupérer tous les patients auxquels le médecin a accès
            List<Patient> patients = autorisationService.getPatientsAccessibles(medecinConnecte);

            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des patients: " + e.getMessage());
        }
    }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical")
    // public ResponseEntity<?> getDossierMedical(@PathVariable int patientId) {
    // try {
    // // Vérifier si le patient existe
    // Optional<Patient> patient = patientRepository.findById(patientId);
    // if (!patient.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // Medecin medecin;
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId, medecin)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // // Récupérer le dossier médical
    // DossierMedical dossierMedical = patient.get().getDossierMedical();
    // if (dossierMedical != null) {
    // return ResponseEntity.ok(dossierMedical);
    // } else {
    // return ResponseEntity.notFound().build();
    // }
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().build();
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @PutMapping("/patients/{patientId}/dossier-medical")
    // public ResponseEntity<?> updateDossierMedical(@PathVariable int patientId,
    // @Valid @RequestBody DossierMedical dossierMedical) {
    // try {
    // System.out.println("Début de updateDossierMedical pour patientId=" +
    // patientId);
    // System.out.println("Données reçues: " + dossierMedical);
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Patient patient = patientOpt.get();
    // DossierMedical existingDossier = patient.getDossierMedical();

    // // Mise à jour des champs du dossier médical
    // existingDossier.setSexe(dossierMedical.getSexe());
    // existingDossier.setGroupeSanguin(dossierMedical.getGroupeSanguin());
    // existingDossier.setContexte(dossierMedical.getContexte());
    // existingDossier.setPoids(dossierMedical.getPoids());
    // existingDossier.setTaille(dossierMedical.getTaille());

    // patientRepository.save(patient);
    // return ResponseEntity.ok(existingDossier);
    // } catch (Exception e) {
    // System.out.println("Erreur lors de la mise à jour du dossier médical: " +
    // e.getMessage());
    // e.printStackTrace();
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la mise à jour du dossier médical: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @PutMapping("/patients/{patientId}/consultations")
    // public ResponseEntity<?> ajouterConsultation(@PathVariable int patientId,
    // @Valid @RequestBody Consultation consultation) {
    // try {
    // // Récupérer le patient
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Récupérer le médecin connecté
    // Optional<Medecin> medecinConnecteOpt = medecinService.getMedecinConnecte();
    // if (!medecinConnecteOpt.isPresent()) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non
    // authentifié");
    // }

    // Medecin medecinConnecte = medecinConnecteOpt.get();

    // // Remplacer les informations du médecin par celles du médecin connecté
    // consultation.setNomMedecin(medecinConnecte.getNom() + " " +
    // medecinConnecte.getPrenom());
    // consultation.setNumeroMedecin(medecinConnecte.getTelephone());

    // // Associer la consultation au dossier médical du patient
    // Patient patient = patientOpt.get();
    // DossierMedical dossier = patient.getDossierMedical();
    // dossier.ajouterConsultation(consultation);

    // patientRepository.save(patient);
    // return ResponseEntity.ok(consultation);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de l'ajout de la consultation: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/consultations")
    // public ResponseEntity<?> getConsultation(@PathVariable int patientId) {
    // try {
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // Patient patient = patientOpt.get();
    // List<Consultation> consultations =
    // patient.getDossierMedical().getConsultation();

    // return ResponseEntity.ok(consultations);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération des consultations: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}")
    // public ResponseEntity<?> getConsultationById(@PathVariable int patientId,
    // @PathVariable UUID consultationId) {
    // try {
    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }

    // return ResponseEntity.ok(consultation);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération de la consultation: " +
    // e.getMessage());
    // }
    // }

    @Secured("ROLE_MEDECIN")
    @PostMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/ordonnances")
    public ResponseEntity<?> ajouterOrdonnanceConsultation(
            @PathVariable Long patientId,
            @PathVariable UUID consultationId,
            @Valid @RequestBody Ordonnance ordonnance) {
        try {
            // Vérifier que le patient existe
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (!patientOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Vérifier que la consultation existe
            Optional<Consultation> consultationOpt = consultationService.findById(consultationId);
            if (!consultationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Consultation consultation = consultationOpt.get();

            // Vérifier que la consultation appartient bien au patient
            if (consultation.getDossierMedical().getPatient().getId() != patientId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("La consultation n'appartient pas au patient spécifié");
            }

            // Récupérer le médecin connecté pour ajouter ses informations à l'ordonnance
            Optional<Medecin> medecinConnecteOpt = medecinService.getMedecinConnecte();
            if (!medecinConnecteOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non authentifié");
            }

            Medecin medecinConnecte = medecinConnecteOpt.get();

            // Remplacer les informations du médecin par celles du médecin connecté
            ordonnance.setNomMedecin(medecinConnecte.getNom() + " " + medecinConnecte.getPrenom());
            ordonnance.setNumMedecin(medecinConnecte.getTelephone());

            // Associer l'ordonnance à la consultation
            ordonnance.setConsultation(consultation);
            consultation.getOrdonnances().add(ordonnance);

            // Sauvegarder la consultation mis à jour
            consultationService.saveConsultation(consultation);

            return ResponseEntity.ok(ordonnance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de l'ajout de l'ordonnance à la consultation: " + e.getMessage());
        }
    }

    @Secured("ROLE_MEDECIN")
    @PostMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/analyses")
    public ResponseEntity<?> ajouterAnalyseConsultation(
            @PathVariable Long patientId,
            @PathVariable UUID consultationId,
            @Valid @RequestBody Analyses analyse) {
        try {
            // Vérifier que le patient existe
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (!patientOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Vérifier que la consultation existe
            Optional<Consultation> consultationOpt = consultationService.findById(consultationId);
            if (!consultationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Consultation consultation = consultationOpt.get();

            // Vérifier que la consultation appartient bien au patient
            if (consultation.getDossierMedical().getPatient().getId() != patientId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("La consultation n'appartient pas au patient spécifié");
            }

            // Associer l'analyse à la consultation
            analyse.setConsultation(consultation);
            consultation.getAnalyses().add(analyse);

            // Sauvegarder la consultation mis à jour
            consultationService.saveConsultation(consultation);

            return ResponseEntity.ok(analyse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de l'ajout de l'analyse à la consultation: " + e.getMessage());
        }
    }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/ordonnances")
    // public ResponseEntity<?> getOrdonnancesConsultation(
    // @PathVariable int patientId,
    // @PathVariable UUID consultationId) {
    // try {
    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }

    // return ResponseEntity.ok(consultation.getOrdonnances());
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération des ordonnances: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/analyses")
    // public ResponseEntity<?> getAnalysesConsultation(
    // @PathVariable int patientId,
    // @PathVariable UUID consultationId) {
    // try {
    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }

    // return ResponseEntity.ok(consultation.getAnalyses());
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération des analyses: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/images")
    // public ResponseEntity<?> getImagesConsultation(
    // @PathVariable int patientId,
    // @PathVariable UUID consultationId) {
    // try {
    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }

    // return ResponseEntity.ok(consultation.getImages());
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération des images: " + e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @PostMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/images")
    // public ResponseEntity<?> ajouterImageConsultation(
    // @PathVariable int patientId,
    // @PathVariable UUID consultationId,
    // @org.springframework.web.bind.annotation.RequestParam("file")
    // org.springframework.web.multipart.MultipartFile file,
    // @org.springframework.web.bind.annotation.RequestParam("typeImage") String
    // typeImage,
    // @org.springframework.web.bind.annotation.RequestParam("description") String
    // description) {
    // try {
    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // return ResponseEntity.notFound().build();
    // }

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }

    // // Utiliser le service pour ajouter l'image à la consultation
    // ImageMedicale image = imageMedicaleService.addImageToConsultaton(patientId,
    // consultationId, file, typeImage,
    // description);

    // // Sauvegarder la consultation mise à jour
    // consultationService.saveConsultation(consultation);

    // return ResponseEntity.ok(image);
    // } catch (Exception e) {
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de l'ajout de l'image à la consultation: " +
    // e.getMessage());
    // }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/images/{imageId}/file")
    // public ResponseEntity<?> getImageFile(
    // @PathVariable int patientId,
    // @PathVariable UUID consultationId,
    // @PathVariable UUID imageId) {
    // try {
    // System.out.println("=== DEBUG getImageFile ===");
    // System.out.println("PatientId: " + patientId);
    // System.out.println("ConsultationId: " + consultationId);
    // System.out.println("ImageId: " + imageId);

    // // Vérifier que le patient existe
    // Optional<Patient> patientOpt = patientRepository.findById(patientId);
    // if (!patientOpt.isPresent()) {
    // System.out.println("ERREUR: Patient non trouvé avec ID: " + patientId);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Patient trouvé: " + patientOpt.get().getNom());

    // // Vérifier si le médecin connecté a accès à ce patient
    // if (!autorisationService.verifierAccesMedecinConnecte(patientId)) {
    // System.out.println("ERREUR: Médecin n'a pas accès au patient: " + patientId);
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("Vous n'avez pas accès à ce patient");
    // }
    // System.out.println("Accès médecin vérifié");

    // // Vérifier que la consultation existe
    // Optional<Consultation> consultationOpt =
    // consultationService.findById(consultationId);
    // if (!consultationOpt.isPresent()) {
    // System.out.println("ERREUR: Consultation non trouvée avec ID: " +
    // consultationId);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Consultation trouvée: " +
    // consultationOpt.get().getType());

    // Consultation consultation = consultationOpt.get();

    // // Vérifier que la consultation appartient bien au patient
    // if (consultation.getDossierMedical().getPatient().getId() != patientId) {
    // System.out.println("ERREUR: Consultation n'appartient pas au patient");
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("La consultation n'appartient pas au patient spécifié");
    // }
    // System.out.println("Consultation appartient au patient");

    // // Trouver l'image par son ID
    // Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
    // if (!imageOpt.isPresent()) {
    // System.out.println("ERREUR: Image non trouvée avec ID: " + imageId);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Image trouvée: " + imageOpt.get().getDescription());

    // ImageMedicale image = imageOpt.get();

    // // Vérifier que l'image appartient bien à la consultation
    // System.out.println("Nombre d'images dans la consultation: " +
    // consultation.getImages().size());
    // if (!consultation.getImages().contains(image)) {
    // System.out.println("ERREUR: Image n'appartient pas à la consultation");
    // System.out.println("Images de la consultation:");
    // for (ImageMedicale img : consultation.getImages()) {
    // System.out.println(" - " + img.getId() + ": " + img.getDescription());
    // }
    // return ResponseEntity.status(HttpStatus.FORBIDDEN)
    // .body("L'image n'appartient pas à la consultation spécifiée");
    // }
    // System.out.println("Image appartient à la consultation");

    // // Récupérer le fichier
    // String lienFichier = image.getLienFichier();
    // if (lienFichier == null || lienFichier.isEmpty()) {
    // System.out.println("ERREUR: Lien fichier null ou vide");
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Lien fichier: " + lienFichier);

    // byte[] fileData;
    // String contentType;

    // // Vérifier si c'est une image DICOM stockée sur Orthanc
    // if (lienFichier.startsWith("orthanc://")) {
    // System.out.println("Image DICOM détectée, utilisation du service DICOM");

    // // Extraire l'ID Orthanc du lien fichier
    // String orthancId = imageMedicaleService.extractOrthancId(lienFichier);
    // if (orthancId == null) {
    // System.out.println("ERREUR: ID Orthanc invalide dans le lien: " +
    // lienFichier);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("ID Orthanc extrait: " + orthancId);

    // // Vérifier si l'instance existe sur Orthanc
    // if (!imageMedicaleService.instanceExists(orthancId)) {
    // System.out.println("ERREUR: Instance DICOM non trouvée sur Orthanc avec ID: "
    // + orthancId);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Instance DICOM trouvée sur Orthanc");

    // // Récupérer le fichier DICOM depuis Orthanc
    // fileData = imageMedicaleService.getDicomFile(orthancId);
    // if (fileData.length == 0) {
    // System.out.println("ERREUR: Impossible de récupérer le contenu DICOM depuis
    // Orthanc");
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Fichier DICOM récupéré avec succès, " + fileData.length +
    // " bytes");

    // contentType = "application/dicom";
    // } else {
    // // Pour les images standard stockées dans le système de fichiers
    // System.out.println("Image standard détectée, accès au système de fichiers");

    // // Construire le chemin complet en préfixant avec le chemin de base
    // String cheminComplet = storageProperties.getBasePath() + "/" + lienFichier;
    // System.out.println("Chemin complet: " + cheminComplet);

    // // Déterminer le type de contenu
    // contentType = determineContentType(lienFichier, image.getTypeImage());
    // System.out.println("Type de contenu: " + contentType);

    // // Lire le fichier et le renvoyer comme une ressource
    // java.io.File file = new java.io.File(cheminComplet);
    // if (!file.exists()) {
    // System.out.println("ERREUR: Fichier physique n'existe pas: " +
    // cheminComplet);
    // return ResponseEntity.notFound().build();
    // }
    // System.out.println("Fichier physique existe, taille: " + file.length() + "
    // bytes");

    // // Convertir le fichier en tableau d'octets
    // fileData = java.nio.file.Files.readAllBytes(file.toPath());
    // System.out.println("Fichier lu avec succès, " + fileData.length + " bytes");
    // }

    // return ResponseEntity.ok()
    // .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
    // .body(fileData);
    // } catch (Exception e) {
    // System.out.println("EXCEPTION dans getImageFile: " + e.getMessage());
    // e.printStackTrace();
    // return ResponseEntity.internalServerError()
    // .body("Erreur lors de la récupération du fichier image: " + e.getMessage());
    // }
    // }

    /**
     * Détermine le type de contenu en fonction du lien du fichier et du type
     * d'image
     */
    private String determineContentType(String lienFichier, String typeImage) {
        if (lienFichier == null || lienFichier.isEmpty()) {
            System.out.println("ATTENTION: Lien de fichier null ou vide, utilisation du type par défaut (image/jpeg)");
            return "image/jpeg";
        }

        // Par défaut
        String contentType = "image/jpeg";

        // Normaliser le chemin pour éviter les problèmes de séparateurs
        String normalizedPath = lienFichier.replace("\\", "/").toLowerCase();

        // Extraire l'extension du fichier
        String extension = "";
        int lastDotIndex = normalizedPath.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < normalizedPath.length() - 1) {
            extension = normalizedPath.substring(lastDotIndex + 1).toLowerCase();
        }

        // Déterminer le type MIME en fonction de l'extension
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
                // Si l'extension n'est pas reconnue, on garde le type par défaut
                break;
        }

        return contentType;
    }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/images/{imageId}/preview")
    // public ResponseEntity<org.springframework.core.io.Resource> getDicomPreview(
    //         @PathVariable Long patientId,
    //         @PathVariable UUID consultationId,
    //         @PathVariable UUID imageId) {
    //     try {
    //         System.out.println("Début de getDicomPreview pour patientId=" + patientId + ", imageId=" + imageId);

    //         // Vérifier que le patient existe
    //         Optional<Patient> patientOpt = patientRepository.findById(patientId);
    //         if (!patientOpt.isPresent()) {
    //             System.out.println("Patient non trouvé avec ID: " + patientId);
    //             return ResponseEntity.notFound().build();
    //         }

    //         // Utiliser directement le repository pour récupérer l'image
    //         Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
    //         if (!imageOpt.isPresent()) {
    //             System.out.println("Image non trouvée avec ID: " + imageId);
    //             return ResponseEntity.notFound().build();
    //         }

    //         // Vérifier que l'image appartient bien au patient spécifié
    //         ImageMedicale image = imageOpt.get();
    //         boolean belongsToPatient = false;

    //         // Vérifier si l'image est associée à un antécédent du patient
    //         if (!belongsToPatient && image.getConsultation() != null &&
    //                 image.getConsultation().getDossierMedical() != null &&
    //                 image.getConsultation().getDossierMedical().getPatient() != null &&
    //                 image.getConsultation().getDossierMedical().getPatient().getId() == patientId) {
    //             belongsToPatient = true;
    //         }

    //         if (!belongsToPatient) {
    //             System.out.println("L'image n'appartient pas au patient spécifié");
    //             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //         }

    //         String lienFichier = image.getLienFichier();

    //         // Vérification simple et directe : une image est DICOM si et seulement si elle
    //         // a l'extension .dcm
    //         boolean isDicom = lienFichier.toLowerCase().endsWith(".dcm");

    //         System.out.println("L'image est une image DICOM (extension .dcm): " + lienFichier);

    //         // Pour les images DICOM stockées dans Orthanc
    //         if (lienFichier.startsWith("orthanc://")) {
    //             // Extraire l'ID Orthanc (sans le préfixe "orthanc://" et sans l'extension
    //             // ".dcm")
    //             String orthancIdWithExt = lienFichier.substring(10); // Remove "orthanc://" prefix
    //             String orthancId = orthancIdWithExt.substring(0, orthancIdWithExt.length() - 4); // Remove ".dcm"

    //             System.out
    //                     .println("Génération de la prévisualisation pour l'image DICOM avec ID Orthanc: " + orthancId);
    //             String url = storageProperties.getOrthancUrl() + "/instances/" + orthancId + "/preview";

    //             HttpHeaders headers = createOrthancAuthHeaders();
    //             HttpEntity<String> entity = new HttpEntity<>(headers);

    //             ResponseEntity<byte[]> response = restTemplate.exchange(
    //                     url,
    //                     HttpMethod.GET,
    //                     entity,
    //                     byte[].class);

    //             // Créer une ressource à partir du contenu binaire
    //             org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(
    //                     response.getBody());

    //             return ResponseEntity.ok()
    //                     .contentType(MediaType.IMAGE_PNG)
    //                     .contentLength(resource.contentLength())
    //                     .body(resource);
    //         } else {
    //             // Pour les images DICOM stockées localement
    //             System.out.println("L'image DICOM est stockée localement: " + lienFichier);
    //             return getImageContent(patientId, imageId);
    //         }
    //     } catch (Exception e) {
    //         System.out.println("Erreur lors de la récupération de l'aperçu DICOM: " + e.getMessage());
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().build();
    //     }
    // }

    // @Secured("ROLE_MEDECIN")
    // @GetMapping("/patients/{patientId}/dossier-medical/consultations/{consultationId}/images/{imageId}/dicom")
    // public ResponseEntity<org.springframework.core.io.Resource> getDicomContent(
    //         @PathVariable Long patientId,
    //         @PathVariable UUID consultationId,
    //         @PathVariable UUID imageId) {
    //     try {
    //         System.out.println("=== DÉBUT DE LA RÉCUPÉRATION DE L'IMAGE ===");
    //         System.out.println("Patient ID: " + patientId);
    //         System.out.println("Image ID: " + imageId);

    //         // Vérifier que le patient existe
    //         Optional<Patient> patientOpt = patientRepository.findById(patientId);
    //         if (!patientOpt.isPresent()) {
    //             System.out.println("ERREUR: Patient non trouvé avec ID: " + patientId);
    //             return ResponseEntity.notFound().build();
    //         }

    //         // Utiliser directement le repository pour récupérer l'image
    //         Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
    //         if (!imageOpt.isPresent()) {
    //             System.out.println("ERREUR: Image non trouvée avec ID: " + imageId);
    //             return ResponseEntity.notFound().build();
    //         }

    //         ImageMedicale image = imageOpt.get();
    //         System.out.println("Image trouvée: " + image.getLienFichier());

    //         // Vérifier que l'image appartient bien au patient spécifié
    //         boolean belongsToPatient = false;

    //         // Vérifier si l'image est associée à une consultation du patient
    //         if (!belongsToPatient && image.getConsultation() != null &&
    //                 image.getConsultation().getDossierMedical() != null &&
    //                 image.getConsultation().getDossierMedical().getPatient() != null &&
    //                 image.getConsultation().getDossierMedical().getPatient().getId() == patientId) {
    //             belongsToPatient = true;
    //             System.out.println("Image associée à une consultation du patient");
    //         }

    //         if (!belongsToPatient) {
    //             System.out.println("ERREUR: L'image n'appartient pas au patient spécifié");
    //             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //         }

    //         String lienFichier = image.getLienFichier();
    //         System.out.println("Lien du fichier: " + lienFichier);

    //         // Vérification simple et directe : une image est DICOM si et seulement si elle
    //         // a l'extension .dcm
    //         boolean isDicom = lienFichier.toLowerCase().endsWith(".dcm");
    //         System.out.println("Est une image DICOM: " + isDicom);

    //         // Pour les images DICOM stockées dans Orthanc
    //         if (lienFichier.startsWith("orthanc://")) {
    //             String orthancIdWithExt = lienFichier.substring(10);
    //             String orthancId = orthancIdWithExt.substring(0, orthancIdWithExt.length() - 4);
    //             System.out.println("ID Orthanc extrait: " + orthancId);

    //             String url = storageProperties.getOrthancUrl() + "/instances/" + orthancId + "/preview";
    //             System.out.println("URL Orthanc: " + url);

    //             HttpHeaders headers = createOrthancAuthHeaders();
    //             HttpEntity<String> entity = new HttpEntity<>(headers);

    //             try {
    //                 ResponseEntity<byte[]> response = restTemplate.exchange(
    //                         url,
    //                         HttpMethod.GET,
    //                         entity,
    //                         byte[].class);

    //                 System.out.println("Réponse Orthanc reçue, taille: "
    //                         + (response.getBody() != null ? response.getBody().length : 0) + " octets");

    //                 org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(
    //                         response.getBody());

    //                 return ResponseEntity.ok()
    //                         .contentType(MediaType.IMAGE_PNG)
    //                         .contentLength(resource.contentLength())
    //                         .body(resource);
    //             } catch (Exception e) {
    //                 System.out.println("ERREUR lors de l'appel à Orthanc: " + e.getMessage());
    //                 e.printStackTrace();
    //                 return ResponseEntity.internalServerError().build();
    //             }
    //         } else {
    //             System.out.println("L'image DICOM est stockée localement");
    //             return getImageContent(patientId, imageId);
    //         }
    //     } catch (Exception e) {
    //         System.out.println("ERREUR GÉNÉRALE: " + e.getMessage());
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().build();
    //     }
    // }

    @Secured("ROLE_MEDECIN")
    @GetMapping("/info")
    public ResponseEntity<?> getMedecinConnecteInfo() {
        try {
            System.out.println("Récupération des informations du médecin connecté");

            // Récupérer le médecin connecté
            Optional<Medecin> medecinConnecteOpt = medecinService.getMedecinConnecte();
            if (!medecinConnecteOpt.isPresent()) {
                System.out.println("Aucun médecin connecté trouvé");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Médecin non authentifié");
            }

            Medecin medecinConnecte = medecinConnecteOpt.get();
            System.out.println("Médecin connecté trouvé avec ID: " + medecinConnecte.getId());

            // Créer un objet simplifié avec les informations essentielles du médecin
            java.util.Map<String, Object> medecinInfo = new java.util.HashMap<>();
            medecinInfo.put("id", medecinConnecte.getId());
            medecinInfo.put("nom", medecinConnecte.getNom());
            medecinInfo.put("prenom", medecinConnecte.getPrenom());
            medecinInfo.put("email", medecinConnecte.getEmail());
            medecinInfo.put("telephone", medecinConnecte.getTelephone());

            return ResponseEntity.ok(medecinInfo);
        } catch (Exception e) {
            System.out
                    .println("Erreur lors de la récupération des informations du médecin connecté: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des informations du médecin: " + e.getMessage());
        }
    }

    @Secured("ROLE_MEDECIN")
    @GetMapping("/search")
    public ResponseEntity<?> getAllMedecinsForSearch() {
        try {
            System.out.println("Récupération de tous les médecins actifs pour la recherche");

            // Récupérer tous les médecins actifs
            List<Medecin> medecins = medecinService.getAllMedecinsActifs();

            System.out.println("Nombre de médecins actifs trouvés: " + medecins.size());
            return ResponseEntity.ok(medecins);
        } catch (Exception e) {
            System.out.println("Erreur lors de la récupération des médecins: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la récupération des médecins: " + e.getMessage());
        }
    }

    private HttpHeaders createOrthancAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();

        // Ajouter l'authentification si nécessaire (Basic Auth)
        if (storageProperties.getOrthancUsername() != null && !storageProperties.getOrthancUsername().isEmpty() &&
                storageProperties.getOrthancPassword() != null && !storageProperties.getOrthancPassword().isEmpty()) {

            String auth = storageProperties.getOrthancUsername() + ":" + storageProperties.getOrthancPassword();
            String encodedAuth = java.util.Base64.getEncoder()
                    .encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String authHeader = "Basic " + encodedAuth;
            headers.set("Authorization", authHeader);
        }

        return headers;
    }

    public ResponseEntity<org.springframework.core.io.Resource> getImageContent(Long patientId, UUID imageId) {
        try {
            System.out.println("=== DÉBUT DE LA RÉCUPÉRATION DE L'IMAGE (getImageContent) ===");
            System.out.println("Patient ID: " + patientId);
            System.out.println("Image ID: " + imageId);

            // Vérifier que le patient existe
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (!patientOpt.isPresent()) {
                System.out.println("ERREUR: Patient non trouvé avec ID: " + patientId);
                return ResponseEntity.notFound().build();
            }

            // Utiliser directement le repository pour récupérer l'image
            Optional<ImageMedicale> imageOpt = imageMedicaleRepository.findById(imageId);
            if (!imageOpt.isPresent()) {
                System.out.println("ERREUR: Image non trouvée avec ID: " + imageId);
                return ResponseEntity.notFound().build();
            }

            ImageMedicale image = imageOpt.get();
            System.out.println("Image trouvée: " + image.getLienFichier());

            // Vérifier que l'image appartient bien au patient spécifié
            boolean belongsToPatient = false;

            // Vérifier si l'image est associée à une consultation du patient
            if (!belongsToPatient && image.getConsultation() != null &&
                    image.getConsultation().getDossierMedical() != null &&
                    image.getConsultation().getDossierMedical().getPatient() != null &&
                    image.getConsultation().getDossierMedical().getPatient().getId() == patientId) {
                belongsToPatient = true;
                System.out.println("Image associée à une consultation du patient");
            }

            if (!belongsToPatient) {
                System.out.println("ERREUR: L'image n'appartient pas au patient spécifié");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            String lienFichier = image.getLienFichier();
            System.out.println("Lien du fichier: " + lienFichier);

            // Construire le chemin complet en préfixant avec le chemin de base
            String cheminComplet = storageProperties.getBasePath() + "/" + lienFichier;
            System.out.println("Chemin complet: " + cheminComplet);

            // Déterminer le type de contenu
            String contentType = determineContentType(lienFichier, image.getTypeImage());
            System.out.println("Type de contenu: " + contentType);

            // Lire le fichier et le renvoyer comme une ressource
            java.io.File file = new java.io.File(cheminComplet);
            if (!file.exists()) {
                System.out.println("ERREUR: Fichier physique n'existe pas: " + cheminComplet);
                return ResponseEntity.notFound().build();
            }

            System.out.println("Fichier physique existe, taille: " + file.length() + " bytes");

            // Créer une ressource à partir du fichier
            org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception e) {
            System.out.println("ERREUR GÉNÉRALE dans getImageContent: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
