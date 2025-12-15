package sn.hopital.gestion_hopital.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig
{
    
    @Bean
    public OpenAPI orthancOpenAPI()
    {
        return new OpenAPI()
            .info(new Info()
                .title("API de Gestion Hospitalière Orthanc")
                .description("API REST pour la gestion des utilisateurs de l'hôpital (Admin, Docteur, Chercheur)")
                .version("1.0")
                .contact(new Contact()
                    .name("Support Orthanc")
                    .email("support@orthanc.sn"))
                .license(new License()
                    .name("License")
                    .url("https://orthanc.sn/licenses")))
            .components(new Components()
                .addSecuritySchemes("cookieAuth",
                new SecurityScheme()
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.COOKIE)
                    .name("JSESSIONID")
                    .description("Session HTTP via cookie")));
    }
}
