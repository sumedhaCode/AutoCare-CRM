package com.autocare.crm.dto;

public class ReportSummaryDTO {

    // 🔢 Booking counts
    private long total;
    private long pending;
    private long confirmed;
    private long ongoing;
    private long completed;
    private long cancelled;

    // 💰 Revenue
    private Double revenue;

    // ✅ EXACT constructor used by service
    public ReportSummaryDTO(
            long total,
            long pending,
            long confirmed,
            long ongoing,
            long completed,
            long cancelled,
            Double revenue
    ) {
        this.total = total;
        this.pending = pending;
        this.confirmed = confirmed;
        this.ongoing = ongoing;
        this.completed = completed;
        this.cancelled = cancelled;
        this.revenue = revenue;
    }

    // ✅ Getters (required for JSON serialization)

    public long getTotal() {
        return total;
    }

    public long getPending() {
        return pending;
    }

    public long getConfirmed() {
        return confirmed;
    }

    public long getOngoing() {
        return ongoing;
    }

    public long getCompleted() {
        return completed;
    }

    public long getCancelled() {
        return cancelled;
    }

    public Double getRevenue() {
        return revenue;
    }
}
