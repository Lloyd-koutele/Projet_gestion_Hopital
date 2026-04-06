package sn.gestion_hospital.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Base64;
import java.util.function.Function;
import java.util.UUID;
import sn.gestion_hospital.entite.User;

@Service
public class JwtService 
{
    static final String PREFIX = "Bearer ";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private Key getSigningKey() 
    {
        byte[] keyBytes = Base64.getDecoder().decode(
            Base64.getEncoder().encodeToString(secret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
        

    // Générer un token JWT
    public String generateToken(User user) {
        return PREFIX + Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(user.getEmail())
                .claim("role", user.getRoles().name())
                .claim("nom", user.getNom())
                .claim("prenom", user.getPrenom())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public long getExpirationTime()
    {
        return expirationTime;
    }
    // Extraire l'email (username) depuis le token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraire n'importe quelle info du token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    // Vérifier validité du token
    public boolean isTokenValid(String token, String userEmail) {
        final String username = extractUsername(token);
        return username.equals(userEmail) && !isTokenExpired(token);
    }

    // Vérifie si le token est expiré
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Supprime le préfixe Bearer et décode le token
    private Claims parseToken(String token) {
        if (token.startsWith(PREFIX)) {
            token = token.replace(PREFIX, "");
        }
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
