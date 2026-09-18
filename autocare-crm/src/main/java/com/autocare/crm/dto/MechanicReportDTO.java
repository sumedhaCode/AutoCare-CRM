package com.autocare.crm.dto;

public class MechanicReportDTO {

    private String mechanicName;
    private Long completedJobs;
    private Double totalRevenue;

    // ✅ Constructor used by MECHANIC PERFORMANCE (task-based)
    public MechanicReportDTO(String mechanicName, Long completedJobs) {
        this.mechanicName = mechanicName;
        this.completedJobs = completedJobs;
        this.totalRevenue = 0.0; // safe default
    }

    // ✅ Constructor used by revenue-based reports (if any)
    public MechanicReportDTO(
            String mechanicName,
            Long completedJobs,
            Double totalRevenue
    ) {
        this.mechanicName = mechanicName;
        this.completedJobs = completedJobs;
        this.totalRevenue = totalRevenue;
    }

    public String getMechanicName() {
        return mechanicName;
    }

    public Long getCompletedJobs() {
        return completedJobs;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }
}
