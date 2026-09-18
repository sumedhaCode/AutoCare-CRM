package com.autocare.crm.service;

import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// Optional Twilio pieces are commented below — see notes at end.

@Service
public class NotificationService {
    private final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBookingCancellationEmail(User customer, Booking booking, String reason) {
        if (customer == null || customer.getEmail() == null) {
            log.warn("No customer email to send cancellation email for booking {}", booking.getId());
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(customer.getEmail());
            msg.setSubject("Booking #" + booking.getId() + " cancelled");
            String body = "Hello " + (customer.getName() != null ? customer.getName() : "") + ",\n\n" +
                    "Your booking (ID #" + booking.getId() + ") scheduled at " + booking.getBookingDate() + " has been cancelled by admin.\n\n" +
                    (reason != null && !reason.isBlank() ? "Reason: " + reason + "\n\n" : "") +
                    "If you want to rebook, please create a new booking or contact support.\n\n" +
                    "Regards,\nAutoCare Team";
            msg.setText(body);
            mailSender.send(msg);
            log.info("Cancellation email sent to {} for booking {}", customer.getEmail(), booking.getId());
        } catch (Exception ex) {
            log.error("Failed to send cancellation email for booking {}: {}", booking.getId(), ex.getMessage());
        }
    }

    public void sendBookingCancellationSms(User customer, Booking booking, String reason) {
        // Optional; keep as no-op unless Twilio credentials added.
        log.info("SMS notification (stub) for booking {} to phone {}. Reason: {}", booking.getId(),
                customer != null ? customer.getPhoneNumber() : "unknown", reason);
        // If you want SMS, integrate Twilio here; see notes below.
    }
}

