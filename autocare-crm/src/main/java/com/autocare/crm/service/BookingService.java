package com.autocare.crm.service;

import com.autocare.crm.dto.AdminBookingRequestDTO;
import com.autocare.crm.dto.BookingSummaryDTO;
import com.autocare.crm.dto.MechanicReportDTO;
import com.autocare.crm.entity.*;
import com.autocare.crm.enums.TaskStatus;
import com.autocare.crm.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service

public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MechanicRepository mechanicRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private TaskService taskService;
    @Autowired private TaskRepository taskRepository;
    @Autowired
    private EmailService emailService;

    // --------------------------------------------------
    // ADMIN WALK-IN BOOKING
    // --------------------------------------------------
    public void createAdminWalkInBooking(AdminBookingRequestDTO dto) {

        Booking booking = new Booking();

        booking.setCustomerName(dto.getCustomerName());
        booking.setCustomerEmail(dto.getCustomerEmail());
        booking.setCustomerPhone(dto.getCustomerPhone());
        booking.setUser(null);

        if (dto.getServiceId() != null) {
            ServiceEntity service = serviceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found"));
            booking.setService(service);
        }

        booking.setServiceName(dto.getServiceName());
        booking.setVehicleModel(dto.getVehicleModel());
        booking.setVehicleNumber(dto.getLicensePlate());

        booking.setBookingDate(
                LocalDateTime.of(
                        dto.getBookingDate(),
                        parseSlot(dto.getSlotTime())
                )
        );

        booking.setSlotTime(dto.getSlotTime());
        booking.setStatus("PENDING");

        Long adminId = resolveCurrentUserIdIfAdmin();
        if (adminId == null) {
            throw new RuntimeException("Admin context not found");
        }
        booking.setAdminId(adminId);

        bookingRepository.save(booking);
     // ✅ BOOKING CREATED EMAILS (CHANGE 6)
        if (booking.getUser() != null && booking.getUser().getEmail() != null) {
            emailService.sendEmail(
                booking.getUser().getEmail(),
                "Booking Created",
                "Your booking has been created successfully."
            );
        }

        if (booking.getCustomerEmail() != null) {
            emailService.sendEmail(
                booking.getCustomerEmail(),
                "Booking Created",
                "Your booking has been created successfully."
            );
        }
    
    }

    // --------------------------------------------------
    // UPDATE CHARGES
    // --------------------------------------------------
    public void updateBookingCharges(Long bookingId, Double charges) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus()) || !booking.isCompleted()) {
            throw new IllegalStateException("Charges can be set only for completed bookings");
        }

        booking.setCharges(charges);
        bookingRepository.save(booking);
     // ✅ SEND COMPLETION EMAILS (GUARANTEED PATH)
        if (booking.getUser() != null && booking.getUser().getEmail() != null) {
            emailService.sendEmail(
                booking.getUser().getEmail(),
                "Service Completed",
                "Your booking has been successfully completed."
            );
        }

        if (booking.getCustomerEmail() != null) {
            emailService.sendEmail(
                booking.getCustomerEmail(),
                "Service Completed",
                "Your service booking has been successfully completed."
            );
        }

    }

    private LocalTime parseSlot(String slotTime) {
        try {
            return LocalTime.parse(slotTime);
        } catch (Exception ex) {
            throw new RuntimeException("Invalid slot time format: " + slotTime);
        }
    }

    // --------------------------------------------------
    // ASSIGN / REASSIGN MECHANIC  🔥 FIXED
    // --------------------------------------------------
    public void assignMechanicAndCreateTask(Long bookingId, Long mechanicId) {

        // 🔐 Resolve logged-in admin
        Long currentAdminId = resolveCurrentUserIdIfAdmin();
        if (currentAdminId == null) {
            throw new RuntimeException("Unauthorized admin action");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Mechanic mechanic = mechanicRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        // 🔥 HARD ADMIN OWNERSHIP CHECKS (NON-NEGOTIABLE)
        if (booking.getAdminId() == null || mechanic.getAdminId() == null) {
            throw new RuntimeException("Booking or mechanic is not linked to any garage");
        }

        if (!booking.getAdminId().equals(currentAdminId)) {
            throw new RuntimeException("You cannot modify bookings of another garage");
        }

        if (!mechanic.getAdminId().equals(currentAdminId)) {
            throw new RuntimeException("You cannot assign a mechanic from another garage");
        }

        if (!booking.getAdminId().equals(mechanic.getAdminId())) {
            throw new RuntimeException("Mechanic does not belong to this garage");
        }


        // ✅ SAFE TO ASSIGN
        booking.setMechanic(mechanic);
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        // Task handling (unchanged)
        List<Task> existingTasks = taskRepository.findByBooking(booking);

        if (existingTasks != null && !existingTasks.isEmpty()) {

            Task primary = existingTasks.stream()
                    .max(Comparator.comparing(Task::getId))
                    .orElseThrow();

            for (Task t : existingTasks) {
                if (!t.getId().equals(primary.getId())) {
                    t.setMechanicId(null);
                    if (t.getStatus() != TaskStatus.COMPLETED) {
                        t.setStatus(TaskStatus.CANCELLED);
                    }
                    taskRepository.save(t);
                }
            }

            primary.setMechanicId(mechanic.getId());
            if (primary.getStatus() == TaskStatus.CANCELLED) {
                primary.setStatus(TaskStatus.PENDING);
            }
            taskRepository.save(primary);

        } else {
            taskService.createTaskForBooking(booking, booking.getAdminId());
        }
    }


    // --------------------------------------------------
    // STATUS UPDATE
    // --------------------------------------------------
    public Booking updateBookingStatus(Long bookingId, String newStatus) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 🔒 Prevent duplicate completion
        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Completed booking cannot be modified");
        }

        booking.setStatus(newStatus.toUpperCase());
        booking.setCompleted("COMPLETED".equalsIgnoreCase(newStatus));

        
        // ✅ SEND EMAIL ONLY ON COMPLETION (NO SCHEDULER, NO DUPLICATES)
        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {

            if (booking.getUser() != null && booking.getUser().getEmail() != null) {
                emailService.sendEmail(
                    booking.getUser().getEmail(),
                    "Service Completed",
                    "Your booking has been successfully completed."
                );
            }

            if (booking.getCustomerEmail() != null) {
                emailService.sendEmail(
                    booking.getCustomerEmail(),
                    "Service Completed",
                    "Your service has been successfully completed."
                );
            }
        }

        return bookingRepository.save(booking);
    }


    // --------------------------------------------------
    // CANCEL BOOKING
    // --------------------------------------------------
    public Booking cancelBooking(Long bookingId, String cancelReason) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("CANCELLED");
        booking.setCompleted(false);
        booking.setCancelledAt(LocalDateTime.now());

        Long adminId = resolveCurrentUserIdIfAdmin();
        if (adminId != null) booking.setCancelledBy(adminId);

        if (cancelReason != null && !cancelReason.isBlank()) {
            booking.setMechanicRemarks(cancelReason.trim());
        }

        bookingRepository.save(booking);

        List<Task> tasks = taskRepository.findByBooking(booking);
        if (tasks != null) {
            for (Task t : tasks) {
                if (t.getStatus() != TaskStatus.COMPLETED) {
                    t.setStatus(TaskStatus.CANCELLED);
                }
                t.setMechanicId(null);
                taskRepository.save(t);
            }
        }

        return booking;
    }

    // --------------------------------------------------
    // ADMIN DETECTION
    // --------------------------------------------------
    private Long resolveCurrentUserIdIfAdmin() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) return null;

            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) return null;

            return userRepository.findByEmail(auth.getName())
                    .map(User::getUserId)
                    .orElse(null);

        } catch (Exception ex) {
            return null;
        }
    }

    // --------------------------------------------------
    // DELETE BOOKING
    // --------------------------------------------------
    public void deleteBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        List<Task> tasks = taskRepository.findByBooking(booking);
        if (tasks != null && !tasks.isEmpty()) {
            taskRepository.deleteAll(tasks);
        }

        bookingRepository.delete(booking);
    }

    // --------------------------------------------------
    // REPORTS & SUMMARY
    // --------------------------------------------------
    public List<MechanicReportDTO> getMechanicReports() {

        Long adminId = resolveCurrentUserIdIfAdmin();
        if (adminId == null) {
            throw new RuntimeException("Admin context not found");
        }

        return bookingRepository.findByAdminId(adminId).stream()
                .filter(b -> b.isCompleted() && b.getMechanic() != null && b.getMechanic().getName() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        b -> b.getMechanic().getName(),
                        java.util.stream.Collectors.counting()
                ))
                .entrySet().stream()
                .map(e -> new MechanicReportDTO(e.getKey(), e.getValue()))
                .toList();
    }


    public BookingSummaryDTO getBookingSummary() {

        Long adminId = resolveCurrentUserIdIfAdmin();
        if (adminId == null) {
            throw new RuntimeException("Admin context not found");
        }

        int total = (int) bookingRepository.countByAdminId(adminId);

        return new BookingSummaryDTO(
                total,
                (int) bookingRepository.countByAdminIdAndStatus(adminId, "PENDING"),
                (int) bookingRepository.countByAdminIdAndStatus(adminId, "CONFIRMED"),
                (int) bookingRepository.countByAdminIdAndStatus(adminId, "ONGOING"),
                (int) bookingRepository.countByAdminIdAndStatus(adminId, "COMPLETED"),
                (int) bookingRepository.countByAdminIdAndStatus(adminId, "CANCELLED")
        );
    }
}
