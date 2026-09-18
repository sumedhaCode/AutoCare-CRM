package com.autocare.crm.service;

import com.autocare.crm.dto.TaskDTO;
import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.Mechanic;
import com.autocare.crm.entity.Task;
import com.autocare.crm.enums.TaskStatus;
import com.autocare.crm.repository.BookingRepository;
import com.autocare.crm.repository.MechanicRepository;
import com.autocare.crm.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repo;
    private final MechanicRepository mechanicRepo;
    private final BookingRepository bookingRepo;

    public TaskService(
            TaskRepository repo,
            MechanicRepository mechanicRepo,
            BookingRepository bookingRepo
    ) {
        this.repo = repo;
        this.mechanicRepo = mechanicRepo;
        this.bookingRepo = bookingRepo;
    }

    // ------------------------------------------------------
    // 1) MANUAL ADMIN-CREATED TASK
    // ------------------------------------------------------
    public Task createTask(TaskDTO dto) {

        if (dto.bookingId != null) {
            Booking booking = bookingRepo.findById(dto.bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            Long mechanicId = dto.mechanicId != null ? dto.mechanicId : dto.mechanicUserId;
            if (mechanicId != null) {
                Mechanic mechanic = mechanicRepo.findById(mechanicId)
                        .orElseThrow(() -> new RuntimeException("Mechanic not found"));
                booking.setMechanic(mechanic);
                booking.setStatus("CONFIRMED");
                bookingRepo.save(booking);
            }

            return createTaskForBooking(booking, dto.adminId != null ? dto.adminId : booking.getAdminId());
        }

        Task task = new Task();
        task.setTitle(dto.title);
        task.setDescription(dto.description);
        task.setStatus(dto.status != null ? dto.status : TaskStatus.PENDING);
        task.setAdminId(dto.adminId);

        task.setCustomerName(dto.customerName);
        task.setCustomerPhone(dto.customerPhone);
        task.setVehicleNumber(dto.vehicleNumber);

        // 🔹 NEW: allow manual tasks to carry vehicle model too
        task.setVehicleModel(dto.vehicleModel);

        task.setServiceDetails(dto.serviceDetails);

        // Resolve mechanic from email or ID
        Long mechanicId = null;

        if (dto.mechanicEmail != null && !dto.mechanicEmail.isBlank()) {
            Mechanic mechanic = mechanicRepo.findByEmail(dto.mechanicEmail.trim())
                    .orElseThrow(() ->
                            new RuntimeException("Mechanic email not found: " + dto.mechanicEmail));
            mechanicId = mechanic.getId();
        } else if (dto.mechanicId != null) {
            mechanicId = dto.mechanicId;
        } else if (dto.mechanicUserId != null) {
            // In the new design, mechanicUserId is treated as mechanic's own ID
            mechanicId = dto.mechanicUserId;
        }

        if (mechanicId == null) {
            throw new RuntimeException(
                    "Mechanic identifier missing (mechanicEmail or mechanicUserId/mechanicId required)"
            );
        }

        task.setMechanicId(mechanicId);

        return repo.save(task);
    }

    // ------------------------------------------------------
    // 2) AUTO-GENERATE TASK FROM BOOKING
    // ------------------------------------------------------
    public Task createTaskForBooking(Booking booking, Long adminId) {

        if (booking.getMechanic() == null) {
            throw new RuntimeException("Cannot create task: mechanic not assigned to booking");
        }

        Task task = new Task();

        // Service Name
        String serviceName;
        if (booking.getService() != null && booking.getService().getName() != null) {
            serviceName = booking.getService().getName();
        } else if (booking.getServiceName() != null) {
            serviceName = booking.getServiceName();
        } else {
            serviceName = "Service";
        }

        // Vehicle Number
        String vehicleNumber;
        if (booking.getVehicle() != null && booking.getVehicle().getLicensePlate() != null) {
            vehicleNumber = booking.getVehicle().getLicensePlate();
        } else if (booking.getVehicleNumber() != null) {
            vehicleNumber = booking.getVehicleNumber();
        } else {
            vehicleNumber = "Unknown";
        }

        // 🔹 NEW: Vehicle Model (this is what you want as "Tesla CC")
        String vehicleModel;
        if (booking.getVehicle() != null && booking.getVehicle().getModel() != null) {
            vehicleModel = booking.getVehicle().getModel();
        } else if (booking.getVehicleModel() != null) {
            vehicleModel = booking.getVehicleModel();
        } else {
            vehicleModel = "Unknown";
        }

        // Basic task fields
        task.setTitle(serviceName + " - Booking #" + booking.getId());
        task.setDescription("Auto-generated task from booking #" + booking.getId());
        task.setStatus(TaskStatus.PENDING);

        // Admin ID
        task.setAdminId(adminId != null ? adminId : booking.getAdminId());

        // 🔑 Mechanic ID (no user link)
        Long mechanicId = booking.getMechanic().getId();
        task.setMechanicId(mechanicId);

        // Customer info
        if (booking.getCustomerName() != null) {
            task.setCustomerName(booking.getCustomerName());
            task.setCustomerPhone(booking.getCustomerPhone());
        } else if (booking.getUser() != null) {
            task.setCustomerName(booking.getUser().getEmail()); // fallback
            task.setCustomerPhone("");
        } else {
            task.setCustomerName("Customer");
            task.setCustomerPhone("");
        }

        // Vehicle & Service
        task.setVehicleNumber(vehicleNumber);
        task.setVehicleModel(vehicleModel);   // ✅ critical line
        task.setServiceDetails(serviceName);

        // ✅ Directly link Task → Booking (critical for admin status sync)
        task.setBooking(booking);

        return repo.save(task);
    }

    // ------------------------------------------------------
    // 3) ADMIN ASSIGN MECHANIC TO EXISTING TASK
    // ------------------------------------------------------
    public Task assignMechanic(Long taskId, Long mechanicId) {

        Task task = repo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setMechanicId(mechanicId);
        return repo.save(task);
    }

    // ------------------------------------------------------
    // 4) LIST TASKS FOR MECHANIC
    // ------------------------------------------------------
    public List<Task> getTasksForMechanic(Long mechanicId) {
        return repo.findByMechanicId(mechanicId);
    }

    // ------------------------------------------------------
    // INTERNAL AUTH CHECK
    // ------------------------------------------------------
    private Task getTaskForMechanic(Long taskId, Long mechanicId) {
        Task t = repo.findById(taskId).orElse(null);

        if (t == null || t.getMechanicId() == null || !t.getMechanicId().equals(mechanicId)) {
            return null;
        }
        return t;
    }

    // ------------------------------------------------------
    // 5) UPDATE TASK STATUS + SYNC BOOKING STATUS
    // ------------------------------------------------------
    public Task updateStatus(Long taskId, Long mechanicId, TaskStatus next) {

        Task t = getTaskForMechanic(taskId, mechanicId);

        if (t == null) {
            throw new RuntimeException("Not authorized or task not found");
        }

        // 1️⃣ Update task status
        t.setStatus(next);
        Task saved = repo.save(t);

        // 2️⃣ Sync Booking.status (+ remarks on COMPLETED)
        Booking booking = t.getBooking();
        if (booking != null) {
            switch (next) {
                case PENDING -> booking.setStatus("PENDING");
                case ONGOING -> booking.setStatus("ONGOING");
                case COMPLETED -> {
                    booking.setStatus("COMPLETED");
                    booking.setMechanicRemarks(t.getServiceDetails());
                    booking.setCompleted(true);
                }
                case CANCELLED -> booking.setStatus("CANCELLED");
            }
            bookingRepo.save(booking);
        }

        return saved;
    }

    // ------------------------------------------------------
    // 6) UPDATE MECHANIC REMARKS + SYNC TO BOOKING
    // ------------------------------------------------------
    public Task updateRemarks(Long taskId, Long mechanicId, String remarks) {

        Task t = getTaskForMechanic(taskId, mechanicId);

        if (t == null) {
            throw new RuntimeException("Not authorized or task not found");
        }

        // Update task remarks
        t.setServiceDetails(remarks);
        Task saved = repo.save(t);

        // Also update remarks on Booking (for admin dashboard)
        Booking booking = t.getBooking();
        if (booking != null) {
            booking.setMechanicRemarks(remarks);
            bookingRepo.save(booking);
        }

        return saved;
    }
}  