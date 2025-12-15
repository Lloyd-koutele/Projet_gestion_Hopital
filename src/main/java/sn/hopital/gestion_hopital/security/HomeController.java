package sn.hopital.gestion_hopital.security;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController
{
    
    @GetMapping("/")
    public String home()
    {
        return "Bienvenue dans l'application de gestion hospitalière";
    }
}
