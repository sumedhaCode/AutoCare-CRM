package com.autocare.crm.controller;

import com.autocare.crm.dto.TaskDTO;
import com.autocare.crm.dto.UpdateRemarksDTO;
import com.autocare.crm.dto.UpdateStatusDTO;
import com.autocare.crm.entity.Task;
import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.Mechanic;
import com.autocare.crm.enums.TaskStatus;
import com.autocare.crm.service.TaskService;
import com.autocare.crm.repository.BookingRepository;
import com.autocare.crm.repository.MechanicRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/tasks")
public class StaffTaskController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MechanicRepository mechanicRepository;

    private final TaskService service;

    public StaffTaskController(TaskService service) {
        this.service = service;
    }

    // ✅ Convert entity → DTO
    private TaskDTO toDTO(Task t) {
        TaskDTO d = new TaskDTO();
        d.id = t.getId();
        d.title = t.getTitle();
        d.description = t.getDescription();
        d.status = t.getStatus();
        d.adminId = t.getAdminId();
        // In the new design mechanicUserId field on DTO carries mechanicId
        d.mechanicUserId = t.getMechanicId();
        d.customerName = t.getCustomerName();
        d.customerPhone = t.getCustomerPhone();
        d.vehicleNumber = t.getVehicleNumber();

        // 🔹 NEW: send vehicleModel to frontend
        d.vehicleModel = t.getVehicleModel();

        d.serviceDetails = t.getServiceDetails();
        return d;
    }

    // ✅ GET all tasks for logged-in mechanic
    @PreAuthorize("hasRole('STAFF')")
    @GetMapping
    public List<TaskDTO> list(Authentication auth) {
        Long mechanicId = getMechanicIdByEmail(auth.getName());
        System.out.println("Resolved mechanicId = " + mechanicId + " for " + auth.getName());

        return service.getTasksForMechanic(mechanicId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✅ Update task status + 🔄 sync related booking
    @PreAuthorize("hasRole('STAFF')")
    @PutMapping("/{id}/status")
    public TaskDTO updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusDTO body,
            Authentication auth) {

        Long mechanicId = getMechanicIdByEmail(auth.getName());
        System.out.println("Updating status by mechanicId = " + mechanicId);

        Task updated = service.updateStatus(id, mechanicId, body.status);
        if (updated == null)
            throw new RuntimeException("Not authorized or task not found");

        return toDTO(updated);

    }

    // ✅ Update service remarks/details (mechanic notes)
    @PreAuthorize("hasRole('STAFF')")
    @PutMapping("/{id}/remarks")
    public TaskDTO updateRemarks(
            @PathVariable Long id,
            @RequestBody UpdateRemarksDTO body,
            Authentication auth) {

        Long mechanicId = getMechanicIdByEmail(auth.getName());
        System.out.println("Updating remarks by mechanicId = " + mechanicId);

        Task updated = service.updateRemarks(id, mechanicId, body.serviceDetails);
        if (updated == null)
            throw new RuntimeException("Not authorized or task not found");

        return toDTO(updated);
    }

    // ✅ Mechanic lookup using staff email → Mechanic row → mechanic.id
    private Long getMechanicIdByEmail(String email) {
        Mechanic mech = mechanicRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Mechanic not found for email: " + email));
        return mech.getId();
    }

    // 🔄 Helper: sync Booking from Task state (currently used from TaskService, here kept for reference)
    private void syncBookingFromTask(Task task) {
        Booking booking = task.getBooking();
        if (booking == null) {
            return; // nothing to sync
        }

        TaskStatus status = task.getStatus();
        if (status == null) {
            return;
        }

        switch (status) {
            case PENDING:
                booking.setStatus("CONFIRMED");
                break;
            case ONGOING:
                booking.setStatus("ONGOING");
                break;
            case COMPLETED:
                booking.setStatus("COMPLETED");
                booking.setMechanicRemarks(task.getServiceDetails());
                booking.setCompleted(true);
                break;
            default:
                break;
        }

        bookingRepository.save(booking);
    }
}
