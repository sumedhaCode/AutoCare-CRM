package com.autocare.crm.scheduler;

import com.autocare.crm.entity.Subscription;
import com.autocare.crm.repository.SubscriptionRepository;
import com.autocare.crm.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class SubscriptionExpiryScheduler {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private EmailService emailService;

    // want BOTH 2:20 PM & 6:20 PM
    @Scheduled(cron = "0 50 15,18 * * *")


    public void sendSubscriptionAlerts() {
    	System.out.println("⏰ Scheduler triggered at " + LocalDateTime.now());

        System.out.println("💳 SubscriptionExpiryScheduler running at " + LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next7Days = now.plusDays(7);

        // Subscriptions expiring in next 7 days
        List<Subscription> expiringSoon =
                subscriptionRepository.findByEndAtBetween(now, next7Days)
                .stream()
                .filter(sub ->
                    sub.getUser() != null &&
                    "ACTIVE".equalsIgnoreCase(sub.getStatus())

                )
                .toList();


        for (Subscription sub : expiringSoon) {

            if (sub.getUser() == null || sub.getUser().getEmail() == null) continue;

            String email = sub.getUser().getEmail();
            long daysLeft = java.time.Duration
                    .between(now, sub.getEndAt())
                    .toDays();

            String subject;
            String body;

            if (daysLeft <= 0) {
                subject = "❌ Subscription Expired";
                body = "Your subscription has expired. Please contact support for renewal.";
            } else {
                subject = "⏰ Subscription Expiry Reminder";
                body = "Your subscription will expire in " + daysLeft +
                       " day(s). Please contact support for renewal.";
            }

            emailService.sendEmail(email, subject, body);

            System.out.println("📧 Subscription alert sent to " + email);
        }

        if (expiringSoon.isEmpty()) {
            System.out.println("🔕 No subscription alerts sent today.");
        }
    }
}

