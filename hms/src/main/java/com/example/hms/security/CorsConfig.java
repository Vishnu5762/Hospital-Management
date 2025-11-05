package com.example.hms.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // IMPORTANT: Replace this placeholder with your actual live React frontend domain.
    // Assuming your frontend deployed on Render is: hospital-management-a9qk.onrender.com
    private static final String FRONTEND_DOMAIN = "https://hospital-management-a9qk.onrender.com"; 
    
    // NOTE: You must also ensure that the backend application is running under the 
    // com.example.hms.config package structure, as defined here.

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS policy to all /api endpoints
                
                // Whitelist your local development domain and the deployed production domain
                .allowedOrigins("http://localhost:3000", FRONTEND_DOMAIN) 
                
                // Allow necessary HTTP methods for login, CRUD, and status updates
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                
                // CRITICAL FIX: Allow all headers, which includes the 'Authorization' header for JWTs
                .allowedHeaders("*") 
                
                // Allow cookies and authorization credentials
                .allowCredentials(true); 
    }
}
