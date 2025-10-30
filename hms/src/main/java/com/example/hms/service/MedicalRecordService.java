// src/main/java/com/example/hms/service/MedicalRecordService.java
package com.example.hms.service;

import com.example.hms.dto.MedicalRecordDto;
import com.example.hms.dto.MedicalRecordRequest;
import com.example.hms.enums.RoleName;
import com.example.hms.model.Appointment;
import com.example.hms.model.AppointmentStatus;
import com.example.hms.model.Doctor;
import com.example.hms.model.MedicalRecord;
import com.example.hms.model.Patient;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.MedicalRecordRepository;
import com.example.hms.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    @Autowired private MedicalRecordRepository recordRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private SecurityHelper securityHelper; // Custom helper for current user info
    @Autowired private AppointmentRepository appointmentRepository;
    // --- Utility Method for Mapping ---
    private MedicalRecordDto mapToDto(MedicalRecord record) {
        MedicalRecordDto dto = new MedicalRecordDto();
        dto.setId(record.getId());
        dto.setRecordedAt(record.getRecordedAt());
        dto.setConsultationNotes(record.getConsultationNotes());
        dto.setDiagnosis(record.getDiagnosis());
        
        dto.setDoctorId(record.getDoctor().getId());
        dto.setDoctorName(record.getDoctor().getName());
        
        dto.setPatientId(record.getPatient().getId());
        dto.setPatientName(record.getPatient().getName());
        return dto;
    }

    // ----------------------------------------------------------------------
    // VIEWING LOGIC (RBAC Enforcement)
    // ----------------------------------------------------------------------
    public List<MedicalRecordDto> getRecordsAccessibleByCurrentUser() {
        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();
        
        List<MedicalRecord> records;
        
        if (role == RoleName.ROLE_ADMIN) {
            // Admin sees all records
            records = recordRepository.findAll();
        } else if (role == RoleName.ROLE_DOCTOR) {
            // Doctor: Only sees records they authored.
            Doctor doctor = doctorRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Doctor profile missing."));
            
            records = recordRepository.findByDoctorId(doctor.getId());
            
        } else if (role == RoleName.ROLE_PATIENT) {
            // Patient: Only sees their own records.
            Patient patient = patientRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Patient profile missing."));
            
            records = recordRepository.findByPatientId(patient.getId()); 
        } else {
             return List.of();
        }
        
        return records.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ----------------------------------------------------------------------
    // CREATION LOGIC (Doctor Only)
    // ----------------------------------------------------------------------
 // src/main/java/com/example/hms/service/MedicalRecordService.java

    public MedicalRecordDto createRecord(MedicalRecordRequest request) {
        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();

        if (role != RoleName.ROLE_DOCTOR && role != RoleName.ROLE_ADMIN) {
            throw new AccessDeniedException("Only Doctors and Admins can create medical records.");
        }

        // 1. Identify the Doctor writing the record using the JWT
        Doctor treatingDoctor = doctorRepository.findByUserId(currentUserId)
            .orElseThrow(() -> new EntityNotFoundException("Doctor profile not found for logged-in user."));
        
        // 2. Fetch and validate the specific Appointment instance using the new ID
        // NOTE: Appointment must be fetched by its primary key ID from the request.
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
            .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));
        
        // 3. Find the Patient using the ID linked in the appointment
        Patient patient = appointment.getPatient();

        // 4. CRITICAL SECURITY CHECK (Doctor ID Mismatch): 
        // Ensure the doctor writing the record is the one authenticated via the token.
        if (!appointment.getDoctor().getId().equals(treatingDoctor.getId()) && role != RoleName.ROLE_ADMIN) {
             throw new AccessDeniedException("Security violation: You can only record treatment for appointments assigned to you.");
        }
        
        // 5. CRITICAL CONSTRAINT CHECK: Prevent double documentation
        if (recordRepository.existsByAppointmentId(appointment.getId())) {
            throw new IllegalArgumentException("Medical Record already exists for Appointment ID: " + appointment.getId());
        }
        
        // 6. Create the new Medical Record
        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(treatingDoctor); 
        
        // CRITICAL FIX: Link the new record directly to the Appointment instance
        record.setAppointment(appointment); 
        
        record.setDiagnosis(request.getDiagnosis());
        record.setConsultationNotes(request.getConsultationNotes());
        record.setRecordedAt(LocalDateTime.now());

        // 7. Automatically update the Appointment Status to COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment); // Save the status change
        
        // 8. Save the Medical Record
        MedicalRecord savedRecord = recordRepository.save(record);
        
        return mapToDto(savedRecord);
    }
    public MedicalRecordDto getRecordById(Long recordId) {
        MedicalRecord record = recordRepository.findById(recordId)
            .orElseThrow(() -> new EntityNotFoundException("Medical Record not found with ID: " + recordId));

        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();

        if (role == RoleName.ROLE_DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AccessDeniedException("Doctor profile missing."));
            
            // Check if the appointment or record involves the logged-in doctor
//            if (!record.getDoctor().getId().equals(doctor.getId())) {
//                 throw new AccessDeniedException("You are not authorized to view this record.");
//            }
        }
        // Patient authorization check would also be needed here if fetching by record ID

        return mapToDto(record);
    }
}