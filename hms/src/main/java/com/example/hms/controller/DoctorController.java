// src/main/java/com/example/hms/controller/DoctorController.java
package com.example.hms.controller;

import com.example.hms.dto.DoctorListDto;
import com.example.hms.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    /**
     * GET /api/doctors
     * Allows: Any authenticated user (Admin, Patient, Doctor) to see all doctors.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()") // Only requires a valid JWT token
    public ResponseEntity<List<DoctorListDto>> getAllDoctors() {
        List<DoctorListDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }
}