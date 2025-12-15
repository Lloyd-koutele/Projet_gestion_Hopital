package sn.hopital.gestion_hopital.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService
{

    // durée de validité du token : 24h
    static final long EXPIRATIONTIME = 86_400_000; // 1 jour en millisecondes
    static final String PREFIX = "Bearer ";

    // Clé secrète générée dynamiquement (à usage de démo)
    static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Générer un token JWT
    public String generateToken(String username, String role)
    {
        return PREFIX + Jwts.builder()
                .setSubject(username)   
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATIONTIME))
                .signWith(key)
                .compact();
    }

    // Extraire l'email (username) depuis le token
    public String extractUsername(String token)
    {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraire n'importe quelle info du token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver)
    {
        final Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    // Vérifier validité du token
    public boolean isTokenValid(String token, String userEmail)
    {
        final String username = extractUsername(token);
        return username.equals(userEmail) && !isTokenExpired(token);
    }

    // Vérifie si le token est expiré
    private boolean isTokenExpired(String token)
    {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token)
    {
        return extractClaim(token, Claims::getExpiration);
    }

    // Supprime le préfixe Bearer et décode le token
    private Claims parseToken(String token)
    {
        if (token.startsWith(PREFIX))
        {
            token = token.replace(PREFIX, "");
        }
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
