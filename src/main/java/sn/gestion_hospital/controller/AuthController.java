package sn.gestion_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sn.gestion_hospital.service.AuthService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController 
{

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthService.AuthResponse> login(@RequestBody AuthService.LoginRequest request) 
    {

        AuthService.AuthResponse response = authService.authenticate(request);

        if (!response.isSuccess()) 
        {
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthService.AuthResponse> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) 
    {

        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(authService.logout());
    }
}
