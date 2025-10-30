package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor 
public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String role;
    private String name;
    private final String type = "Bearer"; 
}
