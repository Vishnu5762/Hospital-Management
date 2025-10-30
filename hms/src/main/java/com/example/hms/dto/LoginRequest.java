package com.example.hms.dto;

//Using jakarta.validation for constraints (optional, but good practice)
import jakarta.validation.constraints.NotBlank;
import lombok.Data; 

@Data 
public class LoginRequest {
 @NotBlank
 private String username;
 
 @NotBlank
 private String password;
}
