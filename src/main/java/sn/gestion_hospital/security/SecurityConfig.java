package sn.gestion_hospital.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import sn.gestion_hospital.repository.UserRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {

        private final JwtService jwtService;

        public SecurityConfig(JwtService jwtService) {
                this.jwtService = jwtService;
        }

        /*
         * =========================
         * JWT FILTER
         * =========================
         */
        @Bean
        public JwtAuthFilter jwtAuthFilter(
                        JwtService jwtService,
                        UserDetailsService userDetailsService) {

                return new JwtAuthFilter(jwtService, userDetailsService);
        }

        /*
         * =========================
         * SECURITY FILTER CHAIN
         * =========================
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                // API REST + JWT → CSRF off
                                .csrf(csrf -> csrf.disable())

                                // CORS
                                .cors(cors -> cors.configurationSource(request -> {
                                        CorsConfiguration config = new CorsConfiguration();
                                        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
                                        config.setAllowedMethods(Arrays.asList(
                                                        "GET", "POST", "PUT", "DELETE", "OPTIONS"));
                                        config.setAllowedHeaders(Arrays.asList("*"));
                                        config.setExposedHeaders(Arrays.asList("Authorization"));
                                        config.setAllowCredentials(true);
                                        return config;
                                }))

                                // Stateless
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Gestion des erreurs
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, e) -> {
                                                        res.setStatus(401);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                                                })
                                                .accessDeniedHandler((req, res, e) -> {
                                                        res.setStatus(403);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\":\"Forbidden\",\"message\":\"Access denied\"}");
                                                }))

                                // Autorisations
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/api/login").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/register").permitAll()
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/medecin/**").hasRole("MEDECIN")
                                                .requestMatchers("/api/chercheur/**").hasRole("CHERCHEUR")
                                                .requestMatchers("/api/patient/**")
                                                .hasAnyRole("PATIENT", "MEDECIN")
                                                .anyRequest().authenticated())

                                // Filtre JWT
                                .addFilterBefore(
                                                jwtAuthFilter(jwtService, userDetailsService(null)),
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /*
         * =========================
         * USER DETAILS SERVICE
         * =========================
         */
        @Bean
        public UserDetailsService userDetailsService(UserRepository userRepository) {

                return email -> userRepository.findByEmail(email)
                                .map(user -> User.builder()
                                                .username(user.getEmail())
                                                .password(user.getPassword())
                                                .authorities("ROLE_" + user.getRoles().name())
                                                .disabled(!user.isActif())
                                                .build())
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Utilisateur non trouvé : " + email));
        }

        /*
         * =========================
         * PASSWORD ENCODER
         * =========================
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        /*
         * =========================
         * AUTHENTICATION MANAGER
         * =========================
         */
        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
