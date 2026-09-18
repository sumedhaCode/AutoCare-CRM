package com.autocare.crm.dto;

import com.autocare.crm.entity.User;

public class UserDTO {

    private Long userId;
    private String email;
    private String role;

    public UserDTO() {
    }

    public UserDTO(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.role = user.getRole().name(); // ENUM → String
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
