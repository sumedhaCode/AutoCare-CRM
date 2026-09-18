package com.autocare.crm.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterRequestDTO {

    private String garageName;
    private String garageAddress;
    private Long adminId;

 // ✅ Subscription (Admin only)
    private String planName;        // BASE
    private String planDuration;    // SIX_MONTHS / ONE_YEAR
    private Integer planPrice;      // 599 / 999

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role;

    @NotBlank
    private String name;

    @NotBlank
    private String phoneNumber;

    // getters & setters

    
    public String getPlanDuration() { return planDuration; }
    public String getPlanName() {
		return planName;
	}
	public void setPlanName(String planName) {
		this.planName = planName;
	}
	public Integer getPlanPrice() {
		return planPrice;
	}
	public void setPlanPrice(Integer planPrice) {
		this.planPrice = planPrice;
	}
	public void setPlanDuration(String planDuration) {
        this.planDuration = planDuration;
    }

    public String getGarageName() { return garageName; }
    public void setGarageName(String garageName) { this.garageName = garageName; }

    public String getGarageAddress() { return garageAddress; }
    public void setGarageAddress(String garageAddress) {
        this.garageAddress = garageAddress;
    }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
