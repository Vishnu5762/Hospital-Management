package com.example.hms.dto;

import com.example.hms.model.AppointmentStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AppointmentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private String reason;
    private boolean hasRecord;
    private String displayTime;
}
