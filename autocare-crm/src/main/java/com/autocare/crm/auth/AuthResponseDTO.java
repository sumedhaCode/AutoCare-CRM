package com.autocare.crm.auth;

public class AuthResponseDTO {

    private String message;
    private String role;
    private String token;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String message, String role, String token) {
        this.message = message;
        this.role = role;
        this.token = token;
    }

    // Getters
    public String getMessage() {
        return message;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }

    // Setters (optional if you need them)
    public void setMessage(String message) {
        this.message = message;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setToken(String token) {
        this.token = token;
    }
}


