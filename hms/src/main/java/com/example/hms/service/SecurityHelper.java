
package com.example.hms.service;

import com.example.hms.enums.RoleName;
import com.example.hms.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;


@Component
public class SecurityHelper {

    private UserDetailsImpl getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated or context not available.");
        }
        
        // The principal is typically your custom UserDetailsImpl after JWT validation
        if (authentication.getPrincipal() instanceof UserDetailsImpl) {
            return (UserDetailsImpl) authentication.getPrincipal();
        }
        
        throw new IllegalStateException("Authentication principal is not of type UserDetailsImpl.");
    }

    
    public Long getCurrentUserId() {
        return getCurrentUserDetails().getId();
    }

    
    public RoleName getCurrentUserRole() {
        String roleName = getCurrentUserDetails().getAuthorities().stream()
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("User has no assigned role."))
                            .getAuthority();
        return RoleName.valueOf(roleName); 
    }
}