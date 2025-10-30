
package com.example.hms.controller;

import com.example.hms.dto.AppointmentDto;
import com.example.hms.dto.AppointmentRequest;
import com.example.hms.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.PatchMapping; // <-- NEW IMPORT
import org.springframework.web.bind.annotation.PathVariable; // <-- NEW IMPORT
import com.example.hms.model.AppointmentStatus;
import java.time.LocalDate;
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<AppointmentDto> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentDto appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AppointmentDto> updateAppointmentStatus(
        @PathVariable Long id,
        @RequestParam AppointmentStatus status) { 

        AppointmentDto updatedAppt = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(updatedAppt);
    }
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // Pass the date parameters to the service layer
        List<AppointmentDto> appointments = appointmentService.getAppointmentsForCurrentUser(startDate, endDate);
        return ResponseEntity.ok(appointments);
    }
    @GetMapping("/today")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentDto>> getTodayAppointments() {
        // Calls the new service method
        List<AppointmentDto> appointments = appointmentService.getTodayAppointmentsForDoctor();
        return ResponseEntity.ok(appointments);
    }
    
}