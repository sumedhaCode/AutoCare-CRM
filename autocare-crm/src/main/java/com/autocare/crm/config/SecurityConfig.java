package com.autocare.crm.config;

import com.autocare.crm.auth.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess ->
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

                /* 🔓 AUTH */
                .requestMatchers("/api/auth/**").permitAll()

                /* 🔍 PUBLIC GARAGE SEARCH (BOOKING FLOW) */
                .requestMatchers("/api/public/garages/**").permitAll()


                /* 🚗 VEHICLES (PUBLIC READ) */
                .requestMatchers(HttpMethod.GET, "/api/vehicles/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/vehicles/**")
                    .permitAll()

                /* 🧾 SERVICES */
                .requestMatchers(HttpMethod.GET, "/api/services")
                    .hasAnyRole("USER", "ADMIN")

                /* 🧑 CUSTOMER */
                .requestMatchers("/api/customer/**")
                    .hasRole("USER")

                /* 📅 BOOKINGS */
                .requestMatchers(HttpMethod.GET, "/api/bookings/**")
                    .hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/**")
                    .hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/**")
                    .hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**")
                    .hasRole("ADMIN")

                /* 👨‍🔧 MECHANICS */
                .requestMatchers(HttpMethod.GET, "/api/mechanics")
                    .hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/mechanics")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/mechanics/**")
                    .hasRole("ADMIN")

                /* 🛠️ ADMIN */
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                /* 👑 SUPER ADMIN */
                .requestMatchers("/api/superadmin/**")
                    .hasRole("SUPER_ADMIN")

                /* 🧑‍🔧 STAFF */
                .requestMatchers("/api/staff/**")
                    .hasRole("STAFF")

                /* 👥 USERS */
                .requestMatchers(HttpMethod.GET, "/api/users")
                    .hasRole("ADMIN")

                /* 🔒 EVERYTHING ELSE */
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // ✅ ADD PATCH HERE (THIS IS THE FIX)
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
