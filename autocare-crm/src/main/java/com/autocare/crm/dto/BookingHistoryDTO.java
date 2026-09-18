package com.autocare.crm.dto;

import java.time.LocalDateTime;

public class BookingHistoryDTO {
    private String serviceName;
    private LocalDateTime bookingDate;
    private String slotTime;
    private String status;
    private String vehicleNumber;

    // ✅ Main constructor
    public BookingHistoryDTO(String serviceName, LocalDateTime bookingDate, String slotTime, String status, String vehicleNumber) {
        this.serviceName = serviceName;
        this.bookingDate = bookingDate;
        this.slotTime = slotTime;
        this.status = status;
        this.vehicleNumber = vehicleNumber;
    }

    // ✅ Getters & Setters
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
}
