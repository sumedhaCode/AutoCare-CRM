package com.autocare.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "bookings")
public class Booking {

    @Id
    private Long id;

    private String customerName;
    private String customerPhone;
    private String customerEmail;

    private String vehicleNumber;
    private String vehicleModel;
    private String serviceName;

    private LocalDateTime bookingDate;

    private String slotTime;

    private String status = "PENDING";

    private boolean completed = false;

    private String mechanicRemarks;

    private Double charges;

    @DBRef(lazy = false)
    private User user;

    @DBRef(lazy = false)
    private Vehicle vehicle;

    @DBRef(lazy = false)
    private ServiceEntity service;

    @DBRef(lazy = false)
    private Mechanic mechanic;

    @Transient
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    private Long adminId;

    private LocalDateTime cancelledAt;

    private Long cancelledBy;

    private String cancelReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Booking() {}

    public Booking(
            User user,
            Vehicle vehicle,
            ServiceEntity service,
            String slotTime,
            LocalDateTime bookingDate,
            String status
    ) {
        this.user = user;
        this.vehicle = vehicle;
        this.service = service;
        this.slotTime = slotTime;
        this.bookingDate = bookingDate;
        this.status = status;
        this.completed = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getMechanicRemarks() { return mechanicRemarks; }
    public void setMechanicRemarks(String mechanicRemarks) { this.mechanicRemarks = mechanicRemarks; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public ServiceEntity getService() { return service; }
    public void setService(ServiceEntity service) { this.service = service; }

    public Mechanic getMechanic() { return mechanic; }
    public void setMechanic(Mechanic mechanic) { this.mechanic = mechanic; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getVehicleNumber() {
        if (vehicleNumber != null) return vehicleNumber;
        return (vehicle != null) ? vehicle.getLicensePlate() : null;
    }
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleModel() {
        if (vehicleModel != null) return vehicleModel;
        return (vehicle != null) ? vehicle.getModel() : null;
    }
    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getServiceName() {
        if (serviceName != null) return serviceName;
        return (service != null) ? service.getName() : null;
    }
    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }

    public void addTask(Task task) {
        if (task == null) return;
        tasks.add(task);
        task.setBooking(this);
    }

    public void removeTask(Task task) {
        if (task == null) return;
        tasks.remove(task);
        task.setBooking(null);
    }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public Long getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(Long cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public Double getCharges() {
        return charges;
    }

    public void setCharges(Double charges) {
        this.charges = charges;
    }
}
