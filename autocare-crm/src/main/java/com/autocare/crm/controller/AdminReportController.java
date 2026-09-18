package com.autocare.crm.controller;

import com.autocare.crm.dto.CustomerReportDTO;
import com.autocare.crm.dto.MechanicReportDTO;
import com.autocare.crm.dto.ReportSummaryDTO;
import com.autocare.crm.service.AdminReportService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    // -------------------- SUMMARY --------------------
    @GetMapping("/summary")
    public ReportSummaryDTO getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate
    ) {
        return adminReportService.getSummary(startDate, endDate);
    }

    // -------------------- MECHANIC PERFORMANCE --------------------
    @GetMapping("/mechanics")
    public List<MechanicReportDTO> mechanicPerformance(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate
    ) {
        return adminReportService.getMechanicReport();
    }

    // -------------------- CUSTOMER HISTORY --------------------
    @GetMapping("/customers")
    public List<CustomerReportDTO> customerHistory(
            @RequestParam Long customerId
    ) {
        return adminReportService.getCustomerHistory(customerId);
    }
}
