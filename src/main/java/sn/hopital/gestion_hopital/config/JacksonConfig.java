package sn.hopital.gestion_hopital.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Désactiver les fonctionnalités qui peuvent causer des problèmes
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Configurer le module JavaTime pour gérer les dates Java 8
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Configurer les sérialiseurs et désérialiseurs pour LocalDate
        javaTimeModule.addSerializer(LocalDate.class, 
                new LocalDateSerializer(DateTimeFormatter.ofPattern(DATE_FORMAT)));
        javaTimeModule.addDeserializer(LocalDate.class, 
                new LocalDateDeserializer(DateTimeFormatter.ofPattern(DATE_FORMAT)));
        
        // Configurer les sérialiseurs et désérialiseurs pour LocalDateTime
        javaTimeModule.addSerializer(LocalDateTime.class, 
                new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)));
        javaTimeModule.addDeserializer(LocalDateTime.class, 
                new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)));
        
        // Permettre la conversion de date simple à LocalDateTime
        javaTimeModule.addDeserializer(LocalDateTime.class, 
                new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DATE_FORMAT)) {
                    @Override
                    public LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p, 
                                                   com.fasterxml.jackson.databind.DeserializationContext ctxt) 
                            throws java.io.IOException {
                        String value = p.getValueAsString();
                        try {
                            // Essayer d'abord le format standard
                            return super.deserialize(p, ctxt);
                        } catch (Exception e) {
                            // Si le format standard échoue, essayer de parser comme une date simple
                            // et ajouter l'heure à minuit
                            if (value != null && value.length() == 10) { // Format YYYY-MM-DD
                                return LocalDate.parse(value, DateTimeFormatter.ofPattern(DATE_FORMAT))
                                        .atStartOfDay();
                            }
                            throw new java.io.IOException("Impossible de parser la date: " + value, e);
                        }
                    }
                });
        
        objectMapper.registerModule(javaTimeModule);
        
        return objectMapper;
    }
}
