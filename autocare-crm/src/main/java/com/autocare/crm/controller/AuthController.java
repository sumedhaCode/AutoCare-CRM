package com.autocare.crm.controller;

import com.autocare.crm.auth.AuthRequestDTO;
import com.autocare.crm.auth.AuthResponseDTO;
import com.autocare.crm.auth.JwtUtil;
import com.autocare.crm.dto.RegisterRequestDTO;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.UserRepository;
import com.autocare.crm.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // --------------------------------------------------
    // REGISTER (STRICT EMAIL VALIDATION)
    // --------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequestDTO registerRequest
    ) {
        try {
            String email = registerRequest.getEmail();

            if (email == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            email = email.trim().toLowerCase();

            // ✅ STRICT EMAIL FORMAT (lowercase, valid structure)
            String emailRegex = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";

            if (!email.matches(emailRegex)) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Invalid email format. Use lowercase letters only (e.g. name@gmail.com)");
            }

            // Update normalized email back to DTO
            registerRequest.setEmail(email);

            // ✅ SINGLE SOURCE OF TRUTH
            userService.registerUser(registerRequest);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("User registered successfully");

        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }

    // --------------------------------------------------
    // LOGIN (UNCHANGED & CORRECT)
    // --------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {

            User user = userRepository.findByEmail(authRequest.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Email not registered");
        }

        if (user.isSuspended()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Account is suspended");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            String token = jwtUtil.generateToken(user);

            return ResponseEntity.ok(
                    new AuthResponseDTO(
                            "Login successful",
                            user.getRole().name(),
                            token
                    )
            );

        } catch (BadCredentialsException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Incorrect password");
        }
    }
}
