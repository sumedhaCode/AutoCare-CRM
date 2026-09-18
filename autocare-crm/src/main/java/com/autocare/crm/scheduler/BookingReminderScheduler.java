package com.autocare.crm.scheduler;

import com.autocare.crm.entity.Booking;
import com.autocare.crm.repository.BookingRepository;
import com.autocare.crm.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class BookingReminderScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    // Run every hour on the hour (cron: second minute hour day month dayOfWeek)
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminders() {

        System.out.println("🔄 BookingReminderScheduler is running at: " + LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next24h = now.plusHours(24);

        List<Booking> upcoming = bookingRepository.findByBookingDateBetween(now, next24h);
        Set<String> notifiedUsers = new HashSet<>();

        System.out.println("📅 Reminder job started at " + now + ", found " + upcoming.size() + " bookings");

        for (Booking b : upcoming) {
            if (b.getUser() == null || b.getUser().getEmail() == null) continue;

            // User has NO name field → use email as identifier
            String to = b.getUser().getEmail();
            String name = b.getUser().getEmail();  // FIXED
            String service =
                    b.getService() != null
                            ? b.getService().getType()
                            : b.getServiceName();

            String schedule = b.getBookingDate().toString();

            String body =
                    "Hi " + name + ", your booking for " + service + " is scheduled at " + schedule;

            emailService.sendEmail(to, "Booking Reminder", body);

            System.out.println("📩 Reminder sent to " + to + " at " + LocalDateTime.now());

            notifiedUsers.add(to);
        }

        if (notifiedUsers.isEmpty()) {
            System.out.println("🔕 No reminders sent this hour.");
        } else {
            System.out.println("✅ Reminders sent to: " + String.join(", ", notifiedUsers));
        }
    }
}


