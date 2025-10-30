package com.example.hms.repository;

import com.example.hms.model.Appointment;
import com.example.hms.model.AppointmentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // --- Default Finders (Used when no date filter is applied on UI) ---

    // 1. Retrieve all for a specific doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // 2. Retrieve all for a specific patient
    List<Appointment> findByPatientId(Long patientId);


    // --- Status/ID Specific Finder (Used in MedicalRecordService for status auto-update) ---

    // 3. Find by Patient, Doctor, and specific Status
    Optional<Appointment> findByPatientIdAndDoctorIdAndStatus(
        Long patientId, 
        Long doctorId, 
        AppointmentStatus status
    );


    // --- Filtered Finders (Used when date filter is applied on UI) ---

    // 4. DOCTOR: Filtered by ID and Date Range
    // NOTE: Changed parameter name from 'id' to 'doctorId' for clarity
    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(Long doctorId, LocalDateTime startDateTime,
        LocalDateTime endDateTime);

    // 5. PATIENT: Filtered by ID and Date Range
    // NOTE: This method was duplicated and incorrectly named. Correct name used here.
    List<Appointment> findByPatientIdAndAppointmentTimeBetween(Long patientId, LocalDateTime startDateTime,
        LocalDateTime endDateTime);

    // 6. ADMIN: Filtered by Date Range (Global Filter)
    List<Appointment> findByAppointmentTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}