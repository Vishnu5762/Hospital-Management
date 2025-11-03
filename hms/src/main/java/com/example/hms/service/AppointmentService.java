package com.example.hms.service;

import com.example.hms.dto.AppointmentDto;
import com.example.hms.dto.AppointmentRequest;
import com.example.hms.enums.RoleName;
import com.example.hms.model.Appointment;
import com.example.hms.model.AppointmentStatus;
import com.example.hms.model.Doctor;
import com.example.hms.model.Patient;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.MedicalRecordRepository;
import com.example.hms.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private SecurityHelper securityHelper; 
    @Autowired private MedicalRecordRepository medicalRecordRepository;

    // --- Utility Method for Mapping ---
    private AppointmentDto mapToDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setReason(appointment.getReason());
        dto.setStatus(appointment.getStatus());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getName());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getName());
        
        // Finalized Display Fields
        dto.setDisplayTime(appointment.getDisplayTime());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        
        // Record Check
        boolean recordExists = medicalRecordRepository.existsByAppointmentId(appointment.getId()); 
        dto.setHasRecord(recordExists);
        
        return dto;
    }

    // --- Appointment Booking Logic ---
    public AppointmentDto bookAppointment(AppointmentRequest request) {
    	Long currentUserId = securityHelper.getCurrentUserId();
        RoleName role = securityHelper.getCurrentUserRole();
        
        // 1. Determine Patient Profile
        Patient patient;
        if (role == RoleName.ROLE_PATIENT) {
            patient = patientRepository.findByUserId(currentUserId) 
                .orElseThrow(() -> new EntityNotFoundException("Patient profile not found for logged-in user."));
        } else {
            patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + request.getPatientId()));
        }
        
        // 2. Find Doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        // 3. Create Appointment
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setDisplayTime(request.getDisplayTimeString());
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToDto(savedAppointment);
    }
    
    // --- Appointment Viewing/Filtering Logic (FINAL INTEGRATED VERSION) ---
    /**
     * Retrieves appointments accessible by the logged-in user.
     * If all date params are null, it fetches ALL. 
     * If the user is a DOCTOR, it fetches TODAY's schedule by default when no filters are sent.
     */
    public List<AppointmentDto> getAppointmentsForCurrentUser(LocalDate startDate, LocalDate endDate) {
        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();
        
        // Determine if the request is a simple unfettered fetch (no date filtering)
        boolean isFilteringByDate = (startDate != null || endDate != null);
        
        List<Appointment> appointments;
        
        if (role == RoleName.ROLE_ADMIN) {
            if (isFilteringByDate) {
                 LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : LocalDateTime.MIN;
                 LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.MAX;
                 appointments = appointmentRepository.findByAppointmentTimeBetween(startDateTime, endDateTime);
            } else {
                 appointments = appointmentRepository.findAll();
            }
        } else if (role == RoleName.ROLE_DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Doctor profile missing."));
            
            // Doctor Dashboard Logic: If no dates are provided, fetch TODAY's appointments by default.
            if (!isFilteringByDate) {
                 // Fetch TODAY's schedule (Dashboard View)
                 
                 appointments = appointmentRepository.findByDoctorId(
                    doctor.getId());
            } else {
                 // If dates ARE provided (from the general list's filter component), use the full range
                 LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : LocalDateTime.MIN;
                 LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.MAX;
                 appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                    doctor.getId(), startDateTime, endDateTime);
            }
        } else if (role == RoleName.ROLE_PATIENT) {
             Patient patient = patientRepository.findByUserId(currentUserId)
                     .orElseThrow(() -> new EntityNotFoundException("Patient profile missing."));
                     
             if (isFilteringByDate) {
         
                 appointments = appointmentRepository.findByPatientId(
                     patient.getId());
             } else {
                 // Patient List View (no filter): Fetch ALL appointments
                 appointments = appointmentRepository.findByPatientId(patient.getId()); 
             }
        } else {
            return List.of(); 
        }
        
        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
    }
 // src/main/java/com.example.hms.service.AppointmentService (Add this method)

    public List<AppointmentDto> getTodayAppointmentsForDoctor() {
        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();
        
        // Authorization Check: Ensure only Doctors can call this dedicated endpoint
        if (role != RoleName.ROLE_DOCTOR) {
            throw new AccessDeniedException("Access denied: This function is only for doctors.");
        }
        
        // 1. Find the Doctor Profile linked to the user
        Doctor doctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile missing."));
                
        // 2. Define today's boundaries strictly
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX); // Includes 23:59:59

        // 3. Fetch appointments using the bounded query
        List<Appointment> appointments = appointmentRepository
            .findByDoctorIdAndAppointmentTimeBetween(
                doctor.getId(), 
                startOfToday, 
                endOfToday
            );
        
        // 4. Map and return
        return appointments.stream().map(this::mapToDto).collect(Collectors.toList());
    }
    // --- Status Update Logic ---
    public AppointmentDto updateStatus(Long appointmentId, AppointmentStatus newStatus) {
        RoleName role = securityHelper.getCurrentUserRole();
        Long currentUserId = securityHelper.getCurrentUserId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));

        // CRITICAL SECURITY CHECK (DOCTOR ONLY)
        if (role == RoleName.ROLE_DOCTOR) {
            Doctor treatingDoctor = doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AccessDeniedException("Doctor profile missing or not linked to user."));
            
            if (!appointment.getDoctor().getId().equals(treatingDoctor.getId())) {
                throw new AccessDeniedException("Authorization failed: You cannot update appointments belonging to another doctor.");
            }
        }
        
        appointment.setStatus(newStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        return mapToDto(savedAppointment); 
    }
}