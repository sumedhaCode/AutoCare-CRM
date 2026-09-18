package com.autocare.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// 📄 BookingRequestDTO
// DTO used to transfer booking data from frontend to backend.
public class BookingRequestDTO {

    private Long userId;

    private String bookingDate;
    private String slotTime;
    private String status;

    private Long vehicleId;
    private Long serviceId;

    // --------------------------------------------------
    // 🚗 LICENSE PLATE (SINGLE SOURCE OF TRUTH)
    // --------------------------------------------------
    @NotBlank(message = "License plate number is required")
    @Pattern(
        regexp = "^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$",
        message = "Invalid license plate format. Use format: AA00AA0000 (e.g. MH01AB1234)"
    )
    private String licensePlate;

    private String vehicleModel;
    private String serviceType;

    private Long adminId;

    // -----------------------------
    // Getters & Setters
    // -----------------------------

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getLicensePlate() { return licensePlate; }

    // ✅ Normalized & validated field
    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate != null
                ? licensePlate.toUpperCase().replaceAll("\\s+", "")
                : null;
    }

    // --------------------------------------------------
    // ✅ ALIAS FOR ADMIN WALK-IN BOOKINGS (CRITICAL FIX)
    // --------------------------------------------------
    // If admin UI sends "vehicleNumber", map it here
    public void setVehicleNumber(String vehicleNumber) {
        setLicensePlate(vehicleNumber);
    }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
}
