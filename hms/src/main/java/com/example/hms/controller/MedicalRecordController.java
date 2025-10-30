// src/main/java/com/example/hms/controller/MedicalRecordController.java
package com.example.hms.controller;

import com.example.hms.dto.MedicalRecordDto;
import com.example.hms.dto.MedicalRecordRequest;
import com.example.hms.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService recordService;

    /**
     * GET /api/records/my
     * Lists records accessible by the logged-in user (filtered by role).
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<List<MedicalRecordDto>> getMyAccessibleRecords() {
        List<MedicalRecordDto> records = recordService.getRecordsAccessibleByCurrentUser();
        return ResponseEntity.ok(records);
    }
    
    /**
     * POST /api/records
     * Allows Doctors/Admins to create a new medical record.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<MedicalRecordDto> createMedicalRecord(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecordDto record = recordService.createRecord(request);
        return ResponseEntity.ok(record);
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<MedicalRecordDto> getRecordById(@PathVariable Long id) {
        // NOTE: Service layer must enforce RBAC (Doctor only sees their own patients' records)
        MedicalRecordDto record = recordService.getRecordById(id); 
        return ResponseEntity.ok(record);
    }
}