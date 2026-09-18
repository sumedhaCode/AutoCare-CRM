package com.autocare.crm.dto;

import com.autocare.crm.enums.TaskStatus;

public class TaskDTO {
    public Long id;
    public String title;
    public String description;
    public TaskStatus status;   // ✅
    public Long adminId;
    public Long mechanicUserId;
    public Long mechanicId;
    public Long bookingId;
    public String customerName;
    public String customerPhone;
    public String vehicleNumber;

    // 🔹 NEW: this is what MechanicDashboard reads
    public String vehicleModel;

    public String serviceDetails;
    public String mechanicEmail; // Admin will send email; backend will resolve mechanic id
}
