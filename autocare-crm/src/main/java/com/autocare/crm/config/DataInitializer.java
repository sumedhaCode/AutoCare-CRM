package com.autocare.crm.config;

import com.autocare.crm.entity.Mechanic;
import com.autocare.crm.entity.Notification;
import com.autocare.crm.entity.Role;
import com.autocare.crm.entity.ServiceEntity;
import com.autocare.crm.entity.Subscription;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.MechanicRepository;
import com.autocare.crm.repository.NotificationRepository;
import com.autocare.crm.repository.ServiceRepository;
import com.autocare.crm.repository.SubscriptionRepository;
import com.autocare.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MechanicRepository mechanicRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            ServiceRepository serviceRepository,
            SubscriptionRepository subscriptionRepository,
            MechanicRepository mechanicRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.mechanicRepository = mechanicRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedServices();
        User superAdmin = seedUser(
                "superadmin@gmail.com",
                "Superadmin@123",
                Role.ROLE_SUPER_ADMIN,
                "Super Admin",
                "9999999999",
                null,
                null,
                null
        );

        User garageAdmin = seedUser(
                "garage.admin@gmail.com",
                "Admin@123",
                Role.ROLE_ADMIN,
                "Demo Garage Admin",
                "9876543210",
                "AutoCare Demo Garage",
                "MG Road, Pune",
                null
        );

        if (garageAdmin.getPlanName() == null) {
            LocalDateTime start = LocalDateTime.now().minusMonths(1);
            garageAdmin.setPlanName("BASE");
            garageAdmin.setPlanDuration("SIX_MONTHS");
            garageAdmin.setPlanPrice(599);
            garageAdmin.setSubscriptionStartAt(start);
            garageAdmin.setSubscriptionEndAt(start.plusMonths(6));
            garageAdmin.setSubscriptionStatus("ACTIVE");
            garageAdmin = userRepository.save(garageAdmin);
        }

        if (subscriptionRepository.findByUser_UserId(garageAdmin.getUserId()).isEmpty()) {
            Subscription subscription = new Subscription();
            subscription.setUser(garageAdmin);
            subscription.setGarageName(garageAdmin.getGarageName());
            subscription.setPlanName(garageAdmin.getPlanName());
            subscription.setPlanDuration(garageAdmin.getPlanDuration());
            subscription.setPlanPrice(garageAdmin.getPlanPrice());
            subscription.setStartAt(garageAdmin.getSubscriptionStartAt());
            subscription.setEndAt(garageAdmin.getSubscriptionEndAt());
            subscription.setStatus("ACTIVE");
            subscriptionRepository.save(subscription);
        }

        User staff = seedUser(
                "staff.demo@gmail.com",
                "Staff@123",
                Role.ROLE_STAFF,
                "Demo Mechanic",
                "9123456780",
                garageAdmin.getGarageName(),
                garageAdmin.getGarageAddress(),
                garageAdmin.getUserId()
        );

        if (!mechanicRepository.existsByEmailAndAdminId(staff.getEmail(), garageAdmin.getUserId())) {
            Mechanic mechanic = new Mechanic();
            mechanic.setName(staff.getName());
            mechanic.setEmail(staff.getEmail());
            mechanic.setAdminId(garageAdmin.getUserId());
            mechanicRepository.save(mechanic);
        }

        seedUser(
                "user.demo@gmail.com",
                "User@123",
                Role.ROLE_USER,
                "Demo Customer",
                "9000000001",
                null,
                null,
                null
        );

        if (notificationRepository.count() == 0) {
            Notification notification = new Notification();
            notification.setMessage("Welcome to AutoCare CRM. Demo garage and sample accounts are ready.");
            notification.setTargetRole("ALL");
            notification.setSentAt(LocalDateTime.now());
            notification.setDelivered(true);
            notificationRepository.save(notification);
        }

        if (superAdmin != null) {
            System.out.println("Demo login: superadmin@gmail.com / Superadmin@123");
        }
    }

    private void seedServices() {
        seedService("OIL_CHANGE", "Engine oil and filter replacement", 1499, "Oil Change");
        seedService("FULL_SERVICE", "Complete vehicle inspection and service", 4999, "Full Service");
        seedService("BRAKE_INSPECTION", "Brake pad and rotor inspection", 999, "Brake Inspection");
        seedService("WHEEL_ALIGNMENT", "Four-wheel alignment", 1299, "Wheel Alignment");
    }

    private void seedService(String type, String description, double price, String name) {
        if (!serviceRepository.existsByType(type)) {
            serviceRepository.save(new ServiceEntity(type, description, price, name));
        }
    }

    private User seedUser(
            String email,
            String rawPassword,
            Role role,
            String name,
            String phone,
            String garageName,
            String garageAddress,
            Long adminId
    ) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setName(name);
            user.setPhoneNumber(phone);
            user.setGarageName(garageName);
            user.setGarageAddress(garageAddress);
            user.setAdminId(adminId);
            user.setSuspended(false);
            return userRepository.save(user);
        });
    }
}
