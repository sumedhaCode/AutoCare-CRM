package com.autocare.crm.config;



import com.autocare.crm.entity.User;
import com.autocare.crm.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("adminSubscriptionGuard")
public class AdminSubscriptionGuard {

    private final UserRepository userRepository;

    public AdminSubscriptionGuard(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isActive(Authentication auth) {
        if (auth == null) return false;

        User admin = userRepository
                .findByEmail(auth.getName())
                .orElse(null);

        if (admin == null) return false;

        // 🔒 BLOCK expired subscriptions
        return !"EXPIRED".equalsIgnoreCase(admin.getSubscriptionStatus());
    }
}

