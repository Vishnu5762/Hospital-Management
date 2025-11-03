package com.example.hms.service;

import com.example.hms.dto.RegisterRequest;
import com.example.hms.enums.RoleName;
import com.example.hms.model.Doctor;
import com.example.hms.model.Patient;
import com.example.hms.model.User;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.PatientRepository;
import com.example.hms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PatientRepository patientRepository;

    /**
     * Registers a new User and creates a linked Doctor or Patient profile,
     * mapping specific details from the RegisterRequest DTO.
     */
    public String getFullNameByUserId(Long userId, RoleName role) {
        if (role == RoleName.ROLE_DOCTOR) {
            return doctorRepository.findByUserId(userId)
                    .map(Doctor::getName)
                    .orElse("Dr. Guest");
        } else if (role == RoleName.ROLE_PATIENT) {
            return patientRepository.findByUserId(userId)
                    .map(Patient::getName)
                    .orElse("Patient");
        }
        return "Admin"; // Default for Admin
    }
    public User registerNewUser(RegisterRequest signUpRequest) {
        
        // 1. Create base User (maps username and encoded password)
        User user = new User(
            signUpRequest.getUsername(),
            passwordEncoder.encode(signUpRequest.getPassword()),
            signUpRequest.getRole()
        );
        User savedUser = userRepository.save(user);

        // 2. Create corresponding Profile based on Role
        if (signUpRequest.getRole() == RoleName.ROLE_DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            
            // CRITICAL FIX: Use fullName from the DTO for display name
            doctor.setName(signUpRequest.getFullName()); 
            doctor.setSpecialization(signUpRequest.getSpecialization());
            doctor.setPhone(signUpRequest.getMobileNumber()); // Map phone number
            
            doctorRepository.save(doctor);
            
        } else if (signUpRequest.getRole() == RoleName.ROLE_PATIENT) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            
            // CRITICAL FIX: Use fullName from the DTO for display name
            patient.setName(signUpRequest.getFullName()); 
            patient.setPhone(signUpRequest.getMobileNumber()); // Map phone number
            
            // NOTE: dateOfBirth should ideally come from the DTO/form, using a placeholder here:
            patient.setDateOfBirth(LocalDate.now()); 
            
            patientRepository.save(patient);
        }
        
        return savedUser;
    }
}