package com.autocare.crm.dto;

import java.time.LocalDateTime;

public class CustomerReportDTO {

    private Long bookingId;
    private LocalDateTime bookingDate;
    private String status;
    private double price;

    // ✅ EXACT MATCH for JPQL constructor
    public CustomerReportDTO(
            Long bookingId,
            LocalDateTime bookingDate,
            String status,
            double price
    ) {
        this.bookingId = bookingId;
        this.bookingDate = bookingDate;
        this.status = status;
        this.price = price;
    }

    // --- getters (important for JSON serialization)

    public Long getBookingId() {
        return bookingId;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public String getStatus() {
        return status;
    }

    public double getPrice() {
        return price;
    }
}
