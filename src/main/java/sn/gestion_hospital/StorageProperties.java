package sn.gestion_hospital;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties 
{
    
    private String basePath;
    private String scannerPath;
    private String radiographyPath;
    private String mriPath;
    private String ultrasoundPath;
    private String otherPath;
    
    // Orthanc configuration
    private String orthancUrl;
    private String orthancUsername;
    private String orthancPassword;
    
    // Default constructor with default values
    public StorageProperties() 
    {
        this.basePath = "medical-images";
        
        // Utiliser Path.resolve pour construire correctement les chemins
        java.nio.file.Path base = java.nio.file.Paths.get(basePath);
        this.scannerPath = base.resolve("scanner").toString();
        this.radiographyPath = base.resolve("radiographie").toString();
        this.mriPath = base.resolve("irm").toString();
        this.ultrasoundPath = base.resolve("echographie").toString();
        this.otherPath = base.resolve("autre").toString();
        
        // Default Orthanc configuration
        this.orthancUrl = "http://localhost:8042";
        this.orthancUsername = "orthanc";
        this.orthancPassword = "orthanc";
    }
    
    // Getters and setters
    public String getBasePath() 
    {
        return basePath;
    }
    
    public void setBasePath(String basePath) 
    {
        this.basePath = basePath;
        // Update dependent paths using java.nio.file.Paths to handle path construction correctly
        java.nio.file.Path base = java.nio.file.Paths.get(basePath);
        this.scannerPath = base.resolve("scanner").toString();
        this.radiographyPath = base.resolve("radiographie").toString();
        this.mriPath = base.resolve("irm").toString();
        this.ultrasoundPath = base.resolve("echographie").toString();
        this.otherPath = base.resolve("autre").toString();
    }
    
    public String getScannerPath() 
    {
        return scannerPath;
    }
    
    public void setScannerPath(String scannerPath) 
    {
        this.scannerPath = scannerPath;
    }
    
    public String getRadiographyPath() 
    {
        return radiographyPath;
    }
    
    public void setRadiographyPath(String radiographyPath) 
    {
        this.radiographyPath = radiographyPath;
    }
    
    public String getMriPath() 
    {
        return mriPath;
    }
    
    public void setMriPath(String mriPath) 
    {
        this.mriPath = mriPath;
    }
    
    public String getUltrasoundPath() 
    {
        return ultrasoundPath;
    }
    
    public void setUltrasoundPath(String ultrasoundPath) 
    {
        this.ultrasoundPath = ultrasoundPath;
    }
    
    public String getOtherPath() 
    {
        return otherPath;
    }
    
    public void setOtherPath(String otherPath) 
    {
        this.otherPath = otherPath;
    }
    
    public String getOrthancUrl() 
    {
        return orthancUrl;
    }
    
    public void setOrthancUrl(String orthancUrl) 
    {
        this.orthancUrl = orthancUrl;
    }
    
    public String getOrthancUsername() 
    {
        return orthancUsername;
    }
    
    public void setOrthancUsername(String orthancUsername) 
    {
        this.orthancUsername = orthancUsername;
    }
    
    public String getOrthancPassword() 
    {
        return orthancPassword;
    }
    
    public void setOrthancPassword(String orthancPassword) 
    {
        this.orthancPassword = orthancPassword;
    }
    
    public String getPathForExamType(String examType, int patientId) 
    {
        String baseFolderPath;
        // Normaliser le type pour correspondre aux dossiers
        switch(examType.toLowerCase()) 
        {
            case "scanner":
                baseFolderPath = scannerPath;
                break;
            case "radiographie":
                baseFolderPath = radiographyPath;
                break;
            case "irm":
                baseFolderPath = mriPath;
                break;
            case "echographie":
                baseFolderPath = ultrasoundPath;
                break;
            case "mammographie":
                // Utiliser le chemin base + mammographie si pas défini spécifiquement
                baseFolderPath = java.nio.file.Paths.get(basePath).resolve("mammographie").toString();
                break;
            case "angiographie":
                // Utiliser le chemin base + angiographie si pas défini spécifiquement
                baseFolderPath = java.nio.file.Paths.get(basePath).resolve("angiographie").toString();
                break;
            default:
                baseFolderPath = otherPath;
                break;
        }
        
        // Utiliser Path.resolve pour construire correctement le chemin
        java.nio.file.Path base = java.nio.file.Paths.get(baseFolderPath);
        // Utiliser simplement l'ID du patient comme nom de dossier
        return base.resolve(String.valueOf(patientId)).toString();
    }
}
