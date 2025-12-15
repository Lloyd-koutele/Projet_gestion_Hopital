# Système de Gestion Hospitalière

Ce projet est une application complète de gestion hospitalière qui permet aux médecins, patients, chercheurs et administrateurs de gérer efficacement les dossiers médicaux, consultations, rendez-vous et plus encore.

## Table des matières
- [Présentation](#présentation)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Guide d'utilisation](#guide-dutilisation)
- [Structure du projet](#structure-du-projet)
- [API REST](#api-rest)
- [Résolution de problèmes courants](#résolution-de-problèmes-courants)

## Présentation

Le Système de Gestion Hospitalière est une solution complète développée pour faciliter la gestion quotidienne des activités hospitalières. Ce système permet de gérer les dossiers médicaux des patients, les consultations, les prescriptions, les analyses médicales, et l'imagerie médicale. Il permet également de planifier les rendez-vous et offre des interfaces spécifiques pour différents types d'utilisateurs (médecins, patients, administrateurs, chercheurs).

## Architecture

L'application suit une architecture client-serveur moderne :
- **Backend** : API REST développée avec Java Spring Boot
- **Frontend** : Application web réactive construite avec React
- **Base de données** : Stockage relationnel pour les données médicales
- **Stockage de fichiers** : Système de gestion pour les images médicales (DICOM et formats standards)

## Fonctionnalités

### Gestion des utilisateurs
- Authentification et autorisation par rôles (admin, médecin, patient, chercheur)
- Gestion des profils utilisateurs
- Création et modification des comptes

### Gestion des patients
- Création et modification des dossiers patients
- Recherche et filtrage des patients
- Visualisation des informations personnelles et médicales

### Dossier médical
- Gestion complète du dossier médical du patient
- Consultations médicales avec détails
- Suivi historique des consultations

### Consultations médicales
- Création et gestion des consultations
- Ajout d'analyses médicales
- Prescription d'ordonnances
- Gestion des images médicales (radiographies, échographies, IRM, etc.)

### Imagerie médicale
- Téléchargement et visualisation d'images médicales
- Support pour les formats DICOM et standards (JPG, PNG)
- Visionneuse spécialisée pour les images médicales

### Gestion des rendez-vous
- Planification des rendez-vous
- Vérification des disponibilités
- Notifications et rappels
- Possibilité de reporter ou annuler

### Tableaux de bord spécifiques
- Tableau de bord pour les médecins
- Tableau de bord pour les patients
- Interface d'administration

### Gestion des accès
- Partage sécurisé des dossiers médicaux
- Gestion des autorisations pour les patients
- Contrôle d'accès granulaire

## Technologies utilisées

### Backend
- Java 11+
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Gradle

### Frontend
- React
- React Router
- React Bootstrap
- Axios
- Vite (build tool)

### Autres
- JWT pour l'authentification
- Base de données (PostgreSQL)
- Système de stockage de fichiers pour les images médicales

## Installation

### Prérequis
- JDK 17 ou supérieur
- Node.js 14 ou supérieur
- npm
- Base de données PostgreSQL

### Étapes d'installation

#### Backend (Spring Boot)
1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-organisation/gestion_hopital.git
   cd gestion_hopital
   ```

2. Configurer la base de données dans `src/main/resources/application.properties`

3. Lancer l'application avec Gradle
   ```bash
   ./gradlew bootRun
   ```
   
   Le serveur démarrera sur http://localhost:8080

#### Frontend (React)
1. Naviguer vers le répertoire frontend
   ```bash
   cd hospital_frontend
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Lancer l'application en développement
   ```bash
   npm run dev
   ```
   
   L'application sera accessible sur http://localhost:5173

## Configuration

### Configuration du Backend
Le fichier `src/main/resources/application.properties` contient les configurations principales :

```properties
# Configuration de la base de données
spring.datasource.url=jdbc:mysql://localhost:3306/hopital_db
spring.datasource.username=root
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Configuration de sécurité
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# Configuration du stockage d'images médicales
storage.location=./medical-images
```

### Configuration du Frontend
Les variables d'environnement peuvent être configurées dans le fichier `.env` à la racine du dossier frontend :

```
VITE_API_BASE_URL=http://localhost:8080
```

## Guide d'utilisation

### Connexion au système
1. Accédez à l'URL de l'application (http://localhost:5173 en développement)
2. Connectez-vous avec vos identifiants selon votre rôle :
   - Administrateur : gestion des utilisateurs et paramètres
   - Médecin : gestion des patients et consultations
   - Patient : accès à son dossier médical et rendez-vous
   - Chercheur : accès aux données anonymisées

### Fonctionnalités par rôle

#### Médecin
- Accéder à la liste des patients
- Consulter et modifier les dossiers médicaux
- Créer des consultations
- Ajouter des analyses, ordonnances et images médicales
- Gérer les rendez-vous

#### Patient
- Consulter son dossier médical
- Voir ses consultations et ordonnances
- Gérer ses rendez-vous
- Contrôler les accès à son dossier médical

#### Administrateur
- Gérer les comptes utilisateurs
- Configurer les paramètres système
- Superviser les activités

## Structure du projet

### Backend (Java Spring Boot)

```
src/main/java/sn/hopital/gestion_hopital/
├── config/            # Configuration Spring
├── controller/        # Contrôleurs REST
├── dto/               # Objets de transfert de données
├── entite/            # Entités JPA
├── exception/         # Gestion des exceptions
├── repository/        # Repositories Spring Data
├── security/          # Configuration de sécurité
├── service/           # Services métier
└── util/              # Classes utilitaires
```

### Frontend (React)

```
hospital_frontend/
├── public/            # Ressources statiques
├── src/
│   ├── assets/        # Images, icônes, etc.
│   ├── auth/          # Authentification
│   ├── components/    # Composants React
│   │   ├── common/    # Composants partagés
│   │   ├── DossierMedical/    # Composants du dossier médical
│   │   ├── Patient/           # Gestion des patients
│   │   ├── PatientDashboard/  # Tableau de bord patient
│   │   └── RendezVous/        # Gestion des rendez-vous
│   ├── hooks/         # Hooks personnalisés
│   ├── pages/         # Pages principales
│   ├── services/      # Services API
│   ├── styles/        # Styles CSS
│   └── utils/         # Fonctions utilitaires
```

## API REST

L'API REST est organisée selon les ressources principales suivantes :

### Authentification
- `POST /api/auth/login` - Authentification
- `POST /api/auth/register` - Inscription (si applicable)

### Patients
- `GET /api/medecin/patients` - Liste des patients
- `GET /api/medecin/patients/{id}` - Détails d'un patient
- `POST /api/medecin/patients` - Création d'un patient

### Dossier médical
- `GET /api/medecin/patients/{id}/dossier-medical/consultations` - Liste des consultations
- `POST /api/medecin/patients/{id}/dossier-medical/consultations` - Ajout d'une consultation
- `GET /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}` - Détails d'une consultation

### Analyses
- `GET /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/analyses` - Liste des analyses
- `POST /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/analyses` - Ajout d'une analyse

### Ordonnances
- `GET /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/ordonnances` - Liste des ordonnances
- `POST /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/ordonnances` - Ajout d'une ordonnance

### Images médicales
- `GET /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/images` - Liste des images
- `POST /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/images` - Ajout d'une image
- `GET /api/medecin/patients/{id}/dossier-medical/consultations/{consultationId}/images/{imageId}/file` - Téléchargement d'une image

### Rendez-vous
- `GET /api/rendez-vous` - Liste des rendez-vous
- `POST /api/rendez-vous` - Création d'un rendez-vous
- `PUT /api/rendez-vous/{id}` - Mise à jour d'un rendez-vous
- `DELETE /api/rendez-vous/{id}` - Annulation d'un rendez-vous

### Utilisateurs
- `GET /api/admin/users` - Liste des utilisateurs (admin)
- `POST /api/admin/users` - Création d'un utilisateur (admin)
- `PUT /api/admin/users/{id}` - Mise à jour d'un utilisateur (admin)

## Résolution de problèmes courants

### Problème: Les analyses/ordonnances s'affichent dans une autre consultation
- **Solution**: Vérifiez que l'ID de consultation est correctement passé lors de la création d'analyses ou d'ordonnances.

### Problème: Erreur lors du chargement des images DICOM
- **Solution**: Assurez-vous que les bibliothèques de traitement DICOM sont correctement installées et configurées.

### Problème: Échec d'authentification
- **Solution**: Vérifiez la validité du token JWT et la configuration de sécurité dans le backend.

### Problème: Erreur "404 Not Found" pour les API
- **Solution**: Vérifiez les URLs des endpoints et assurez-vous que le serveur backend est en cours d'exécution.

---

---

© 2025 Système de Gestion Hospitalière. Tous droits réservés.
