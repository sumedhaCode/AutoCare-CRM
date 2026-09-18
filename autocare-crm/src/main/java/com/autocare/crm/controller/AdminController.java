package com.autocare.crm.controller;

import com.autocare.crm.entity.RenewalRequest;
import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.ServiceEntity;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.RenewalRequestRepository;
import com.autocare.crm.repository.UserRepository;
import com.autocare.crm.service.ServiceService;
import com.autocare.crm.service.UserService;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // ✅ CORRECT IMPORT
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RenewalRequestRepository renewalRequestRepository;

    @PostMapping("/addService")
    public ServiceEntity addService(@RequestBody ServiceEntity service) {
        return serviceService.addService(service);
    }

    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "Welcome to the Admin Dashboard!";
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsersByRoleQuery(@RequestParam String role) {
        return ResponseEntity.ok(userRepository.findByRole(Role.valueOf(role)));
    }

    @GetMapping("/users/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // ✅ FIXED ENDPOINT
    @PostMapping("/renewal-requests")
    public RenewalRequest requestRenewal(
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        User admin = userRepository.findByEmail(auth.getName())
                .orElseThrow();

     // 🔴 NEW: block duplicate pending requests
        boolean alreadyPending =
                renewalRequestRepository.existsByAdminAndStatus(admin, "PENDING");

        if (alreadyPending) {
            throw new RuntimeException(
                    "You already have a pending renewal request"
            );
        }
        RenewalRequest req = new RenewalRequest();
        req.setAdmin(admin);
        req.setRequestedDuration(body.get("duration"));
        req.setRequestedAt(LocalDateTime.now());
        req.setStatus("PENDING");

     // 🔴 FORCE subscription to EXPIRED before saving request
     admin.setSubscriptionStatus("EXPIRED");
     userRepository.save(admin);

     return renewalRequestRepository.save(req);

    }
} 