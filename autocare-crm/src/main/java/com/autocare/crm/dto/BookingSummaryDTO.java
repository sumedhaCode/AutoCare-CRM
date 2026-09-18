// src/main/java/com/autocare/crm/dto/BookingSummaryDTO.java
package com.autocare.crm.dto;

public class BookingSummaryDTO {

    private int totalBookings;

    // lifecycle counts
    private int pending;
    private int confirmed;
    private int ongoing;
    private int completed;
    private int cancelled;

    // No-args constructor (useful for Jackson)
    public BookingSummaryDTO() {
    }

    // All-args constructor
    public BookingSummaryDTO(int totalBookings,
                             int pending,
                             int confirmed,
                             int ongoing,
                             int completed,
                             int cancelled) {
        this.totalBookings = totalBookings;
        this.pending = pending;
        this.confirmed = confirmed;
        this.ongoing = ongoing;
        this.completed = completed;
        this.cancelled = cancelled;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getPending() {
        return pending;
    }

    public void setPending(int pending) {
        this.pending = pending;
    }

    public int getConfirmed() {
        return confirmed;
    }

    public void setConfirmed(int confirmed) {
        this.confirmed = confirmed;
    }

    public int getOngoing() {
        return ongoing;
    }

    public void setOngoing(int ongoing) {
        this.ongoing = ongoing;
    }

    public int getCompleted() {
        return completed;
    }

    public void setCompleted(int completed) {
        this.completed = completed;
    }

    public int getCancelled() {
        return cancelled;
    }

    public void setCancelled(int cancelled) {
        this.cancelled = cancelled;
    }
}
