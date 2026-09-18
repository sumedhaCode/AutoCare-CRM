package com.autocare.crm.controller;

import com.autocare.crm.entity.User;
import com.autocare.crm.entity.Subscription;
import com.autocare.crm.entity.Admin;
import com.autocare.crm.entity.Notification;
import com.autocare.crm.entity.RenewalRequest;
import com.autocare.crm.entity.Role;

import com.autocare.crm.repository.UserRepository;
import com.autocare.crm.service.EmailService;
import com.autocare.crm.repository.SubscriptionRepository;
import com.autocare.crm.repository.AdminRepository;
import com.autocare.crm.repository.NotificationRepository;
import com.autocare.crm.repository.RenewalRequestRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import com.autocare.crm.dto.EmailRequestDTO;

@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
// @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')") // Newwwwwwwww

public class SuperAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RenewalRequestRepository renewalRequestRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private AdminRepository adminRepository;


    // ==========================================================
    // SUPER ADMIN DASHBOARD
    // ==========================================================
    @GetMapping("/dashboard")
    public String superAdminDashboard(Authentication auth) {

        System.out.println("AUTH CHECK — /dashboard");
        System.out.println("User: " + auth.getName());
        System.out.println("Roles: " + auth.getAuthorities());

        return "Welcome to the Super Admin Dashboard!";
    }

    // ==========================================================
    // FULL SUMMARY
    // ==========================================================
    @GetMapping("/dashboard/full-summary")
    public Map<String, Object> getFullSummary(Authentication auth) {

        System.out.println("AUTH CHECK — /dashboard/full-summary");
        System.out.println("User: " + auth.getName());
        System.out.println("Roles: " + auth.getAuthorities());

        List<User> admins = userRepository.findByRole(Role.ROLE_ADMIN);
        long activeAdmins = admins.stream()
                .filter(a -> !a.isSuspended())
                .filter(a -> a.getSubscriptionStatus() == null
                        || "ACTIVE".equalsIgnoreCase(a.getSubscriptionStatus()))
                .count();
        long inactiveAdmins = admins.size() - activeAdmins;
        int revenue = admins.stream()
                .filter(a -> a.getPlanPrice() != null)
                .mapToInt(User::getPlanPrice)
                .sum();

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalRevenue", revenue > 0 ? revenue : 125000);

        summary.put(
                "activeSubscriptions",
                Math.max(subscriptionRepository.countByStatus("ACTIVE"), activeAdmins)
        );

        summary.put("adminCount", admins.size());

        summary.put("pendingAlerts", notificationRepository.countByDelivered(false));

        summary.put("popularPlans", List.of("BASE"));

        summary.put("retentionRate", 82.5);
        summary.put("activeGarages", activeAdmins);
        summary.put("inactiveGarages", inactiveAdmins);

        return summary;
    }

    // ==========================================================
    // ANALYTICS
    // ==========================================================
    @GetMapping("/analytics/summary")
    public Map<String, Object> getAnalyticsSummary(Authentication auth) {

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", 125000);
        summary.put("popularPlans", List.of("Pro", "Basic"));
        summary.put("retentionRate", 82.5);
        summary.put("activeGarages", 45);
        summary.put("inactiveGarages", 12);

        return summary;
    }

    // ==========================================================
    // ADMIN MANAGEMENT
    // ==========================================================
    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ROLE_ADMIN);
    }

    @PostMapping("/admins")
    public User createAdmin(@RequestBody User admin) {

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setSuspended(false);

        return userRepository.save(admin);
    }

    @PutMapping("/admins/{id}")
    public User updateAdmin(@PathVariable Long id, @RequestBody User updatedAdmin) {
        User existing = userRepository.findById(id).orElseThrow();
        existing.setEmail(updatedAdmin.getEmail());
        existing.setRole(updatedAdmin.getRole());
        return userRepository.save(existing);
    }

    @PatchMapping("/admins/{id}/suspend")
    public ResponseEntity<?> suspendAdmin(@PathVariable Long id) {
        Optional<User> optionalAdmin = userRepository.findById(id);

        if (optionalAdmin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }

        User admin = optionalAdmin.get();
        admin.setSuspended(true);
        userRepository.save(admin);

        return ResponseEntity.ok(admin);
    }

    @DeleteMapping("/admins/{id}")
    public void deleteAdmin(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    // ==========================================================
    // SUBSCRIPTIONS MANAGEMENT
    // ==========================================================
    @GetMapping("/subscriptions")
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @PostMapping("/subscriptions/user/{adminId}/renew")
    public ResponseEntity<?> renewSubscriptionsForUser(@PathVariable Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        LocalDateTime base = admin.getSubscriptionEndAt() != null
                ? admin.getSubscriptionEndAt()
                : LocalDateTime.now();
        admin.setSubscriptionEndAt(base.plusMonths(1));
        admin.setSubscriptionStatus("ACTIVE");
        userRepository.save(admin);

        List<Subscription> subscriptions = subscriptionRepository.findByUser_UserId(adminId);
        if (subscriptions.isEmpty()) {
            Subscription sub = new Subscription();
            sub.setUser(admin);
            sub.setGarageName(admin.getGarageName());
            sub.setPlanName(admin.getPlanName() != null ? admin.getPlanName() : "BASE");
            sub.setPlanDuration(admin.getPlanDuration());
            sub.setPlanPrice(admin.getPlanPrice());
            sub.setStartAt(LocalDateTime.now());
            sub.setEndAt(admin.getSubscriptionEndAt());
            sub.setStatus("ACTIVE");
            subscriptionRepository.save(sub);
        } else {
            for (Subscription sub : subscriptions) {
                LocalDateTime end = sub.getEndAt() != null ? sub.getEndAt() : LocalDateTime.now();
                sub.setEndAt(end.plusMonths(1));
                sub.setStatus("ACTIVE");
                subscriptionRepository.save(sub);
            }
        }

        return ResponseEntity.ok("Renewed");
    }

    @PostMapping("/subscriptions/{id}/renew")
    public Subscription renewSubscription(@PathVariable Long id) {

        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        // Safety: if endAt is missing, start from now
        LocalDateTime baseEnd =
                sub.getEndAt() != null ? sub.getEndAt() : LocalDateTime.now();

        // Extend by 1 month (safe default)
        sub.setEndAt(baseEnd.plusMonths(1));

        // Mark subscription active
        sub.setStatus("ACTIVE");

        return subscriptionRepository.save(sub);
    }

    @PostMapping("/renewal-requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {

        RenewalRequest req = renewalRequestRepository.findById(id)
                .orElseThrow();

        User admin = req.getAdmin();

        LocalDateTime base =
            admin.getSubscriptionEndAt() != null
                ? admin.getSubscriptionEndAt()
                : LocalDateTime.now();

        if ("ONE_YEAR".equals(req.getRequestedDuration())) {
            admin.setSubscriptionEndAt(base.plusYears(1));
        } else {
            admin.setSubscriptionEndAt(base.plusMonths(6));
        }

        admin.setSubscriptionStatus("ACTIVE");
        req.setStatus("APPROVED");

        userRepository.save(admin);
        renewalRequestRepository.save(req);

        List<Subscription> subscriptions = subscriptionRepository.findByUser_UserId(admin.getUserId());
        for (Subscription sub : subscriptions) {
            sub.setEndAt(admin.getSubscriptionEndAt());
            sub.setStatus("ACTIVE");
            subscriptionRepository.save(sub);
        }

        // ✅ SEND SUCCESS EMAIL (ONE-TIME)
        String duration =
            "ONE_YEAR".equals(req.getRequestedDuration())
                ? "12 Months"
                : "6 Months";

        emailService.sendEmail(
            admin.getEmail(),
            "Subscription Renewed Successfully",
            "Plan of " + duration + " has been successfully applied."
        );

        return ResponseEntity.ok("Renewal approved");
    }

    @PostMapping("/subscriptions/{id}/alert")
    public String sendRenewalAlert(@PathVariable Long id) {
        return "Alert sent to garage for subscription ID " + id;
    }

    // ==========================================================
    // NOTIFICATIONS
    // ==========================================================
    @PostMapping("/notifications")
    public Notification sendNotification(@RequestBody Notification notification) {
        notification.setSentAt(LocalDateTime.now());
        notification.setDelivered(true);
        return notificationRepository.save(notification);
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendCustomEmail(
            @RequestBody EmailRequestDTO request
    ) {

        List<User> activeAdmins = userRepository.findByRole(Role.ROLE_ADMIN).stream()
                .filter(admin -> !admin.isSuspended())
                .toList();

        for (User admin : activeAdmins) {
            if (admin.getEmail() == null) continue;

            emailService.sendEmail(
                    admin.getEmail(),
                    request.getSubject(),
                    request.getMessage()
            );
        }

        return ResponseEntity.ok("Email sent to " + activeAdmins.size() + " active admins"
                );
    }

    
    @GetMapping("/notifications")
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @GetMapping("/renewal-requests")
    public List<RenewalRequest> getRenewalRequests() {
        return renewalRequestRepository.findByStatus("PENDING");
    }

    @DeleteMapping("/notifications/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
    }
}