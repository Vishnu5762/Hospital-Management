// src/main/java/com/example.hms.config/CorsConfig.java

package com.example.hms.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // You MUST replace this placeholder with the actual live domain of your React frontend.
    private static final String FRONTEND_URL = "https://hospital-management-a9qk.onrender.com"; 

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply this policy to all API endpoints
                .allowedOrigins("http://localhost:3000", FRONTEND_URL) // Whitelist local and production domain
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*") // Allow all headers (Content-Type, Authorization)
                .allowCredentials(true); // Allow credentials (for future cookie/auth needs)
    }
}
