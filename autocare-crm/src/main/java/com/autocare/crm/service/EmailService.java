package com.autocare.crm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @PostConstruct
    public void init() {
        System.out.println("📧 JavaMailSender initialized successfully");
    }

    public void sendEmail(String to, String subject, String text) {
        System.out.println("📤 Sending email to: " + to);

        try {
        	 SimpleMailMessage message = new SimpleMailMessage();
             message.setTo(to);
             message.setSubject(subject);
             message.setText(text);
             mailSender.send(message);
      
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (Exception e) {
            System.out.println("❌ Failed to send email to: " + to);
            e.printStackTrace(); // Detailed error log for debugging
        }
    }
}

