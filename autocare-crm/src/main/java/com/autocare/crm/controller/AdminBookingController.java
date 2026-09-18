package com.autocare.crm.controller;

import com.autocare.crm.dto.*;
import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.BookingRepository;
import com.autocare.crm.repository.UserRepository;
import com.autocare.crm.service.BookingService;
import com.autocare.crm.service.NotificationService;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AdminBookingController(
            BookingRepository bookingRepository,
            BookingService bookingService,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody AdminBookingRequestDTO dto) {
        bookingService.createAdminWalkInBooking(dto);
        return ResponseEntity.ok("Booking created successfully");
    }

    // ✅ CRITICAL FIX — ADMIN ISOLATION
    @GetMapping
    public List<Booking> getAllBookings() {
        User admin = getCurrentLoggedInUser();
        return bookingRepository.findByAdminId(admin.getUserId());
    }

    @PutMapping("/{bookingId}/assign-mechanic")
    public ResponseEntity<?> assignMechanic(
            @PathVariable Long bookingId,
            @RequestBody AssignMechanicRequest request
    ) {
        bookingService.assignMechanicAndCreateTask(bookingId, request.getMechanicId());
        return ResponseEntity.ok("Mechanic assigned successfully");
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody(required = false) CancelRequestDTO body
    ) {
        String reason = body != null ? body.getReason() : null;
        Booking cancelled = bookingService.cancelBooking(bookingId, reason);

        User customer = cancelled.getUser();
        if (customer != null) {
            notificationService.sendBookingCancellationEmail(customer, cancelled, reason);
            notificationService.sendBookingCancellationSms(customer, cancelled, reason);
        }
        return ResponseEntity.ok(cancelled);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok("Booking deleted");
    }

    @GetMapping("/summary")
    public ResponseEntity<BookingSummaryDTO> getSummary() {
        return ResponseEntity.ok(bookingService.getBookingSummary());
    }

    @PutMapping("/{id}/charges")
    public ResponseEntity<?> updateBookingCharges(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body
    ) {
        Double charges = body.get("charges");

        if (charges == null) {
            return ResponseEntity.badRequest().body("Charges are required");
        }

        bookingService.updateBookingCharges(id, charges);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/filter")
    public List<Booking> filterBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (status == null || startDate == null || endDate == null) {
            User admin = getCurrentLoggedInUser();
            return bookingRepository.findByAdminId(admin.getUserId());
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        User admin = getCurrentLoggedInUser();

        return bookingRepository.findByAdminId(admin.getUserId()).stream()
                .filter(b ->
                        status.equalsIgnoreCase(b.getStatus()) &&
                        b.getBookingDate().isAfter(start) &&
                        b.getBookingDate().isBefore(end)
                )
                .toList();
    }

    // ✅ EXISTING STYLE — CURRENT LOGGED-IN ADMIN
    private User getCurrentLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new RuntimeException("Unauthorized");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
} 