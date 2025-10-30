// src/main/java/com/example/hms/dto/MedicalRecordRequest.java
package com.example.hms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MedicalRecordRequest {
    @NotNull
    private Long patientId;
    
    // doctorId is sent from the frontend URL, but the backend must verify and overwrite
    @NotNull 
    private Long doctorId; 
    @NotNull
    private Long appointmentId;
    @NotBlank
    private String diagnosis;
    
    @NotBlank
    private String consultationNotes;
}