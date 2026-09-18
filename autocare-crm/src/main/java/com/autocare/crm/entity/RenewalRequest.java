package com.autocare.crm.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "renewal_requests")
public class RenewalRequest {

    @Id
    private Long id;

    @DBRef(lazy = false)
    private User admin;

    private String requestedDuration;

    private LocalDateTime requestedAt;

    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public String getRequestedDuration() {
        return requestedDuration;
    }

    public void setRequestedDuration(String requestedDuration) {
        this.requestedDuration = requestedDuration;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
