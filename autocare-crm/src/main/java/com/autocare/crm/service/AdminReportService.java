package com.autocare.crm.service;

import com.autocare.crm.dto.CustomerReportDTO;
import com.autocare.crm.dto.MechanicReportDTO;
import com.autocare.crm.dto.ReportSummaryDTO;
import com.autocare.crm.entity.Booking;
import com.autocare.crm.entity.User;
import com.autocare.crm.repository.BookingRepository;
import com.autocare.crm.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminReportService {

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private UserRepository userRepository;

    // --------------------------------------------------
    // 🔐 CURRENT LOGGED-IN ADMIN (SINGLE SOURCE OF TRUTH)
    // --------------------------------------------------
    private User getCurrentAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new RuntimeException("Unauthorized");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    // --------------------------------------------------
    // 📊 ADMIN DASHBOARD SUMMARY (ADMIN-SCOPED)
    // --------------------------------------------------
    public ReportSummaryDTO getSummary(LocalDateTime startDate, LocalDateTime endDate) {

        User admin = getCurrentAdmin();

        List<Booking> adminBookings =
                bookingRepo.findByAdminId(admin.getUserId());

        long total = adminBookings.size();

        long pending = adminBookings.stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .count();

        long confirmed = adminBookings.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .count();

        long ongoing = adminBookings.stream()
                .filter(b -> "ONGOING".equalsIgnoreCase(b.getStatus()))
                .count();

        long completed = adminBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()))
                .count();

        long cancelled = adminBookings.stream()
                .filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();

        double revenue = adminBookings.stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getCharges() != null ? b.getCharges() : 0)
                .sum();

        return new ReportSummaryDTO(
                total,
                pending,
                confirmed,
                ongoing,
                completed,
                cancelled,
                revenue
        );
    }

    // --------------------------------------------------
    // 👨‍🔧 MECHANIC LOAD REPORT (ADMIN-SCOPED)
    // --------------------------------------------------
    public Map<String, Long> getMechanicLoad() {

        User admin = getCurrentAdmin();

        List<Booking> adminBookings =
                bookingRepo.findByAdminId(admin.getUserId());

        return adminBookings.stream()
                .filter(b -> b.getMechanic() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getMechanic().getName(),
                        Collectors.counting()
                ));
    }
    // ✅ COMPLETED JOBS ONLY
    public List<MechanicReportDTO> getMechanicReport() {
        User admin = getCurrentAdmin();
        return bookingRepo.findByAdminId(admin.getUserId()).stream()
                .filter(b -> "COMPLETED".equalsIgnoreCase(b.getStatus()) && b.getMechanic() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getMechanic().getName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(e -> new MechanicReportDTO(e.getKey(), e.getValue()))
                .toList();
    }

	public BookingRepository getBookingRepo() {
		return bookingRepo;
	}

	public void setBookingRepo(BookingRepository bookingRepo) {
		this.bookingRepo = bookingRepo;
	}

	public UserRepository getUserRepository() {
		return userRepository;
	}

	public void setUserRepository(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public List<CustomerReportDTO> getCustomerHistory(Long customerId) {
		// TODO Auto-generated method stub
        User admin = getCurrentAdmin();

        return bookingRepo.findByAdminId(admin.getUserId()).stream()
                .filter(b -> b.getUser() != null && customerId.equals(b.getUser().getUserId()))
                .sorted((a, b) -> {
                    if (a.getBookingDate() == null || b.getBookingDate() == null) return 0;
                    return b.getBookingDate().compareTo(a.getBookingDate());
                })
                .map(b -> new CustomerReportDTO(
                        b.getId(),
                        b.getBookingDate(),
                        b.getStatus(),
                        b.getService() != null
                                ? b.getService().getPrice()
                                : (b.getCharges() != null ? b.getCharges() : 0)
                ))
                .toList();
    }
		
}
