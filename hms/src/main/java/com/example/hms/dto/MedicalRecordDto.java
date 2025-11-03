// src/main/java/com/example/hms/dto/MedicalRecordDto.java
package com.example.hms.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class MedicalRecordDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime recordedAt;
    private String consultationNotes;
    private String diagnosis;
}