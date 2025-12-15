package sn.hopital.gestion_hopital;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.main.allow-bean-definition-overriding=true"
})
class GestionHopitalApplicationTests {

    @Test
    void contextLoads() {
        // Test de base pour vérifier que le contexte Spring se charge correctement
    }

}
