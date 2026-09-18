package com.autocare.crm.controller;

import com.autocare.crm.entity.Booking;
import com.autocare.crm.repository.BookingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking-history")
public class BookingHistoryController {

    private final BookingRepository bookingRepository;

    public BookingHistoryController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Booking> getHistory(@PathVariable Long vehicleId) {
        return bookingRepository.findAll().stream()
                .filter(b ->
                        b.getVehicle() != null &&
                        b.getVehicle().getId().equals(vehicleId)
                )
                .toList();
    }

    @GetMapping("/vehicle/{vehicleId}/status/{status}")
    public List<Booking> getHistoryFiltered(
            @PathVariable Long vehicleId,
            @PathVariable String status
    ) {
        return bookingRepository.findAll().stream()
                .filter(b ->
                        b.getVehicle() != null &&
                        b.getVehicle().getId().equals(vehicleId) &&
                        status.equalsIgnoreCase(b.getStatus())
                )
                .toList();
    }
}


