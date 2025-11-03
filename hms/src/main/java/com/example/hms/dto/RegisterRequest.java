package com.example.hms.dto;

import com.example.hms.enums.RoleName;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Size;

@Data // Automatically generates all getters, setters, toString, etc.
public class RegisterRequest {
    
    // --- User Authentication Fields ---
	@NotBlank(message = "Username is required.")
    @Size(min = 3, max = 60, message = "Username size must be between 3 and 60 characters.")
    private String username;
    
    @NotBlank(message = "Password is required.")
    @Size(min = 6, max = 40)
    private String password;
    
    // --- Profile Display & Contact Fields ---
    @NotBlank(message = "Full Name is required.")
    private String fullName; // For Doctor.name and Patient.name
    
    @NotBlank(message = "Mobile Number is required.")
    private String mobileNumber; // For Doctor.phone and Patient.phoneNumber

    // --- Role and Specialization Fields ---
    private RoleName role; // The selected role (ROLE_DOCTOR or ROLE_PATIENT)
    
    // Doctor Specific (Required only when role is DOCTOR)
    private String specialization; 
    
    // NOTE: All manual getter methods (getFullName, getMobileNumber, etc.) 
    // were removed because Lombok's @Data handles them, which is the preferred approach.
}