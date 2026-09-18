package com.autocare.crm.controller;

import com.autocare.crm.dto.BookingRequestDTO;
import com.autocare.crm.entity.*;
import com.autocare.crm.repository.*;
import com.autocare.crm.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
public class BookingController {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BookingService bookingService;

    // --------------------------------------------------
    // GET ALL BOOKINGS
    // --------------------------------------------------
    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // --------------------------------------------------
    // USER BOOKINGS
    // --------------------------------------------------
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<Booking> getMyBookings(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();
        return bookingRepository.findByUser_UserId(user.getUserId());
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<Booking> getUpcomingBookings(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow();
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.findByUser_UserIdAndBookingDateAfter(user.getUserId(), now).stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus())
                        && !"COMPLETED".equalsIgnoreCase(b.getStatus()))
                .toList();
    }

    // --------------------------------------------------
    // CREATE USER BOOKING  ✅ FIXED
    // --------------------------------------------------
    @PostMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public Booking createMyBooking(
            @RequestBody BookingRequestDTO dto,
            Authentication auth
    ) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getAdminId() == null) {
            throw new RuntimeException("Admin ID (garage) is required");
        }

        User admin = userRepository.findById(dto.getAdminId())
                .orElseThrow(() -> new RuntimeException("Garage admin not found"));

        Booking booking = new Booking();

        // 👤 Customer snapshot
        booking.setUser(user);
        booking.setCustomerName(user.getName());
        booking.setCustomerEmail(user.getEmail());
        booking.setCustomerPhone(user.getPhoneNumber());

        // 🚗 Vehicle snapshot
        booking.setVehicleModel(dto.getVehicleModel());
        booking.setVehicleNumber(dto.getLicensePlate());

        // 🛠 Service snapshot
        booking.setServiceName(dto.getServiceType());

        // ⏰ Date + Time
        booking.setBookingDate(resolveBookingDateTime(dto.getBookingDate(), dto.getSlotTime()));
        booking.setSlotTime(dto.getSlotTime());
        booking.setStatus("PENDING");

        // 🔥🔥🔥 CRITICAL FIX — LINK ADMIN PROPERLY
   
        booking.setAdminId(admin.getUserId());   // ✅ FK column safety

        return bookingRepository.save(booking);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public Booking createBooking(
            @RequestBody BookingRequestDTO dto,
            Authentication auth
    ) {
        return createMyBooking(dto, auth);
    }

    private LocalDateTime resolveBookingDateTime(String bookingDate, String slotTime) {
        if (bookingDate == null || bookingDate.isBlank()) {
            throw new RuntimeException("Booking date is required");
        }
        try {
            if (bookingDate.contains("T")) {
                String value = bookingDate.length() == 16 ? bookingDate + ":00" : bookingDate;
                return LocalDateTime.parse(value);
            }
            return java.time.LocalDate.parse(bookingDate).atTime(parseSlotTime(slotTime));
        } catch (Exception ex) {
            return java.time.LocalDate.parse(bookingDate.substring(0, 10)).atTime(parseSlotTime(slotTime));
        }
    }

    // --------------------------------------------------
    // SLOT TIME PARSER (24h + AM/PM)
    // --------------------------------------------------
    private LocalTime parseSlotTime(String slotTime) {
        try {
            // Try 24-hour format: HH:mm
            return LocalTime.parse(slotTime);
        } catch (Exception e) {
            // Fallback to 12-hour format: hh:mm AM/PM
            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
            return LocalTime.parse(slotTime.toUpperCase(), formatter);
        }
    }

    // --------------------------------------------------
    // STATUS FILTERS
    // --------------------------------------------------
    @GetMapping("/status/{status}")
    public List<Booking> getByStatus(@PathVariable String status) {
        return bookingRepository.findByStatus(status);
    }

    @GetMapping("/paged/status/{status}")
    public Page<Booking> pagedByStatus(
            @PathVariable String status,
            Pageable pageable
    ) {
        return bookingRepository.findByStatus(status, pageable);
    }

    // --------------------------------------------------
    // DELETE BOOKING (ADMIN)
    // --------------------------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
