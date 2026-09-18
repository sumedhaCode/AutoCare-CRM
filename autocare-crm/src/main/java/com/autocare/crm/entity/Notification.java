package com.autocare.crm.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private Long id;

    private String message;
    private String targetRole;
    private LocalDateTime sentAt;
    private boolean delivered;

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public boolean isDelivered() {
        return delivered;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }
}
