package com.autocare.crm.service;

import com.autocare.crm.dto.RegisterRequestDTO;
import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.autocare.crm.entity.Subscription;
import com.autocare.crm.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    //  Register using DTO instead of raw params
    public User registerUser(RegisterRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole()));
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());

        // ✅ Admin ↔ Garage mapping (SAFE)
     // ✅ Admin ↔ Garage mapping
        if ("ROLE_ADMIN".equals(request.getRole())) {
            user.setGarageName(request.getGarageName());
            user.setGarageAddress(request.getGarageAddress());
        
            LocalDateTime start = LocalDateTime.now();
            LocalDateTime end =
                    ("ONE_YEAR".equals(request.getPlanDuration())
                            || "ONE_YEARLY".equals(request.getPlanDuration()))
                            ? start.plusYears(1)
                            : start.plusMonths(6);

            user.setPlanName("BASE");
            user.setPlanDuration(request.getPlanDuration());
            user.setPlanPrice(request.getPlanPrice());
            user.setSubscriptionStartAt(start);
            user.setSubscriptionEndAt(end);
            user.setSubscriptionStatus("ACTIVE");
        }

        // ✅ STAFF ↔ Garage mapping (FIX)
        if ("ROLE_STAFF".equals(request.getRole())) {

            if (request.getAdminId() == null) {
                throw new RuntimeException("Staff must be linked to a garage");
            }

            User admin = userRepository.findById(request.getAdminId())
                    .orElseThrow(() -> new RuntimeException("Garage admin not found"));

            user.setAdminId(admin.getUserId());
            user.setGarageName(admin.getGarageName());
            user.setGarageAddress(admin.getGarageAddress());
        }


        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.ROLE_ADMIN) {
            Subscription subscription = new Subscription();
            subscription.setUser(savedUser);
            subscription.setGarageName(savedUser.getGarageName());
            subscription.setPlanName(savedUser.getPlanName());
            subscription.setPlanDuration(savedUser.getPlanDuration());
            subscription.setPlanPrice(savedUser.getPlanPrice());
            subscription.setStartAt(savedUser.getSubscriptionStartAt());
            subscription.setEndAt(savedUser.getSubscriptionEndAt());
            subscription.setStatus("ACTIVE");
            subscriptionRepository.save(subscription);
        }

        // ✅ WELCOME EMAIL (ADMIN ONLY, RUNS ONCE)
        if ("ROLE_ADMIN".equals(request.getRole())) {
            emailService.sendEmail(
                savedUser.getEmail(),
                "Welcome to AutoCare",
                "Your subscription plan: " + savedUser.getPlanName() +
                "\nDuration: " + savedUser.getPlanDuration() +
                "\nValid till: " + savedUser.getSubscriptionEndAt()
            );
        }

     // ✅ USER REGISTRATION EMAIL (NON-ADMIN ONLY)
        if (!"ROLE_ADMIN".equals(request.getRole())) {
            emailService.sendEmail(
                savedUser.getEmail(),
                "Thank you for registering",
                "Welcome to AutoCare. Your account has been created successfully."
            );
        }

        return savedUser;
    
    }

    // ----------------------------------------------------
    // Existing methods (UNCHANGED)
    // ----------------------------------------------------

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setEmail(userDetails.getEmail());
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            existingUser.setRole(userDetails.getRole());
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getUsersByRole(String role) {
        String normalized = role.startsWith("ROLE_")
                ? role
                : "ROLE_" + role.toUpperCase();
        return userRepository.findByRole(Role.valueOf(normalized));
    }
}
