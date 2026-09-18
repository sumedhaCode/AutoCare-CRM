package com.autocare.crm.controller;

import com.autocare.crm.entity.Mechanic;
import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.MechanicRepository;
import com.autocare.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mechanics")
public class MechanicController {

    @Autowired
    private MechanicRepository mechanicRepository;

    @Autowired
    private UserRepository userRepository;

    // --------------------------------------------------
    // ADD MECHANIC (STRICT ADMIN + GARAGE ISOLATION)
    // --------------------------------------------------
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addMechanic(@RequestBody Mechanic mechanic) {

        if (mechanic.getEmail() == null || mechanic.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mechanic email is required.");
        }

        User admin = getCurrentLoggedInAdmin();
        Long adminId = admin.getUserId();

        String email = mechanic.getEmail().trim().toLowerCase();

        // 🔍 Find STAFF user
        User staff = userRepository.findByEmail(email).orElse(null);

        if (staff == null || staff.getRole() != Role.ROLE_STAFF) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("The mechanic is not registered");
        }

        // ==================================================
        // 🚫 HARD GARAGE OWNERSHIP VALIDATION (SOURCE OF TRUTH)
        // ==================================================

        // Staff MUST be linked to a garage at registration
        if (staff.getGarageName() == null || staff.getGarageAddress() == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Staff is not linked to any garage. Please register staff with a garage first.");
        }

        // Admin MUST have garage details
        if (admin.getGarageName() == null || admin.getGarageAddress() == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin garage details are missing.");
        }

        // 🚫 BLOCK cross-garage access (STRICT MATCH)
        if (!staff.getGarageName().trim().equalsIgnoreCase(admin.getGarageName().trim())
                || !staff.getGarageAddress().trim().equalsIgnoreCase(admin.getGarageAddress().trim())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("This mechanic belongs to another garage");
        }

        // ==================================================
        // 🚨 SAFETY CHECK — garage ↔ adminId data corruption
        // ==================================================
        if (staff.getAdminId() != null
                && staff.getGarageName().trim().equalsIgnoreCase(admin.getGarageName().trim())
                && staff.getGarageAddress().trim().equalsIgnoreCase(admin.getGarageAddress().trim())
                && !staff.getAdminId().equals(adminId)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Data integrity issue: staff garage matches but admin ownership does not.");
        }

        // 🔥 HARD STOP — STAFF BELONGS TO ANOTHER ADMIN
        if (staff.getAdminId() != null && !staff.getAdminId().equals(adminId)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("This staff member belongs to another garage");
        }

        // 🔒 Prevent duplicate mechanic in same garage
        if (mechanicRepository.existsByEmailAndAdminId(email, adminId)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Mechanic already exists in your garage");
        }

        mechanic.setEmail(email);
        mechanic.setName(
                mechanic.getName() != null ? mechanic.getName() : staff.getName()
        );
        mechanic.setAdminId(adminId);

        mechanicRepository.save(mechanic);

        return ResponseEntity.ok("✅ Mechanic added successfully");
    }

    // --------------------------------------------------
    // GET MY MECHANICS
    // --------------------------------------------------
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Mechanic> getMyMechanics() {
        User admin = getCurrentLoggedInAdmin();
        return mechanicRepository.findByAdminId(admin.getUserId());
    }

    // --------------------------------------------------
    // DELETE MECHANIC
    // --------------------------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMechanic(@PathVariable Long id) {

        User admin = getCurrentLoggedInAdmin();

        Mechanic mechanic = mechanicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        if (!admin.getUserId().equals(mechanic.getAdminId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        mechanicRepository.delete(mechanic);
        return ResponseEntity.ok("🗑️ Mechanic deleted");
    }

    // --------------------------------------------------
    // CURRENT ADMIN
    // --------------------------------------------------
    private User getCurrentLoggedInAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new RuntimeException("Unauthorized");
        }

        User admin = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Only admins can perform this action");
        }

        return admin;
    }
}
